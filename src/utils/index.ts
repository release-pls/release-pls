import ansis from "ansis";
import { createConsola } from "consola";
import { createDefu } from "defu";
import { x } from "tinyexec";

import { NAME } from "../constants.ts";
import type { InternalReleaseContext, ResolvedConfig } from "../options.ts";

type RequireBranch = ResolvedConfig["git"]["requireBranch"];

export async function getGitHead(): Promise<string> {
  const { stdout } = await x("git", ["rev-parse", "HEAD"], {
    throwOnError: true,
  });
  return stdout.trim();
}

export async function gitReset(context: InternalReleaseContext) {
  if (!context.initialRef) return;

  const tagName = context.git?.tagName;

  if (tagName) {
    // 删除可能已经创建的tag
    await x("git", ["tag", "-d", tagName]);
  }

  await x("git", ["reset", "--hard", context.initialRef]);
}

export const logger = createConsola({
  defaults: {
    tag: NAME,
  },
});

export const defu = createDefu((obj, key, value) => {
  if (Array.isArray(obj[key]) && Array.isArray(value)) {
    obj[key] = value; // 直接覆盖
    return true;
  }
});

export async function gitChangeset() {
  await x("git", ["status", "--porcelain"], {
    throwOnError: true,
    nodeOptions: {
      stdio: "inherit",
    },
  });
}

export async function isGitRepo() {
  try {
    const { stdout } = await x("git", ["rev-parse", "--is-inside-work-tree"], {
      throwOnError: true,
    });
    return stdout.trim() === "true";
  } catch {
    return false;
  }
}

export async function isGitClean() {
  const { stdout } = await x("git", ["status", "--porcelain"]);
  return stdout.trim().length === 0;
}

export async function hasGit() {
  try {
    await x("git", ["--version"], { throwOnError: true });
    return true;
  } catch {
    return false;
  }
}

export async function getGitRemoteUrl(): Promise<string> {
  try {
    const { stdout } = await x("git", ["remote", "get-url", "origin"], {
      throwOnError: true,
    });
    return stdout.trim();
  } catch {
    return "";
  }
}

export function renderTemplate(
  template: string,
  context: InternalReleaseContext,
): string {
  if (typeof template !== "string") {
    throw new TypeError("Template must be a string");
  }

  return template.replace(/\$\{([^}]+)\}/g, (_, expr: string) => {
    const value = expr.split(".").reduce<unknown>((acc, key) => {
      if (acc && typeof acc === "object") {
        return (acc as Record<string, unknown>)[key];
      }
      return undefined;
    }, context);

    if (value == null) {
      throw new Error(`Template variable "${expr}" is not defined`);
    }

    if (
      typeof value !== "string" &&
      typeof value !== "number" &&
      typeof value !== "boolean"
    ) {
      throw new TypeError(
        `Template variable "${expr}" must be a primitive value`,
      );
    }

    return String(value);
  });
}

export function blank(lines: number = 1): void {
  process.stdout.write("\n".repeat(lines));
}

export function matchBranch(rule: RequireBranch, current: string): boolean {
  if (rule === false) return true;

  if (typeof rule === "string") {
    return current === rule;
  }

  if (Array.isArray(rule)) {
    return rule.includes(current);
  }

  if (rule instanceof RegExp) {
    return rule.test(current);
  }

  return false;
}

export async function getGitCurrentBranch(): Promise<string> {
  const { stdout } = await x("git", ["symbolic-ref", "--short", "HEAD"], {
    throwOnError: true,
  });
  return stdout.trim();
}

export function dryRunLog(desc: string) {
  logger.info(ansis.yellow(`[dry-run] would ${desc}`));
}

export function effect<T>(
  config: ResolvedConfig,
  desc: string,
  fn: () => T | Promise<T>,
) {
  if (config.dryRun) {
    dryRunLog(desc);
    return;
  }
  return Promise.resolve().then(fn);
}

export function runInDryRun<T>(
  config: ResolvedConfig,
  fn: () => T | Promise<T>,
): Promise<T | undefined> {
  if (!config.dryRun) {
    return Promise.resolve(undefined);
  }
  return Promise.resolve().then(fn);
}
