import path from "path";
import fs from "fs-extra";
import decompress from "@xingrz/decompress";
import TarZst from "@xingrz/decompress-tarzst";
import { directoryInfo } from "./directory-info";
import { prettySize } from ".//pretty-size";
import type { Options, Size, CacheDetails, CacheItemMeta } from "../types";

function getSize(size: number): Size {
  return {
    bytes: size,
    pretty: prettySize(size),
  };
}

async function decompressCache({
  file,
  output,
}: {
  file: string;
  output: string;
}) {
  return decompress(file, output, {
    plugins: [TarZst()],
  });
}

export default async function getCacheDetails(opts: Options) {
  const directory = opts.cacheDir
    ? path.isAbsolute(opts.cacheDir)
      ? opts.cacheDir
      : path.join(process.cwd(), opts.cacheDir)
    : path.join(process.cwd(), "node_modules", ".cache", "turbo");

  if (!fs.exists(directory)) {
    console.log(`ERROR: No cache directory found at ${directory}`);
    return;
  }

  const allFiles = await fs.readdir(directory);
  const meta = allFiles.filter((f) => path.extname(f) === ".json");

  const cacheItems: Record<string, CacheDetails> = {};
  const metaData = await Promise.all(
    meta.map(
      (file): Promise<CacheItemMeta> => fs.readJSON(path.join(directory, file))
    )
  );

  metaData.forEach((item, idx) => {
    const metaFileName = path.join(directory, meta[idx]);
    const tarFileName = path.join(directory, `${item.hash}.tar.zst`);
    const stats = fs.statSync(tarFileName);

    cacheItems[item.hash] = {
      task: item,
      paths: {
        meta: metaFileName,
        tar: tarFileName,
        uncompressed: "",
      },
      cache: {
        files: [],
        size: {
          compressed: getSize(stats.size),
          uncompressed: getSize(0),
        },
      },
    };
  });

  // remove the decompressed directory
  await fs.remove(path.join(directory, "decompressed"));

  // decompress all files in tars
  for (const [hash, cacheDetails] of Object.entries(cacheItems)) {
    const outputDir = path.join(directory, `decompressed/${hash}`);
    await decompressCache({
      file: cacheDetails.paths.tar,
      output: outputDir,
    });

    cacheItems[hash].paths.uncompressed = outputDir;
    const allFileInfo = await directoryInfo(outputDir);
    cacheItems[hash].cache.files = allFileInfo;
    const totalSize = allFileInfo.reduce((acc, curr) => acc + curr.size, 0);
    cacheItems[hash].cache.size.uncompressed = getSize(totalSize);
  }

  return cacheItems;
}
