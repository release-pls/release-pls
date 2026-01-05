import PackageJson from "@npmcli/package-json";

export async function bump(config, ctx) {
  const pkgJson = await PackageJson.load(ctx.cwd);

  pkgJson.update({
    version: ctx.version,
    publishConfig: {
      tag: ctx.tag,
    },
  });

  await pkgJson.save();
}
