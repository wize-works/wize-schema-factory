import fetch from 'cross-fetch';
const introspectionQuery = `
    query IntrospectionQuery {
        __schema {
            types {
                name
                kind
                fields {
                    name
                    args {
                        name
                        type {
                            name
                            kind
                            ofType {
                                name
                                kind
                            }
                        }
                    }
                    type {
                        name
                        kind
                        ofType {
                            name
                            kind
                        }
                    }
                }
            }
        }
    }
    `;
/**
 * Fetches GraphQL schema via introspection query.
 * @param apiUrl - The GraphQL API URL.
 * @param apiKey - Your Wize API key.
 * @returns The introspected schema object.
 */
export async function fetchSchema(apiUrl, apiKey) {
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'wize-api-key': apiKey,
        },
        body: JSON.stringify({ query: introspectionQuery }),
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch schema: ${response.statusText}`);
    }
    const { data } = await response.json();
    return data.__schema;
}
