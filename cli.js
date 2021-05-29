#!/usr/bin/env node

import { default as yargs } from "yargs";

import { start } from "./server.js";

const parser = yargs()
  .scriptName("df-plugin-dev-server")
  .command(
    "$0",
    "Start a Dark Forest plugin development server.",
    (yargs) => {
      return yargs.options({
        dir: {
          desc: "The directory where plugins exist",
          type: "string",
          default: "plugins",
        },
        ext: {
          desc: "Extensions to process",
          type: "array",
          default: [".js", ".ts"],
        },
      });
    },
    start
  );

parser.parse(process.argv.slice(2));
