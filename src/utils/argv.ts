export function hasFlag(argv: string[], name: string): boolean {
  const prefix = name.length === 1 ? `-${name}` : `--${name}`;

  for (const arg of argv) {
    if (arg === "--") break;

    // 完整匹配（无值 flag）
    if (arg === prefix) {
      return true;
    }

    // 带值写法：--foo=bar
    if (arg.startsWith(`${prefix}=`)) {
      return true;
    }
  }

  return false;
}

export function getFlagValue(argv: string[], name: string) {
  const prefix = name.length === 1 ? `-${name}` : `--${name}`;

  for (const [index, arg] of argv.entries()) {
    if (arg === "--") break;

    if (arg === prefix) {
      return argv[index + 1];
    }

    if (arg.startsWith(`${prefix}=`)) {
      return arg.split("=")[1];
    }
  }
}

export function removeFlag(argv: string[], name: string) {
  const prefix = name.length === 1 ? `-${name}` : `--${name}`;
  const result: string[] = [];

  for (const [index, arg] of argv.entries()) {
    if (arg === "--") {
      // 后面全部原样保留
      result.push(...argv.slice(index));
      break;
    }

    if (arg === prefix) {
      continue;
    }

    if (arg.startsWith(`${prefix}=`)) {
      continue;
    }

    result.push(arg);
  }

  return result;
}
