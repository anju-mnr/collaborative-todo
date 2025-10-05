// Type declarations for CSS imports (both module and side-effect imports)
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

declare module "*.scss" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.sass" {
  const content: { [className: string]: string };
  export default content;
}
export {}
declare global {
  interface Window {
    __airstateConfigured?: boolean
  }
}
