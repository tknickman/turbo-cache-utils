import chalk from "chalk";
import path from 'path';
import getCacheDetails from "../../utils/cache-details";
import type { Options, CacheDetails } from "../../types";
import { prettySize } from "../../utils/pretty-size";
import { renderItem } from "../../utils/render-item";

const randColorHex = (hash: string) => {
  return chalk.hex("#" + ((Math.random() * 0xffffff) << 0).toString(16))(hash);
};

function renderCacheItem(item: CacheDetails) {
  console.log();
  console.log(randColorHex(item.task.hash));
  console.log("⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯");

  console.log(chalk.bold(`Info:`));
  console.log(`   Task Duration:        ${item.task.duration}ms`);

  console.log(chalk.bold(`Cache Stats:`));
  console.log(`   Compressed Size:      ${item.cache.size.compressed.pretty}`);
  console.log(
    `   Uncompressed Size:    ${item.cache.size.uncompressed?.pretty}`
  );
  console.log(`   Number of files:      ${item.cache.files.length}`);

  console.log(chalk.bold(`Files:`));
  console.log(`   Meta File:            ${item.paths.meta}`);
  console.log(`   Compressed Cache:     ${item.paths.tar}`);
  if (item.paths.uncompressed) {
    console.log(`   Uncompressed Cache:   ${item.paths.uncompressed}`);
  }
}

function renderCachedFiles(item: CacheDetails, limit = 10) {
  const sortedFiles = item.cache.files.sort((a, b) => b.size - a.size);
  const files = sortedFiles.slice(0, limit);
  const limitSize = files.reduce((acc, file) => acc + file.size, 0);
  const percent = ((100 / item.cache.size.uncompressed.bytes) * limitSize).toFixed(2);
  const uncompressedDir = item.paths.uncompressed || '';
  const getRelative = (file: string) => path.relative(uncompressedDir, file);

  console.log(chalk.bold(`Largest ${limit} files (${prettySize(limitSize)} / ${percent}${chalk.dim(`%`)}):`))
  files.forEach((file) => {
    console.log(`   ${getRelative(file.file)}: ${prettySize(file.size)} (${file.size}${chalk.dim('b')})`);
  });
}

export default async function inspect(hash: string | undefined, opts: Options) {
  const cacheDetails = await getCacheDetails(opts);

  if (!cacheDetails) {
    console.log("No local cache entries found.");
    return;
  }

  if (opts.list) {
    console.log();
    Object.keys(cacheDetails).forEach((hash) => {
      console.log(hash)
    });
    return
  }

  if (hash) {
    const item = cacheDetails[hash];

    if (!item) {
      console.log(`No cache entry found for ${hash}`);
      return;
    }
    renderCacheItem(item);

    console.log()
    renderCachedFiles(item, opts.limit);
    return;
  }

  console.log();
  console.log(
    chalk.bold(
      `${Object.keys(cacheDetails).length} CACHED TASK${
        Object.keys(cacheDetails).length > 1 ? "S" : ""
      }`
    )
  );
  Object.values(cacheDetails).forEach(renderCacheItem);
}
