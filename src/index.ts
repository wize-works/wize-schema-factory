#!/usr/bin/env node

import { Command } from 'commander';
import { fetchSchema } from './functionality/fetchSchema.js';
import { generateOperations } from './functionality/generateOperations.js';
import { writeFiles } from './functionality/writeFiles.js';
import { generateCodegenConfig } from './functionality/generateCodegenConfig.js';
import { extractProjectNameFromUrl } from './functionality/utils.js';
import prompts from 'prompts';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs/promises';
import { execa } from 'execa';

const apis = [
    'wize-comment',
    'wize-content',
    'wize-finance',
    'wize-identity',
    'wize-inventory',
    'wize-log',
    'wize-media',
    'wize-messaging',
    'wize-organization',
    'wize-project',
    'wize-task',
];


const program = new Command();

program
    .name('wize-schema-factory')
    .description('CLI to generate GraphQL operations (queries/mutations/subscriptions) from Wize APIs')
    .version('1.0.1')
    .requiredOption('--key <wize-api-key>', 'Your Wize API key (required)')
    .option('--url <api-url>', 'Wize GraphQL API URL (default: https://api.wize.works/graphql)', 'https://api.wize.works/graphql')
    .option('--output <path>', 'Output directory for generated files', './graphql')
    .helpOption('-h, --help', 'Display help for command')
    .addHelpText('after', `
Examples:
  npx wize-schema-factory --key YOUR-WIZE-API-KEY
  npx wize-schema-factory --key YOUR-WIZE-API-KEY --output ./generated-graphql
  npx wize-schema-factory --key YOUR-WIZE-API-KEY --url https://api.wize.works/other-service/graphql
  `)
    .parse(process.argv);

const options = program.opts();

async function runCodegen(configPath: string) {
    try {
        console.log(chalk.cyan('\n🔧 Running GraphQL Codegen...'));

        const configDir = path.dirname(configPath);

        // Use a more compatible approach with no flags
        await execa('npx', ['graphql-codegen', 'codegen.yml'], {
            cwd: configDir,
            stdio: 'inherit'
        });

        console.log(chalk.green('✅ Codegen complete!'));
    } catch (error) {
        console.error(chalk.red(`❌ Codegen failed: ${(error as Error).message}`));
        process.exit(1);
    }
}

async function main() {

    for (const api of apis) {

        const apiUrl = `https://api.wize.works/${api}/graphql`;
        //const apiUrl = 'http://localhost:3005/graphql'
        const graphqlFolder = path.resolve(options.output);

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

        console.log('🔄 Fetching schema from', apiUrl);
        let schema;
        try {
            schema = await fetchSchema(apiUrl, options.key);
        } catch (error) {
            console.error(chalk.red('❌ Error fetching schema:'), error);
            return;
        }

        console.log('🛠️  Generating operations...');

        const operations = generateOperations(schema);

        const projectName = extractProjectNameFromUrl(apiUrl);
        const projectFolder = path.join(graphqlFolder, projectName);

        console.log('💾 Writing GraphQL files to', projectFolder);
        await writeFiles(operations, projectFolder);

        //console.log('🛠️  Generating codegen.yml...');
        // await generateCodegenConfig(projectFolder, options.url, options.key);

        //   await runCodegen(path.join(projectFolder, 'codegen.yml'));

        console.log(chalk.green('\n✅ Done! GraphQL files and Codegen config are ready.\n'));

        console.log(chalk.green('🎉 Setup Complete!'));
        console.log(chalk.whiteBright('Generated GraphQL operations are in ') + chalk.cyan(`./graphql/${projectName}/`));
        console.log(chalk.whiteBright('Generated TypeScript types will be in ') + chalk.cyan(`./graphql/${projectName}/generated.js`) + chalk.whiteBright(' after running Codegen.'));
        console.log('');
        console.log(chalk.green('🚀 Happy coding!'));
    }
}

main().catch((err) => {
    console.error(chalk.red('❌ Error:'), err);
    process.exit(1);
});
