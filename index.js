"use strict";

let { abort, repr } = require("faucet-pipeline/lib/util");
let parseArgs = require("minimist");

let DEFAULTS = {
	input: "./views/index.jsx",
	output: "./dist/views.js"
};

let HELP = `
Usage:
  $ complate [options]

Options:
  -h, --help
    display this help message
  -i, --input
    entry point (defaults to ${repr(DEFAULTS.input)})
  -o, --output
    bundle target (defaults to ${repr(DEFAULTS.output)})
  -w, --watch
    monitor the file system for changes to recompile automatically
  --cjs
    generate CommonJS bundle (e.g. for Node.js)
  --compact
    reduce bundle size
`.trim();

// TODO: support for
// * `watchDirs` (`--watch …`)
// * `esnext`
// * `jsx.exclude`
// (might be better to auto-generate a faucet configuration file though)
// XXX: largely duplicates `faucet-pipeline/lib/cli.js`
module.exports = function parseCLI(argv = process.argv.slice(2), help = HELP) {
	argv = parseArgs(argv, {
		alias: {
			i: "input",
			o: "output",
			w: "watch",
			h: "help"
		}
	});

	if(argv.help) {
		abort(help, 0);
	}

	let options = ["watch", "compact"].reduce((memo, option) => {
		let value = argv[option];
		if(value !== undefined) {
			memo[option] = value;
		}
		return memo;
	}, {});

	let config = {
		source: argv.input || DEFAULTS.input,
		target: argv.output || DEFAULTS.output,
		moduleName: "render",
		jsx: { pragma: "createElement" }
	};
	if(argv.cjs) {
		config.format = "cjs";
	}

	return {
		rootDir: process.cwd(),
		config: { js: [config] },
		options
	};
};
