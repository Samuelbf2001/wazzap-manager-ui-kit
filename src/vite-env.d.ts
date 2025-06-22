/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DB_HOST: string;
  readonly VITE_DB_PORT: string;
  readonly VITE_DB_NAME: string;
  readonly VITE_DB_USER: string;
  readonly VITE_DB_PASSWORD: string;
  readonly VITE_NODE_ENV: string;
  readonly VITE_REDIS_HOST: string;
  readonly VITE_REDIS_PORT: string;
  readonly VITE_REDIS_PASSWORD: string;
  readonly VITE_EVOLUTION_API_URL: string;
  readonly VITE_EVOLUTION_API_KEY: string;
  readonly VITE_HUBSPOT_API_KEY: string;
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_ANTHROPIC_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
