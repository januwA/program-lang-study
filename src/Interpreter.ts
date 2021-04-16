import { BaseNode, BinaryNode, NumberNode } from "./Parser";
import { TT } from "./Token";

/**
 * 解析语法树
 */
export class Interpreter {
  constructor() { }

  visit(node: BaseNode) {
    if (node instanceof NumberNode) {
      return Number(node.token.value);
    } else if (node instanceof BinaryNode) {
      const left = this.visit(node.left);
      const right = this.visit(node.right);
      if (node.token.type === TT.PLUS) {
        return left + right;
      } else if (node.token.type === TT.MINUS) {
        return left - right;
      } else if (node.token.type === TT.MUL) {
        return left * right;
      } else if (node.token.type === TT.DIV) {
        return left / right;
      }
    } else {
      throw `Runtime Error: Unrecognized node ${node}`;
    }
  }
}
