# Journey Builder — Prefill mapping (Avantos OA challenge)

React + TypeScript app that loads an **action blueprint graph** from the [frontend challenge mock server](https://github.com/mosaic-avantos/frontendchallengeserver), lists **form** nodes, and lets you **view and edit prefill mappings** per field (direct upstream forms, transitive upstream forms, and mock global properties).

For the official mock blueprint id (`bp_01jk766tckfwx84xjcxazggzyc`), the app **merges a few example mappings on load** ([`src/demo/seedDemoMappings.ts`](src/demo/seedDemoMappings.ts))—e.g. Form D’s email from Form A, Form F’s email from Form D and name from global data—so you can see filled rows immediately; you can still change or clear them like normal.

## Prerequisites

- Node.js 20+ recommended  

**Mock API:** Recommended for parity with the challenge. If `npm run dev` cannot reach the mock server (“Failed to fetch”), the app automatically loads [`public/graph-mock.json`](public/graph-mock.json) (same payload as the upstream repo’s `graph.json`) so you can still explore the UI.

## Run locally

### 1. (Optional) Start the mock server

Clone [mosaic-avantos/frontendchallengeserver](https://github.com/mosaic-avantos/frontendchallengeserver), then:

```bash
cd frontendchallengeserver
npm install
npm start
```

The server listens on **port 3000** and serves `GET /api/v1/{tenantId}/actions/blueprints/{blueprintId}/graph` (see `index.js` in that repo).

### 2. Configure this app

```bash
cd /path/to/avantos-oa
cp .env.example .env
```

Edit `.env` if your tenant id, blueprint id, or server port differ. Defaults match the sample `graph.json` in the mock server:

- `VITE_GRAPH_API_BASE=http://localhost:3000`
- `VITE_TENANT_ID=1`
- `VITE_BLUEPRINT_ID=bp_01jk766tckfwx84xjcxazggzyc`

### 3. Install and run the dev server

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Scripts

| Command        | Description                          |
| -------------- | ------------------------------------ |
| `npm run dev`  | Vite dev server                      |
| `npm run build`| Typecheck + production build         |
| `npm run test` | Vitest (unit + component tests)     |
| `npm run lint` | ESLint                               |

## How prefill data sources are extended

The app uses a small **registry** of `PrefillDataSource` implementations. The modal lists every registered source in order; each source returns a flat list of selectable options for the current target form.

1. Add a new module under [`src/prefill/sources/`](src/prefill/sources/) that exports an object satisfying [`PrefillDataSource`](src/prefill/sources/types.ts) (`id`, `sectionTitle`, `listOptions(context)`).
2. Import it in [`src/prefill/sources/index.ts`](src/prefill/sources/index.ts) and append it to the `sources` array.

`PrefillSourceContext` includes the full graph, `nodesById`, `formsById`, and the selected **target** form node so you can derive options from the DAG, external ids, or async-loaded metadata later.

Bindings use a discriminated union (`PrefillBinding` in [`src/prefill/types.ts`](src/prefill/types.ts)). Serialization to/from `node.data.input_mapping` lives in [`src/prefill/inputMapping.ts`](src/prefill/inputMapping.ts) so API shape changes stay localized.

## DAG rules

**Direct** upstream forms come from each node’s `data.prerequisites` (canonical for this challenge). **Transitive** upstream forms are all other ancestors reachable by walking prerequisite chains; the UI shows transitive-only options as “Form fields of forms that this form transitively depends on.”

## Project layout (high level)

- [`src/api/`](src/api/) — fetch blueprint graph, lookup maps  
- [`src/domain/`](src/domain/) — DAG helpers, field labels  
- [`src/prefill/`](src/prefill/) — binding types, API adapters, source registry  
- [`src/components/`](src/components/) — form list, prefill panel, modal  

## License

Private / submission use unless you add your own license.
