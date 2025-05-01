# 🚀 Usage

You can run the CLI directly using `npx`:

```bash
npx @wizeworks/wize-schema-factory --key YOUR-WIZE-API-KEY
```

> **Note:**  
> The `--key` option is **required**. You must provide your Wize API key to authenticate and fetch your GraphQL schema.

## Options

| Option | Description |
|:-------|:------------|
| `--key <wize-api-key>` | **(Required)** Your Wize API key for authentication. |
| `--url <api-url>` | (Optional) Override the GraphQL API URL (default: `https://api.wize.works/graphql`). |
| `--output <path>` | (Optional) Directory to output generated GraphQL operations (default: `./graphql`). |
| `-h, --help` | Display help information. |

## Examples

Generate GraphQL files with default settings:

```bash
npx @wizeworks/wize-schema-factory --key YOUR-WIZE-API-KEY
```

Generate GraphQL files into a custom output folder:

```bash
npx @wizeworks/wize-schema-factory --key YOUR-WIZE-API-KEY --output ./generated-graphql
```

Generate GraphQL files from a different Wize API endpoint:

```bash
npx @wizeworks/wize-schema-factory --key YOUR-WIZE-API-KEY --url https://api.wize.works/other-service/graphql
```

Generate GraphQL files locally and run GraphQL Code Generator:

```bash
npm run build
npx node ./bin/index.js --key YOUR-WIZE-API-KEY --url https://api.wize.works/other-service/graphql     
```

Display help information:

```bash
npx @wizeworks/wize-schema-factory --help
```
or
```bash
npx @wizeworks/wize-schema-factory --?
```

---

# 💠 Notes

- This tool automatically generates:
  - GraphQL queries, mutations, and subscriptions
  - A starter `codegen.yml` configuration file
- After generation, you can run [GraphQL Code Generator](https://www.graphql-code-generator.com/) to create typed hooks for your app:

```bash
npx graphql-codegen
```

---

