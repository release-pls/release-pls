import { resolve } from "node:path";
import { lilconfig } from "lilconfig";
import { access, constants } from "node:fs/promises";
import { merge } from "lodash-es";

async function loadConfig(configKey, customPath, overrides) {
  let result;
  const explorer = lilconfig(configKey);
  if (customPath) {
    // 传递了config选项
    const filepath = resolve(process.cwd(), customPath);

    // 检查该文件是否存在
    const exists = await fileExists(filepath);

    if (!exists) {
      throw new Error(`No ${configKey} configuration found.`);
    }
    result = await explorer.load(filepath);
  } else {
    result = await explorer.search();
  }

  result = result?.config || {};
  if (!overrides) return result;
  return merge({}, result, overrides);
}

async function fileExists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export { loadConfig };
