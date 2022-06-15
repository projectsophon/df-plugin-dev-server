#!/usr/bin/env node

import { default as yargs } from "yargs";

import { start, bundle } from "./server.js";

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
          default: ["(plugins|content)/**/*.(js|jsx|ts|tsx)"],
        },
        preact: {
          desc: "Enabled custom preact support",
          type: "boolean",
          default: false,
        },
      });
    },
    start
  )
  .command(
    "bundle",
    "Produce bundles for Dark Forest plugins.",
    (yargs) => {
      return yargs.options({
        glob: {
          desc: "Glob for finding plugins",
          type: "array",
          default: ["plugins/*.(js|jsx|ts|tsx)"],
        },
        preact: {
          desc: "Enabled custom preact support",
          type: "boolean",
          default: false,
        },
        outdir: {
          desc: "The directory to output files",
          type: "string",
          required: true,
        },
      });
    },
    bundle
  );

parser.parse(process.argv.slice(2));
