import fs from 'fs/promises';
import { mkdirp } from 'mkdirp';
import path from 'path';

interface GeneratedOperations {
    queries: Record<string, string>;
    mutations: Record<string, string>;
    subscriptions: Record<string, string>;
}

/**
 * Writes generated GraphQL operations into categorized folders (queries, mutations, subscriptions).
 *
 * @param operations - Object containing query, mutation, and subscription documents.
 * @param outputDir - Directory where GraphQL files should be written.
 */
export async function writeFiles(operations: GeneratedOperations, outputDir: string) {
    const queryDir = path.join(outputDir, 'queries');
    const mutationDir = path.join(outputDir, 'mutations');
    const subscriptionDir = path.join(outputDir, 'subscriptions');

    // Ensure the output directories exist
    await mkdirp(queryDir);
    await mkdirp(mutationDir);
    await mkdirp(subscriptionDir);

    // Write Queries
    for (const [name, query] of Object.entries(operations.queries)) {
        const filePath = path.join(queryDir, `${name}.graphql`);
        await fs.writeFile(filePath, query);
    }

    // Write Mutations
    for (const [name, mutation] of Object.entries(operations.mutations)) {
        const filePath = path.join(mutationDir, `${name}.graphql`);
        await fs.writeFile(filePath, mutation);
    }

    // Write Subscriptions
    for (const [name, subscription] of Object.entries(operations.subscriptions)) {
        const filePath = path.join(subscriptionDir, `${name}.graphql`);
        await fs.writeFile(filePath, subscription);
    }
}
