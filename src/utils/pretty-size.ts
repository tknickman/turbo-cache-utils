import chalk from "chalk";

const SIZES = ["Bytes", "KB", "MB", "GB", "TB"];

export function prettySize(bytes: number): string {
  if (bytes == 0) {
    return "0 Bytes";
  }

  const i = Math.floor(Math.log(bytes) / Math.log(1000));

  if (i == 0) {
    return `${bytes}${chalk.dim(SIZES[i])}`;
  }

  return `${(bytes / Math.pow(1000, i)).toFixed(1)}${chalk.dim(SIZES[i])}`;
}
