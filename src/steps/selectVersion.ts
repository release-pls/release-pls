import { input, select } from "@inquirer/prompts";
import { gt, inc, prerelease, valid } from "semver";

import type { InternalReleaseContext, ResolvedConfig } from "../options.ts";
import { renderTemplate } from "../utils/index.ts";

export async function selectVersion(
  config: ResolvedConfig,
  context: InternalReleaseContext,
) {
  let targetVersion;
  const isPrerelease = prerelease(context.latestVersion);

  // 构建版本选项
  const choices = config.increments.map((type) => ({
    name: `${type} (${inc(context.latestVersion, type)})`,
    value: inc(context.latestVersion, type),
  }));

  // 如果当前是预发布版本，插入 prerelease 选项
  if (isPrerelease) {
    choices.unshift({
      name: `prerelease (${inc(context.latestVersion, "prerelease")})`,
      value: inc(context.latestVersion, "prerelease"),
    });
  }

  // custom 始终放最后
  choices.push({
    name: "custom",
    value: "custom",
  });

  const release = await select({
    message: "What do you want to release",
    choices,
  });

  if (!release) context.cancel();

  targetVersion = release;

  // 自定义版本号
  if (release === "custom") {
    const customVersion = await input({
      message: "Input custom version",
      default: context.latestVersion,
      validate(value) {
        const v = value.trim();

        if (!valid(v)) {
          return "Invalid semver version";
        }

        if (!gt(v, context.latestVersion)) {
          return `Version must be greater than current version: ${context.latestVersion}`;
        }

        return true;
      },
    });

    targetVersion = customVersion;
  }

  // 赋值给上下文
  context.version = targetVersion;
  context.git = {
    ...context.git,
    tagName: renderTemplate(config.git.tagName, context),
    commitMessage: renderTemplate(config.git.commitMessage, context),
  };
}
