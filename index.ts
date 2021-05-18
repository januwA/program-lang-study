import * as readline from "readline";
import { run } from "./src/basic";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let oldText = "";

process.stdin.on("keypress", (str, key) => {
  if (key.sequence === "\r") {
    waitForUserInput();
  }
});

const waitForUserInput = function () {
  const query = oldText ? ". " : "> ";
  rl.question(query, (text) => {
    const src: string = oldText + text;
    if (!src) return;
    try {
      const value = run(src);
      oldText = "";
      console.log(value.toString());
    } catch (error: any) {
      oldText += text + "\n";
      oldText = "";
    }
    waitForUserInput();
  });
};

waitForUserInput();

// run(` 123 // c `);