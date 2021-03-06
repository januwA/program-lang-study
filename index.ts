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
  const query = oldText ? "... " : ">>> ";
  rl.question(query, (text) => {
    const src: string = oldText + text;
    if (!src) return;
    try {
      const value = run(src);
      oldText = "";
      console.log(value.toJsString());
    } catch (error: any) {
      oldText += text + "\n";
    }
    waitForUserInput();
  });
};

waitForUserInput();

// run(`
// auto m = map { "name": "ajanuw" };
// m.name;
// `);