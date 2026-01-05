# release-pls

A lightweight, generic release CLI with steps and hooks.

## 配置

```js
export default {
  increments: ["patch", "minor", "major"],
  tags: ["latest", "next", "beta", "alpha", "rc"],

  git: {
    commitMessage: "release: v${version}",
    tagName: "v${version}",
    push: true,
  },

  hooks: {
    "before:selectVersion": ({ version }) => {
      console.log("Before selecting version");
    },

    "after:selectVersion": ({ version }) => {
      console.log("After selecting version", version);
    },

    "before:bump": "npm run test",

    "after:bump": ({ version, cancel }) => {
      if (version === "0.2.7") {
        cancel("User aborted");
      }
      console.log("Updated version to", version);
    },
  },
};
```

## 子命令

### changelog

```bash
npx release-pls changelog --help

# 也支持传入配置文件
npx release-pls --config configs/my.mjs changelog
```

## 分支保护

新增分支保护功能,支持下面几种用法

```js
requireBranch: "main";
requireBranch: ["main", "release"];
requireBranch: /^release\/.+$/;
```

## 🙏 Credits

本项目的灵感来源、依赖于以下项目：

- [release-it](https://github.com/release-it/release-it)
- [git-cliff](https://github.com/orhun/git-cliff)
