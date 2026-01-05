import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "release-pls",
  base: "/release-pls/",
  description: "一个简单的发布工具",
  head: [
    ["link", { rel: "icon", href: "favicon.svg", type: "image/svg+xml" }],
    [
      "meta",
      {
        name: "google",
        content: `notranslate`,
      },
    ],
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Guide", link: "/guide/getting-started", activeMatch: "/guide/" },
      {
        text: "Reference",
        link: "/reference/cli",
        activeMatch: "/reference/",
      },
    ],

    logo: { src: "/logo-mini.svg", width: 24, height: 24 },
    sidebar: {
      "/guide/": [
        {
          text: "Guide",
          base: "/guide/",
          items: [{ text: "getting-started", link: "getting-started" }],
        },
      ],

      "/reference/": [
        {
          text: "Reference",
          base: "/reference/",
          items: [{ text: "CLI", link: "cli" }],
        },
      ],
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/release-pls/release-pls" },
    ],
  },
});
