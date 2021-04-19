export class Position {
  constructor(
    public index: number,
    public row: number,
    public col: number,
    public text: string
  ) {}

  next(char: string) {
    this.index++;
    this.col++;
    if (char === "\n") {
      this.col = 0;
      this.row++;
    }
  }

  copy() {
    return new Position(this.index, this.row, this.col, this.text);
  }
}
