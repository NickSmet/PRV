// See https://svelte.dev/docs/kit/types#app
declare global {
  namespace App {
    interface Locals {}
    interface PageData {}
    interface Error {}
    interface Platform {}
  }
}

declare module '*?inline' {
  const content: string;
  export default content;
}

export {};

