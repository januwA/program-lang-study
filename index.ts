import * as readline from "readline";
import { run } from "./basic";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const waitForUserInput = function () {
  rl.question("> ", (text) => {
    run(text);
    waitForUserInput();
  });
};

waitForUserInput();
