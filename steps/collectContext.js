import { checkGitRepoStatus, matchBranch } from "../utils/index.js";
import { NotGitRepoError, GitDirtyError } from "../errors.js";
import { execa } from "execa";
import hostedGitInfo from "hosted-git-info";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export async function collectContext(config) {
  const ctx = {
    cwd: process.cwd(),
    env: process.env,
  };
  const { isGitRepo, isClean } = await checkGitRepoStatus();

  if (!isGitRepo) throw new NotGitRepoError();
  if (!isClean) throw new GitDirtyError();

  await collectGitContext(config, ctx);
  await collectRepoContext(config, ctx);
  await collectPackageContext(config, ctx);

  return ctx;
}

async function collectPackageContext(config, ctx) {
  const pkgPath = resolve(ctx.cwd, "package.json");

  let pkg;
  try {
    pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
  } catch (err) {
    throw new Error(
      `Cannot read package.json in current directory: ${pkgPath}\n` +
        `Please run this command in a Node.js project root.`
    );
  }

  if (!pkg.version || typeof pkg.version !== "string") {
    throw new Error(`package.json does not contain a valid "version" field.`);
  }

  Object.assign(ctx, {
    name: pkg.name,
    version: pkg.version,
  });
}

async function collectGitContext(config, ctx) {
  const { stdout: branch } = await execa("git", [
    "rev-parse",
    "--abbrev-ref",
    "HEAD",
  ]);

  Object.assign((ctx.git ??= {}), {
    branch,
  });

  await assertAllowedBranch(config, ctx);
}

async function collectRepoContext(config, ctx) {
  let remoteUrl;

  try {
    const { stdout } = await execa("git", ["remote", "get-url", "origin"]);
    remoteUrl = stdout.trim();
  } catch {
    return;
  }

  const info = hostedGitInfo.fromUrl(remoteUrl);
  if (!info) return;

  Object.assign((ctx.repo ??= {}), {
    repository: info.project,
  });
}

async function assertAllowedBranch(config, ctx) {
  const { requireBranch } = config.git;

  if (!requireBranch) return;

  const current = ctx.git.branch;

  if (!matchBranch(requireBranch, current)) {
    throw new Error(
      `Release is only allowed on ${String(requireBranch)}, current: ${current}`
    );
  }
}
