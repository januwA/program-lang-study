import { Interpreter } from "./Interpreter";
import { Lexer } from "./Lexer";
import { BaseNode, Parser } from "./Parser";
import { Token, TT } from "./Token";

export function run(text: string) {
  try {
    const lexer = new Lexer(text);
    const tokens: Token[] = lexer
      .makeTokens()
      .filter((t) => t.type !== TT.SPACE);
    // console.log(tokens.map((it) => it.toString()));

    const parser = new Parser(tokens);
    const expr: BaseNode = parser.parse();
    console.log(expr.toString());

    const interpreter = new Interpreter();
    const result = interpreter.visit(expr);
    console.log(result.toString());
  } catch (error) {
    console.log(error);
  }
}
