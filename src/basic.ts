import { Context, VariableSymbol } from "./Context";
import { Interpreter } from "./Interpreter";
import { BaseValue, BuiltInFunction } from "./BaseValue";
import { Lexer } from "./Lexer";
import { Parser } from "./Parser";
import { BaseNode } from "./BaseNode";
import { Token, TT, TYPES } from "./Token";

const globalContext: Context = new Context(null);

globalContext.declareVariable(
  "print",
  new VariableSymbol(true, TYPES.fun, BuiltInFunction.print())
);
globalContext.declareVariable(
  "typeof",
  new VariableSymbol(true, TYPES.fun, BuiltInFunction.typeof())
);

export function run(text: string): BaseValue {
  const lexer = new Lexer(text);
  const tokens: Token[] = lexer
    .makeTokens()
    .filter((t) => t.type !== TT.SPACE)
    .filter((t) => t.type !== TT.COMMENT);
  // console.log(tokens.map((it) => it.toString()));

  const parser = new Parser(tokens);
  let ast: BaseNode = parser.parse();
  // console.log( ast.toString() );

  const interpreter = new Interpreter();
  try {
    const result: BaseValue = interpreter.visit(ast, globalContext);
    return result;
  } catch (error) {
    console.log(error);
  }
}
