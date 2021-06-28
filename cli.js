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
          desc: "The directory to load",
          type: "string",
          deprecated: "use --glob instead",
        },
        ext: {
          desc: "Extensions to process",
          type: "array",
          deprecated: "use --glob instead",
        },
        glob: {
          desc: "Glob for finding plugins",
          type: "array",
          default: ["plugins/*.(js|ts)"],
        },
      });
    },
    start
  );

parser.parse(process.argv.slice(2));
