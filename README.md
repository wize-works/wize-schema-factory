# Wize Schema Factory

Generate GraphQL query, mutation, and subscription documents from your Wize API key.

---

## 🚀 Quick Start

```bash
npx wize-schema-factory --key YOUR_WIZE_API_KEY
```

---

## ⚖️ Options

| Option | Description | Default |
|:-------|:------------|:--------|
| `--key` | Your Wize API key (required) | - |
| `--url` | GraphQL API URL | `https://api.wize.works/graphql` |
| `--output` | Directory to save generated `.graphql` files | `./graphql` |

---

## 🗂️ Output Structure

After running, you'll get:

```
graphql/
  queries/
    GetProjects.graphql
    GetTasks.graphql
    ...
  mutations/
    CreateProject.graphql
    UpdateTask.graphql
    ...
  subscriptions/
    OnProjectCreated.graphql
    ...
```

Each operation is saved as a `.graphql` file, ready for use with your frontend projects.

---

## 📚 Example Usage in Frontend

You can immediately use these files with [GraphQL Code Generator](https://www.graphql-code-generator.com/):

Example `codegen.yml`:

```yaml
schema: ./graphql/**/*.graphql
generates:
  ./generated/graphql.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-react-apollo
```

Then run:

```bash
yarn graphql-codegen
```

And get typed React Hooks like `useGetProjectsQuery()`, etc.

---

## ✨ Benefits

- Save hours setting up GraphQL clients
- Immediate Codegen-ready operations
- Consistent across all applications
- Professional, production-quality DX (Developer Experience)

---

## 🚀 Future Features (Roadmap)

- Filter models (`--only=Project,Task`)
- Auto-generate fragments
- Generate starter `codegen.yml`
- Support multiple output formats (TypeScript, Dart, etc.)

---

Built with ❤️ by the WizeWorks team.

