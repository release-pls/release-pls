import {
  GitDirtyError,
  GitNotInstalledError,
  GitRemoteNotFoundError,
  NotGitRepoError,
} from "../errors.js";
import type { ResolvedConfig } from "../options.ts";
import {
  effect,
  getGitRemoteUrl,
  hasGit,
  isGitClean,
  isGitRepo,
} from "../utils/index.ts";

export async function checkGitRepoStatus(config: ResolvedConfig) {
  // 检查是否安装过了git
  const isGitInstalled = await hasGit();
  if (!isGitInstalled) throw new GitNotInstalledError();
  // 检查是否是一个git仓库
  const isRepo = await isGitRepo();
  if (!isRepo) throw new NotGitRepoError();

  await effect(config, `check if working directory is clean`, async () => {
    // 检查是否是一个干净的Git仓库
    const isClean = await isGitClean();
    if (!isClean) throw new GitDirtyError();
  });

  // 获取远程提交地址
  const remoteUrl = await getGitRemoteUrl();
  if (!remoteUrl) throw new GitRemoteNotFoundError();
}
