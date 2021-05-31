# @projectsophon/df-plugin-dev-server

An ESBuild server for Dark Forest plugin development.

## Installation

You can install the command globally using:

```bash
npm i -g @projectsophon/df-plugin-dev-server
```

## Docker image installation and running

You need to create network: `docker network create webproxy`

From main directory you can execute commands to build and start docker image:

```bash
make up -> starts docker image
make up-build -> creates docker image and starts it
make restart -> restarts docker image currently running
make stop -> stops docker container
make down -> stops docker container and removes image
make build -> creates docker image

make copy -> updates plugins inside docker image
```

## Usage

Once installed, you should have access to the command:

```bash
df-plugin-dev-server
```

You can see the supported flags by running:

```bash
df-plugin-dev-server

Start a Dark Forest plugin development server.

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
  --dir      The directory where plugins exist     [string] [default: "plugins"]
  --ext      Extensions to process              [array] [default: [".js",".ts"]]
```

And then run the server:

```bash
df-plugin-dev-server
ESBuild for /Users/user/sophon-plugins/plugins on port 2221
Development server started on http://127.0.0.1:2222/
```

## Adblock & Security

I noticed that Brave Browser's built-in Adblock stops any requests to `127.0.0.1`, so you'll need to disable that if you are building plugins against https://zkga.me directly.

You'll also need to "Allow Insecure Content" since this development server doesn't provide an HTTPS certificate.

## Plugins

The easiest way to load plugins while developing would be to use something like this in the Dark Forest UI:

```js
// This maps to ./plugins/MyAwesomePlugin.js or ./plugins/MyAwesomePlugin.ts by default
import Plugin from "http://127.0.0.1:2222/MyAwesomePlugin.js"

export default Plugin;
```

However, Dark Forest plugins are cached, so you'd need to do some sort of cache busting each time you make a change. Luckily, we've taken care of that for you! To get free cache busting, you can add `?dev` to the end of your plugin URL.

```js
// Notice the ?dev
import Plugin from "http://127.0.0.1:2222/MyAwesomePlugin.js?dev"

export default Plugin;
```

Doing the above will proxy your plugin through a cache busting plugin!

## License

MIT
