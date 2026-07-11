declare module 'blockly' {
  interface CodeGenerator {
    addStatement(name: string, block: (block: any) => string): void;
  }
}