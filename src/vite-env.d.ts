/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 'mock' (default) atau 'remote' — lihat src/services/api.ts. */
  readonly VITE_DATA_SOURCE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
