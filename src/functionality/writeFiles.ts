import path from 'path';
import { mkdirp } from 'mkdirp';
import fs from 'fs/promises';

interface GeneratedOperations {
    queries: Record<string, string>;
    mutations: Record<string, string>;
    subscriptions: Record<string, string>;
    adminSchemas: Record<string, any>;
}

async function writeOperationGroup(
    operations: Record<string, string | any>,
    type: 'queries' | 'mutations' | 'subscriptions' | 'adminSchemas',
    baseDir: string
) {
    const dir = path.join(baseDir, type);
    await mkdirp(dir);

    for (const [name, doc] of Object.entries(operations)) {
        var fileName = name;
        if (type === 'adminSchemas') { fileName += 's'; }
        const filePath = path.join(dir, `${fileName}.${type === 'adminSchemas' ? 'json' : 'graphql'}`);
        const content = typeof doc === 'object' ? JSON.stringify(doc, null, 2) : doc;
        
        await fs.writeFile(filePath, content);
    }
}

export async function writeFiles(operations: GeneratedOperations, outputDir: string) {
    await writeOperationGroup(operations.queries, 'queries', outputDir);
    await writeOperationGroup(operations.mutations, 'mutations', outputDir);
    await writeOperationGroup(operations.subscriptions, 'subscriptions', outputDir);
    await writeOperationGroup(operations.adminSchemas, 'adminSchemas', outputDir);
}
