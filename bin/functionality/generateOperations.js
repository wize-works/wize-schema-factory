function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
function unwrapTypeName(type) {
    if (type.kind === 'NON_NULL' || type.kind === 'LIST') {
        return unwrapTypeName(type.ofType);
    }
    return type.name;
}
function generateFieldSelection(type, schema, depth, maxDepth, visitedTypes = new Set()) {
    if (!type || depth > maxDepth)
        return '';
    if (type.kind === 'NON_NULL' || type.kind === 'LIST') {
        return generateFieldSelection(type.ofType, schema, depth, maxDepth, visitedTypes);
    }
    if (type.kind === 'OBJECT' || type.kind === 'INTERFACE') {
        if (visitedTypes.has(type.name)) {
            return '';
        }
        visitedTypes.add(type.name);
        const typeDetails = schema.types.find((t) => t.name === type.name);
        if (!typeDetails || !typeDetails.fields)
            return '';
        const fields = typeDetails.fields.map((field) => {
            const subFieldSelection = generateFieldSelection(field.type, schema, depth + 1, maxDepth, new Set(visitedTypes));
            return subFieldSelection
                ? `${'    '.repeat(depth + 1)}${field.name} ${subFieldSelection}`
                : `${'    '.repeat(depth + 1)}${field.name}`;
        });
        return `{
  ${fields.join('\n')}
  ${'  '.repeat(depth)}}`;
    }
    return '';
}
export function generateOperations(schema, maxDepth = 3) {
    const queries = {};
    const mutations = {};
    const subscriptions = {};
    const types = schema.types || [];
    types.forEach((type) => {
        if ((type.name === 'Query' || type.name === 'Mutation') && type.fields) {
            type.fields.forEach((field) => {
                const operationName = capitalize(field.name);
                const fieldSelection = generateFieldSelection(field.type, schema, 1, maxDepth);
                const args = field.args || [];
                const varDefs = args.map((arg) => `$${arg.name}: ${unwrapTypeName(arg.type)}!`).join(', ');
                const params = args.map((arg) => `${arg.name}: $${arg.name}`).join(', ');
                const operation = args.length > 0
                    ? `${type.name.toLowerCase()} ${operationName}(${varDefs}) {
    ${field.name}(${params}) ${fieldSelection}
  }`
                    : `${type.name.toLowerCase()} ${operationName} {
    ${field.name} ${fieldSelection}
  }`;
                if (type.name === 'Query')
                    queries[field.name] = operation;
                else
                    mutations[field.name] = operation;
            });
        }
        if (type.name === 'Subscription' && type.fields) {
            type.fields.forEach((field) => {
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
