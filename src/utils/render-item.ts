interface Options {
  indentation?: number;
}

const SPACE = " ";
const COLUMN_WIDTH = 50;

export function renderItem(key: string, val: string, opts: Options) {
  const GAP = COLUMN_WIDTH - key.length <= 0 ? SPACE : SPACE.repeat(COLUMN_WIDTH - key.length);
  console.log(`${opts.indentation ? SPACE.repeat(opts.indentation) : ""}${key}:${GAP}${val}`);
}
