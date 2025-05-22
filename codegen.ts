import type { CodegenConfig } from '@graphql-codegen/cli';
import dotenv from 'dotenv';

dotenv.config();

const config: CodegenConfig = {
    schema: [
        {
            'https://api.wize.works/wize-project/graphql': {
                headers: {
                    'Content-Type': 'application/json',
                    'wize-api-key': 'wize_sk_dev_manualtestkey1234567890',
                },
                method: 'POST',
            },
        },
    ],
    documents: [
        './graphql/wize-project/queries/**/*.graphql',
        './graphql/wize-project/mutations/**/*.graphql',
        './graphql/wize-project/subscriptions/**/*.graphql',
    ],
    generates: {
        './graphql/wize-project/generated.js': {
            preset: 'client',
            plugins: [
            ],
            config: {
                useTypeImports: false,
                useTypeScript: false,
                extensionJs: true, // Add this line to explicitly use .js extension
                dedupeFragments: true
            },
        },
    },
};

export default config;
