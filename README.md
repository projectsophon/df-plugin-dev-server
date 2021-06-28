# @projectsophon/df-plugin-dev-server

An ESBuild server for Dark Forest plugin development.

## Installation

You can install the command globally using:

```bash
npm i -g @projectsophon/df-plugin-dev-server
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
  --dir      The directory to load     [deprecated: use --glob instead] [string]
  --ext      Extensions to process      [deprecated: use --glob instead] [array]
  --glob     Glob for finding plugins   [array] [default: ["plugins/*.(js|ts)"]]
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
// This maps to ./plugins/PluginTemplate.js or ./plugins/PluginTemplate.ts by default
export { default } from "http://127.0.0.1:2222/PluginTemplate.js";
```

However, Dark Forest plugins are cached, so you'd need to do some sort of cache busting each time you make a change. Luckily, we've taken care of that for you! To get free cache busting, you can add `?dev` to the end of your plugin URL.

```js
// Notice the ?dev
export { default } from "http://127.0.0.1:2222/PluginTemplate.js?dev";
```

Doing the above will proxy your plugin through a cache busting plugin!

## Docker image installation and running

From main directory you can execute commands to build and start docker image:

To build & run without getting prompted for docker output simply run (with -d):

`docker-compose -f docker-compose.yml up -d --build --remove-orphans`

To run an existing image without building, remove `--build --remove-orphans`:

`docker-compose -f docker-compose.yml up -d`

To stop you should use `stop`. To stop and delete use `down`:

```bash
docker-compose -f docker-compose.yml stop
docker-compose -f docker-compose.yml down
```

To only build the docker image:

`docker-compose -f docker-compose.yml build `

If your image is already built, you can use the `docker` command directly:

```bash
docker start plugin_server
docker stop plugin_server
```

### Security notes for docker containers

Docker is working on another layer meaning your internet connection from docker containers is bridged through your network interface by default. Starting this container with default configuration using commands from above opens port to this docker container to any incoming IP subnet existing (bind 0.0.0.0). Default system firewall configuration will not prevent access from outside world if your router does not block ports by default. KEEP THIS IN MIND. Storing vulnerable data inside container is not recommended with this configuration. You should edit docker network of `plugin_server` to make it harden. The easiest way is to set flag `--internal` for specific docker network, to prevent access from other computers.

## License

MIT
