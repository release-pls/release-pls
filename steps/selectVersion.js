import prompts from "prompts";
import { CancelledError } from "../errors.js";
import semver from "semver";

const { inc, valid, prerelease } = semver;

export async function selectVersion(config, ctx) {
  let targetVersion;
  const currentVersion = ctx.version;
  const isPrerelease = prerelease(currentVersion);

  // 构建版本选项
  const choices = config.increments.map((type) => ({
    title: `${type} (${inc(currentVersion, type)})`,
    value: inc(currentVersion, type),
  }));

  // 如果当前是预发布版本，插入 prerelease 选项
  if (isPrerelease) {
    choices.unshift({
      title: `prerelease (${inc(currentVersion, "prerelease")})`,
      value: inc(currentVersion, "prerelease"),
    });
  }

  // custom 始终放最后
  choices.push({
    title: "custom",
    value: "custom",
  });

  const { release } = await prompts({
    type: "select",
    name: "release",
    message: "What do you want to release",
    choices,
  });

  if (!release) {
    throw new CancelledError();
  }

  // 自定义版本号
  if (release === "custom") {
    const { version } = await prompts({
      type: "text",
      name: "version",
      message: "Input custom version",
      initial: currentVersion,
      validate(value) {
        const v = value.trim();
        if (!valid(v)) return "Invalid semver version";
        if (!semver.gt(value, currentVersion)) {
          return "Version must be greater than current version";
        }
        return true;
      },
      onRender() {
        if (this.firstRender) {
          this.value = currentVersion;
          this.cursor = currentVersion.length;
        }
      },
    });

    if (!version) {
      throw new CancelledError();
    }

    targetVersion = version;
  } else {
    targetVersion = release;
  }

  ctx.version = targetVersion;
}
