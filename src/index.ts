#!/usr/bin/env node

import { Command } from 'commander';
import { fetchSchema } from './functionality/fetchSchema.js';
import { generateOperations } from './functionality/generateOperations.js';
import { writeFiles } from './functionality/writeFiles.js';
import { generateCodegenConfig } from './functionality/generateCodefenConfig.js';
import prompts from 'prompts';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs/promises';

const program = new Command();

program
    .requiredOption('--key <wize-api-key>', 'Wize API key')
    .option('--url <api-url>', 'GraphQL API URL', 'https://api.wize.works/graphql')
    .option('--output <path>', 'Output directory for graphql files', './graphql')
    .parse(process.argv);

const options = program.opts();

async function main() {
    const graphqlFolder = path.resolve(options.output);

    // Check if graphql output folder exists
    try {
        await fs.access(graphqlFolder);

        const response = await prompts({
            type: 'confirm',
            name: 'overwrite',
            message: chalk.yellow(`Folder ${options.output} already exists. Overwrite?`),
            initial: false,
        });

        if (!response.overwrite) {
            console.log(chalk.red('❌ Aborted. No files were overwritten.'));
            process.exit(0);
        } else {
            console.log(chalk.green('✅ Overwriting existing files.'));
        }
    } catch {
        // Folder does not exist — continue normally
    }

    console.log('🔄 Fetching schema from', options.url);

    const schema = await fetchSchema(options.url, options.key);

    console.log('🛠️  Generating operations...');

    const operations = generateOperations(schema);

    console.log('💾 Writing GraphQL files to', options.output);

    await writeFiles(operations, graphqlFolder);

    console.log('🛠️  Generating codegen.yml...');

    await generateCodegenConfig(graphqlFolder);

    console.log(chalk.green('\n✅ Done! GraphQL files and Codegen config are ready.\n'));

    console.log(chalk.green('🎉 Setup Complete!'));
    console.log(chalk.whiteBright('Next Steps:'));
    console.log('');
    console.log(chalk.yellow('1.') + ' Install GraphQL Codegen dependencies if you haven\'t yet:');
    console.log(chalk.cyan('   npm install --save-dev @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations @graphql-codegen/typescript-react-apollo'));
    console.log('');
    console.log(chalk.yellow('2.') + ' Run Codegen to generate your hooks and types:');
    console.log(chalk.cyan('   npx graphql-codegen'));
    console.log('');
    console.log(chalk.whiteBright('Generated GraphQL operations are in ') + chalk.cyan('./graphql/'));
    console.log(chalk.whiteBright('Generated TypeScript types and hooks will be in ') + chalk.cyan('./generated/graphql.ts') + chalk.whiteBright(' after running Codegen.'));
    console.log('');
    console.log(chalk.green('🚀 Happy coding!'));
}

main().catch((err) => {
    console.error(chalk.red('❌ Error:'), err);
    process.exit(1);
});
