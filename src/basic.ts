import { Context } from "./Context";
import { BaseValue, Interpreter } from "./Interpreter";
import { Lexer } from "./Lexer";
import { BaseNode, Parser } from "./Parser";
import { Token, TT } from "./Token";

const context: Context = new Context();

export function run(text: string) {
  try {
    const lexer = new Lexer(text);
    const tokens: Token[] = lexer
      .makeTokens()
      .filter((t) => t.type !== TT.SPACE);
    // console.log(tokens.map((it) => it.toString()));

    const parser = new Parser(tokens);
    const ast: BaseNode = parser.parse();
    // console.log(ast.toString());

    const interpreter = new Interpreter();
    const result: BaseValue = interpreter.visit(ast, context);
    console.log(result.toString());
  } catch (error) {
    console.log(error);
  }
}
