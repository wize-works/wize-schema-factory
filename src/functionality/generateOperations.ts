function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function unwrapTypeName(type: any): string {
    if (type.kind === 'NON_NULL' || type.kind === 'LIST') {
        return unwrapTypeName(type.ofType);
    }
    return type.name;
}

function generateFieldSelection(
    type: any,
    schema: any,
    depth: number,
    maxDepth: number,
    visitedTypes: Set<string> = new Set()
): string {
    if (!type || depth > maxDepth) return '';

    if (type.kind === 'NON_NULL' || type.kind === 'LIST') {
        return generateFieldSelection(type.ofType, schema, depth, maxDepth, visitedTypes);
    }

    if (type.kind === 'OBJECT' || type.kind === 'INTERFACE') {
        if (visitedTypes.has(type.name)) {
            return '';
        }
        visitedTypes.add(type.name);

        const typeDetails = schema.types.find((t: any) => t.name === type.name);
        if (!typeDetails || !typeDetails.fields) return '';

        const fields = typeDetails.fields.map((field: any) => {
            const subFieldSelection = generateFieldSelection(field.type, schema, depth + 1, maxDepth, new Set(visitedTypes));
            return subFieldSelection
                ? `${'    '.repeat(depth + 1)}${field.name} ${subFieldSelection}`
                : `${'    '.repeat(depth + 1)}${field.name}`;
        });

        return `{\n${fields.join('\n')}\n${'  '.repeat(depth)}}`;
    }

    return '';
}

export function generateOperations(schema: any, maxDepth = 3) {
    const queries: Record<string, string> = {};
    const mutations: Record<string, string> = {};
    const subscriptions: Record<string, string> = {};

    const types = schema.types || [];

    types.forEach((type: any) => {
        if (type.name === 'Query' && type.fields) {
            type.fields.forEach((field: any) => {
                const operationName = capitalize(field.name);
                const fieldSelection = generateFieldSelection(field.type, schema, 1, maxDepth);

                if (field.args && field.args.length > 0) {
                    const varDefs = field.args
                        .map((arg: any) => `$${arg.name}: ${unwrapTypeName(arg.type)}`)
                        .join(', ');

                    const varUses = field.args
                        .map((arg: any) => `${arg.name}: $${arg.name}`)
                        .join(', ');

                    queries[field.name] = `query ${operationName}(${varDefs}) {
    ${field.name}(${varUses}) ${fieldSelection}
}`;
                } else {
                    queries[field.name] = `query ${operationName} {
    ${field.name} ${fieldSelection}
}`;
                }
            });
        }

        if (type.name === 'Mutation' && type.fields) {
            type.fields.forEach((field: any) => {
                const operationName = capitalize(field.name);
                const firstArg = field.args?.[0];
                const inputArg = firstArg ? `($input: ${unwrapTypeName(firstArg.type)}!)` : '';
                const inputUse = firstArg ? `(input: $input)` : '';
                const fieldSelection = generateFieldSelection(field.type, schema, 1, maxDepth);

                mutations[field.name] = `mutation ${operationName}${inputArg} {
    ${field.name}${inputUse} ${fieldSelection}
}`;
            });
        }

        if (type.name === 'Subscription' && type.fields) {
            type.fields.forEach((field: any) => {
                const operationName = capitalize(field.name);
                const fieldSelection = generateFieldSelection(field.type, schema, 1, maxDepth);

                subscriptions[field.name] = `subscription ${operationName} {
    ${field.name} ${fieldSelection}
}`;
            });
        }
    });

    return { queries, mutations, subscriptions };
}
