/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GRAPH_API_BASE: string;
  readonly VITE_TENANT_ID: string;
  readonly VITE_BLUEPRINT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
