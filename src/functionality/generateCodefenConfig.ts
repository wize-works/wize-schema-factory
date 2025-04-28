import fs from 'fs/promises';
import path from 'path';

/**
 * Generates a basic codegen.yml file if it doesn't already exist.
 * @param outputDir - Directory where the graphql operations were written.
 */
export async function generateCodegenConfig(outputDir: string) {
    const configPath = path.resolve(outputDir, '..', 'codegen.yml');

    try {
        await fs.access(configPath);
        console.log('✅ codegen.yml already exists, skipping.');
    } catch {
        const content = `schema: ./graphql/**/*.graphql
documents: ./graphql/**/*.graphql
generates:
    ./generated/graphql.ts:
        plugins:
            - typescript
            - typescript-operations
            - typescript-react-apollo
        config:
            withHooks: true
            withHOC: false
            withComponent: false
`;
        await fs.writeFile(configPath, content, 'utf8');
        console.log('✅ codegen.yml generated.');
        
    }
}
