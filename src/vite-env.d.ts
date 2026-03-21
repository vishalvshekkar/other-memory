/// <reference types="vite/client" />

declare module "*.yaml" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value: any;
  export default value;
}

declare module "*.yml" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value: any;
  export default value;
}
