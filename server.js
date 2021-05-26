#!/usr/bin/env node

import * as path from "path";
import * as http from "http";
import { URL } from "url";
import * as fs from "fs/promises";
import { default as yargs } from "yargs";
import * as esbuild from "esbuild";
import getPort from "get-port";
import { default as chalk } from "chalk";

const { bold, underline } = chalk;

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

async function start({ dir, ext }) {
  const proxyPort = await getPort({ port: 2222 });
  const esbuildPort = await getPort({ port: 2221 });
  const pluginDir = path.join(process.cwd(), dir);
  const allFiles = await fs.readdir(pluginDir);
  const entryPoints = allFiles
    .filter((filename) => {
      return ext.includes(path.extname(filename));
    })
    .map((filename) => {
      return path.join(dir, filename);
    });

  const esbuildServeConfig = {
    port: esbuildPort,
  };

  const esbuildConfig = {
    entryPoints: entryPoints,
    bundle: true,
    format: "esm",
    target: ["es2020"],
  };

  const { host, port } = await esbuild.serve(esbuildServeConfig, esbuildConfig);

  const proxyServer = http.createServer((req, res) => {
    const { pathname, searchParams } = new URL(req.url, `http://${req.headers.host}`);

    if (searchParams.has("dev")) {
      res.writeHead(200, {
        "content-type": "application/javascript",
        "access-control-allow-origin": "*",
      });
      res.end(templateForPathname(pathname));
      return;
    }

    const options = {
      hostname: host,
      port: port,
      path: req.url,
      method: req.method,
      headers: req.headers,
    };

    // Forward each incoming request to esbuild
    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, {
        ...proxyRes.headers,
        "access-control-allow-origin": "*",
      });
      proxyRes.pipe(res, { end: true });
    });

    // Forward the body of the request to esbuild
    req.pipe(proxyReq, { end: true });
  });

  proxyServer.listen(proxyPort, () => {
    console.log(`ESBuild for ${underline(pluginDir)} on port ${underline(esbuildPort)}`);
    console.log(`Development server started on ${bold(`http://127.0.0.1:${proxyPort}/`)}`);
  });
}

function templateForPathname(pathname) {
  return `// Development plugin with auto-reload
class Plugin {
  constructor() {
    this.plugin = null;
  }
  async render(container) {
    const cacheBust = Date.now();
    const modulePath = "${pathname}?" + cacheBust;
    const { default: RevealMarket } = await import(modulePath);
    this.plugin = new RevealMarket();
    await this.plugin?.render?.(container);
  }
  draw(ctx) {
    this.plugin?.draw?.(ctx);
  }
  destroy() {
    this.plugin?.destroy?.();
  }
}

export default Plugin;
`;
}
