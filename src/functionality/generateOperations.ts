function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function unwrapTypeName(type: any): string {
    if (type.kind === 'NON_NULL' || type.kind === 'LIST') {
        return unwrapTypeName(type.ofType);
    }
    return type.name;
}

// List of fields to exclude from all generated operations
const EXCLUDED_FIELDS = ['tenantId'];

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

        const fields = typeDetails.fields
            // Filter out excluded fields
            .filter((field: any) => !EXCLUDED_FIELDS.includes(field.name))
            .map((field: any) => {
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

export function generateOperations(api: string, schema: any, maxDepth = 3) {
    const queries: Record<string, string> = {};
    const mutations: Record<string, string> = {};
    const subscriptions: Record<string, string> = {};
    const adminSchemas: Record<string, any> = {};

    const types = schema.types || [];

    types.forEach((type: any) => {
        if ((type.name === 'Query' || type.name === 'Mutation') && type.fields) {
            type.fields.forEach((field: any) => {
                const operationName = capitalize(field.name);
                const fieldSelection = generateFieldSelection(field.type, schema, 1, maxDepth);
                const args = field.args || [];

                const varDefs = args.map((arg: any) => `$${arg.name}: ${unwrapTypeName(arg.type)}!`).join(', ');
                const params = args.map((arg: any) => `${arg.name}: $${arg.name}`).join(', ');

                const operation = args.length > 0
                    ? `${type.name.toLowerCase()} ${operationName}(${varDefs}) {
    ${field.name}(${params}) ${fieldSelection}
  }`
                    : `${type.name.toLowerCase()} ${operationName} {
    ${field.name} ${fieldSelection}
  }`;

                if (type.name === 'Query') queries[field.name] = operation;
                else mutations[field.name] = operation;
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

        
        if (type.name === type.name.toLowerCase() && type.kind === 'OBJECT' && type.fields) {
            const database = api;
            const metadata: any = {
                fields: {}
            };
            
            type.fields.forEach((field: any) => {
                metadata.fields[field.name] = generateMetadataForField(field, schema);
            });
            
            metadata.subscriptions = {
                onCreated: true,
                onUpdated: true
            };

            metadata.tenantScoped = true;
            
            adminSchemas[type.name] = {
                database,
                clientApp: "<client-app-name>",
                table: type.name + 's',
                metadata
            };
        }
    });
    return { queries, mutations, subscriptions, adminSchemas };
}

function generateMetadataForField(field: any, schema: any): any {
    const { type, isRequired } = determineFieldType(field.type);
    const metadata: any = { type };
    
    if (isRequired) {
        metadata.required = true;
    }
    
    if (type === 'array') {
        const itemType = field.type.ofType ? determineFieldType(field.type.ofType) : { type: 'string' };
        metadata.items = { type: itemType.type };
    }
    
    if (type === 'enum') {
        const enumType = unwrapTypeName(field.type);
        const enumTypeDetails = schema.types.find((t: any) => t.name === enumType);
        
        if (enumTypeDetails && enumTypeDetails.enumValues) {
            metadata.values = enumTypeDetails.enumValues.map((ev: any) => ev.name);
            metadata.defaultValue = metadata.values[0];
        }
    }
    
    if (type === 'object') {
        const objectType = unwrapTypeName(field.type);
        const objectTypeDetails = schema.types.find((t: any) => t.name === objectType);
        
        if (objectTypeDetails && objectTypeDetails.fields) {
            metadata.fields = {};
            objectTypeDetails.fields.forEach((subField: any) => {
                metadata.fields[subField.name] = generateMetadataForField(subField, schema);
            });
        }
    }
    return metadata;
}

function determineFieldType(type: any): { type: string, isRequired: boolean } {
    if (type.kind === 'NON_NULL') {
        const unwrapped = determineFieldType(type.ofType);
        return { ...unwrapped, isRequired: true };
    }
    
    if (type.kind === 'LIST') {
        return { type: 'array', isRequired: false };
    }
    
    switch (type.name) {
        case 'ID': 
        case 'UUID': 
            return { type: 'uuid', isRequired: false };
        case 'String': 
            return { type: 'string', isRequired: false };
        case 'Int': 
            return { type: 'integer', isRequired: false };
        case 'Float': 
            return { type: 'float', isRequired: false };
        case 'Boolean': 
            return { type: 'boolean', isRequired: false };
        case 'DateTime': 
        case 'Date': 
            return { type: 'datetime', isRequired: false };
        default:
            if (type.kind === 'ENUM') {
                return { type: 'enum', isRequired: false };
            }
            if (type.kind === 'OBJECT') {
                return { type: 'object', isRequired: false };
            }
            return { type: 'string', isRequired: false };
    }
}
