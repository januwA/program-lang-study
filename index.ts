import * as readline from "readline";
import { run } from "./src/basic";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const waitForUserInput = function () {
  rl.question("> ", (text) => {
    try {
      run(text);
    } catch (error) {
      console.log(error);
    }
    waitForUserInput();
  });
};

waitForUserInput();

// run("a=1");
