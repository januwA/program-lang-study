import { Position } from "./Position";

abstract class BaseError {
  constructor(
    public name: string,
    public message: string,
    public posStart: Position,
    public posEnd: Position
  ) {}

  private stringsWithArrows(): string {
    let result = "";
    const lines = this.posStart.text.split("\n");
    result += lines[this.posStart.row];
    result += "\n";
    result +=
      (this.posStart.col ? " ".padStart(this.posStart.col) : "") +
      `^`.repeat(this.posEnd.col - this.posStart.col);
    return result;
  }

  toString() {
    let err = `${this.name}: ${this.message}\n`;
    err += this.stringsWithArrows();
    return err;
  }
}

/**
 * 未捕获的语法错误
 */
export class SyntaxError extends BaseError {
  constructor(message: string, posStart: Position, posEnd: Position) {
    super("SyntaxError", message, posStart, posEnd);
  }
}


export class ReferenceError extends BaseError {
  constructor(message: string, posStart: Position, posEnd: Position) {
    super("ReferenceError", message, posStart, posEnd);
  }
}