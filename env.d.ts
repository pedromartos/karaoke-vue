/// <reference types="vite/client" />

declare module 'vuetify-mask';

interface ImportMetaEnv {
  readonly VITE_TEST_VAR?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ObjectAny {
  [key: string]: any;
}

interface ObjectString {
  [key: string]: string;
}

interface ObjectBoolean {
  [key: string]: boolean;
}
