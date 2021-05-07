import { Context } from "./Context";
import { BaseValue, Interpreter, IntValue } from "./Interpreter";
import { Lexer } from "./Lexer";
import { BaseNode, Parser } from "./Parser";
import { Token, TT } from "./Token";

const globalContext: Context = new Context(null);

export function run(text: string) {
  const lexer = new Lexer(text);
  const tokens: Token[] = lexer.makeTokens().filter((t) => t.type !== TT.SPACE);
  // console.log(tokens.map((it) => it.toString()));

  const parser = new Parser(tokens);
  let ast: BaseNode = parser.parse();
  // console.log(ast.toString());

  const interpreter = new Interpreter();
  try {
    const result: BaseValue = interpreter.visit(ast, globalContext);
    console.log(result.toString());
  } catch (error) {
    console.log(error);
  }
}
