export default {
  increments: ["patch", "minor", "major"],
  tags: ["latest", "next"],

  changelog: {
    disable: false,
    args: "-o --tag ${version}",
    template: [],
  },

  git: {
    requireBranch: false,
    commitMessage: "release: v${version}",
    tagName: "v${version}",
  },

  hooks: {},
};
