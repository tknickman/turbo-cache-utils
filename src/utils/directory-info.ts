import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { Dirent } from 'fs';

interface FileInfo {
  file: string;
  size: number;
}

export async function directoryInfo(dir: string): Promise<Array<FileInfo>> {
  const files: Dirent[] = await readdir(dir, { withFileTypes: true });

  const info = files.map(async (file: Dirent) => {
    const filePath: string = join(dir, file.name);

    if (file.isDirectory()) {
      return await directoryInfo(filePath);
    }

    if (file.isFile()) {
      const { size } = await stat(filePath);
      return {
        file: filePath,
        size,
      }
    }

    return [];
  });

  const allFiles = (await Promise.all(info)).flat()

  return allFiles;
}