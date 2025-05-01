import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
/**
 * Generate a codegen.yml file for GraphQL Code Generator
 * @param outputDir The folder where graphql operations were written
 * @param schemaUrl The full URL to the GraphQL API (example: https://api.wize.works/wize-project/graphql)
 * @param apiKey Your Wize API Key to authenticate fetching the schema
 */
export async function generateCodegenConfig(outputDir, schemaUrl, apiKey) {
    const config = {
        schema: [
            {
                [schemaUrl]: {
                    headers: {
                        'wize-api-key': `${apiKey}`,
                    }
                }
            }
        ],
        documents: './**/*.graphql', // Match queries, mutations, subscriptions under this folder
        generates: {
            './generated.ts': {
                plugins: [
                    'typescript',
                    'typescript-operations',
                    'typescript-urql',
                ],
                config: {
                    withHooks: true,
                    withHOC: false,
                    withComponent: false
                }
            }
        }
    };
    const codegenPath = path.join(outputDir, 'codegen.yml');
    await fs.writeFile(codegenPath, yaml.dump(config), 'utf-8');
}
