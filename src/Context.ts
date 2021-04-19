import { BaseValue } from "./Interpreter";


export class Context {
  variables: { [name: string]: BaseValue; } = {};
}
