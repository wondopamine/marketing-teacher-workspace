/**
 * Every `.mdx` file under `content/` is compiled to plain data by the Vite
 * plugin in `src/content/mdx-plugin.ts`.
 *
 * This file must stay free of top-level imports: adding one would turn it into
 * a module and the `*.mdx` wildcard would stop applying globally. That is why
 * the type is written inline.
 */
/* eslint-disable @typescript-eslint/consistent-type-imports */
declare module "*.mdx" {
  const document: import("./content/mdx-document").ParsedMdxDocument
  export default document
}
