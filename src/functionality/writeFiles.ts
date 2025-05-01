import path from 'path';
import { mkdirp } from 'mkdirp';
import fs from 'fs/promises';

interface GeneratedOperations {
    queries: Record<string, string>;
    mutations: Record<string, string>;
    subscriptions: Record<string, string>;
}

async function writeOperationGroup(
    operations: Record<string, string>,
    type: 'queries' | 'mutations' | 'subscriptions',
    baseDir: string
) {
    const dir = path.join(baseDir, type);
    await mkdirp(dir);

    for (const [name, doc] of Object.entries(operations)) {
        const filePath = path.join(dir, `${name}.graphql`);
        await fs.writeFile(filePath, doc);
    }
}

export async function writeFiles(operations: GeneratedOperations, outputDir: string) {
    await writeOperationGroup(operations.queries, 'queries', outputDir);
    await writeOperationGroup(operations.mutations, 'mutations', outputDir);
    await writeOperationGroup(operations.subscriptions, 'subscriptions', outputDir);
}
