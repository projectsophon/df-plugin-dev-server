import * as path from "path";
import * as http from "http";
import { URL } from "url";
import * as fs from "fs/promises";
import * as esbuild from "esbuild";
import getPort from "get-port";
import { default as chalk } from "chalk";
import fastGlob from "fast-glob";

const { bold, underline } = chalk;

export async function start({ dir, ext, glob, preact }) {
  const proxyPort = await getPort({ port: 2222 });
  const esbuildPort = await getPort({ port: 2221 });

  let entryPoints;
  let printLocation;
  if (dir) {
    // Deprecated options code path
    ext = ext || [".js", ".ts"];
    const pluginDir = path.join(process.cwd(), dir);

    const allFiles = await fs.readdir(pluginDir);
    entryPoints = allFiles
      .filter((filename) => {
        return ext.includes(path.extname(filename));
      })
      .map((filename) => {
        return path.join(dir, filename);
      });
    printLocation = underline(pluginDir);
  } else {
    entryPoints = await fastGlob(glob);
    printLocation = glob.map((g) => underline(path.join(process.cwd(), g))).join(", ");
  }

  // Custom resolver that externalizes http:// and https:// imports
  const httpExternalResolver = {
    name: "http-external",
    setup(build) {
      // Mark all paths starting with "http://" or "https://" as external
      build.onResolve({ filter: /^https?:\/\// }, (args) => {
        return { path: args.path, external: true };
      });
    },
  };

  // Custom resolver that rewrites react->preact/compat
  const preactResolver = {
    name: "preact",
    setup(build) {
      build.onResolve({ filter: /^react-dom\/test-utils$/ }, (args) => {
        return { path: path.join(args.resolveDir, "preact/test-utils") };
      });

      build.onResolve({ filter: /^react-dom$/ }, (args) => {
        return { path: path.join(args.resolveDir, "preact/compat") };
      });

      build.onResolve({ filter: /^react$/ }, (args) => {
        return { path: path.join(args.resolveDir, "preact/compat") };
      });
    },
  };

  const esbuildServeConfig = {
    port: esbuildPort,
  };

  let jsxConfig = {};
  const plugins = [httpExternalResolver];
  if (preact) {
    plugins.push(preactResolver);
    jsxConfig = {
      jsxFactory: "h",
      jsxFragment: "Fragment",
    };
  }

  const esbuildConfig = {
    entryPoints: entryPoints,
    bundle: true,
    format: "esm",
    target: ["es2020"],
    plugins,
    ...jsxConfig,
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
    console.log(`ESBuild for ${printLocation} on port ${underline(esbuildPort)}`);
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
