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
      run(src);
      oldText = "";
    } catch (error: any) {
      oldText += text + "\n";
      // console.log(error);
    }
    waitForUserInput();
  });
};

waitForUserInput();

// run(`fun Null hello(int a, int b) { print(a + b) }`);
