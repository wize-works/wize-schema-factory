import path from 'path';
import { mkdirp } from 'mkdirp';
import fs from 'fs/promises';
async function writeOperationGroup(operations, type, baseDir) {
    const dir = path.join(baseDir, type);
    await mkdirp(dir);
    for (const [name, doc] of Object.entries(operations)) {
        const filePath = path.join(dir, `${name}.graphql`);
        await fs.writeFile(filePath, doc);
    }
}
export async function writeFiles(operations, outputDir) {
    await writeOperationGroup(operations.queries, 'queries', outputDir);
    await writeOperationGroup(operations.mutations, 'mutations', outputDir);
    await writeOperationGroup(operations.subscriptions, 'subscriptions', outputDir);
}
