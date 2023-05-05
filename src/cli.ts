#!/usr/bin/env node

import chalk from "chalk";
import { Command, Option } from "commander";

import { inspect } from "./commands";
import cliPkg from "../package.json";

const cli = new Command();

cli
  .name(cliPkg.name)
  .description(cliPkg.description)
  .version(cliPkg.version, "-v, --version", "Output the current version");

// migrate
cli
  .command("inspect")
  .argument("[hash]", "hash of the cache entry to inspect")
  .addOption(
    new Option("-d, --cache-dir <dir>").default("./node_modules/.cache/.turbo")
  )
  .addOption(new Option("-l, --list", "list all hashes in the cache"))
  .addOption(
    new Option(
      "-x, --limit <num>",
      "number of files to show when inspecting a cache entry (sorted by size)"
    ).default(10)
  )
  .action(inspect);

cli.parseAsync().catch(async (reason) => {
  console.log();
  console.log(chalk.red("Unexpected error. Please report it as a bug:"));
  console.log(reason);

  process.exit(1);
});
