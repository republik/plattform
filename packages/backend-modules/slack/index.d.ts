declare module '@orbiting/backend-modules-slack' {
  export function publish(channel: string, message: string): Promise<void>
}
