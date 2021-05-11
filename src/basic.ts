import { Context, VariableSymbol } from "./Context";
import { Interpreter } from "./Interpreter";
import { BaseValue, BuiltInFunction, IntValue } from "./BaseValue";
import { Lexer } from "./Lexer";
import { Parser } from "./Parser";
import { BaseNode } from "./BaseNode";
import { Token, TT } from "./Token";
import { BaseTypes } from "./BaseTypes";

const globalContext: Context = new Context(null);

globalContext.declareVariable(
  "print",
  new VariableSymbol(true, BaseTypes.fun, BuiltInFunction.print(globalContext))
);
globalContext.declareVariable(
  "typeof",
  new VariableSymbol(true, BaseTypes.fun, BuiltInFunction.typeof(globalContext))
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
  // console.log( ast );

  const interpreter = new Interpreter();
  try {
    const result: BaseValue = interpreter.visit(ast, globalContext);
    return result;
  } catch (error) {
    console.log(error);
  }
}
