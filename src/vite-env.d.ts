/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL Web App Google Apps Script (lihat .env.example & docs/spreadsheet-integration.md). */
  readonly VITE_API_URL?: string
  /** 'mock' (default) atau 'remote' - lihat src/services/api.ts. */
  readonly VITE_DATA_SOURCE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
