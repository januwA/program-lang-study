import * as fs from "fs";
import { run } from "./src/basic";

// ts-node run.ts ./demo/for.basic

if (process.argv.length <= 2) process.exit();

run(fs.readFileSync(process.argv[2]).toString());