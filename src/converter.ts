export interface IConverter {
  converterBody(data: any, ...args: any[]): any;
  parseBody?(data: any, ...args: any[]): any;
}
