export function hasFlag(argv: string[], name: string | string[]): boolean {
  const prefixes = normalizePrefixes(name);

  for (const arg of argv) {
    if (arg === "--") break;

    for (const prefix of prefixes) {
      if (arg === prefix) return true;
      if (arg.startsWith(`${prefix}=`)) return true;
    }
  }

  return false;
}

export function getFlagValue(argv: string[], name: string | string[]) {
  const prefixes = normalizePrefixes(name);

  for (const [index, arg] of argv.entries()) {
    if (arg === "--") break;

    for (const prefix of prefixes) {
      if (arg === prefix) {
        return argv[index + 1];
      }

      if (arg.startsWith(`${prefix}=`)) {
        return arg.slice(prefix.length + 1);
      }
    }
  }
}

export function removeFlag(argv: string[], name: string | string[]) {
  const prefixes = normalizePrefixes(name);
  const result: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!; //避免ts的过渡谨慎

    if (arg === "--") {
      result.push(...argv.slice(i));
      break;
    }

    let matched = false;

    for (const prefix of prefixes) {
      if (arg === prefix) {
        // 跳过 value
        i++;
        matched = true;
        break;
      }

      if (arg.startsWith(`${prefix}=`)) {
        matched = true;
        break;
      }
    }

    if (!matched) {
      result.push(arg);
    }
  }

  return result;
}

function normalizePrefixes(name: string | string[]) {
  const names = Array.isArray(name) ? name : [name];

  return names.map((n) => (n.length === 1 ? `-${n}` : `--${n}`));
}
