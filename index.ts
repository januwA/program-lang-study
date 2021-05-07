import * as readline from "readline";
import { run } from "./src/basic";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let oldText = "";
const waitForUserInput = function () {
  const query = oldText ? "... " : "> ";
  rl.question(query, (text) => {
    try {
      run(oldText + text);
      oldText = "";
    } catch (error: any) {
      oldText += text + "\n";
      // console.log(error);
    }
    waitForUserInput();
  });
};

waitForUserInput();

// run("(int)1.2");
