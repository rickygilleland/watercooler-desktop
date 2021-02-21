module.exports = {
  packagerConfig: {
    icon: "./icons/app",
    extendInfo: "./src/info.plist",
    osxSign: {
      "hardened-runtime": true,
      "gatekeeper-assess": false,
      entitlements: "./src/entitlements.plist",
      "entitlements-inherit": "./src/entitlements.plist",
      appBundleId: "com.blab.app",
    },
    osxNotarize: {
      appleApiKey: process.env.MAC_API_KEY_ID,
      appleApiIssuer: process.env.MAC_API_KEY_ISSUER_ID,
    },
    appBundleId: "com.blab.app",
    asar: true,
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "blab",
      },
    },
    {
      name: "@electron-forge/maker-dmg",
      config: {},
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
    {
      name: "@electron-forge/maker-zip",
      config: {},
    },
  ],
  plugins: [
    [
      "@electron-forge/plugin-webpack",
      {
        mainConfig: "./webpack.main.config.js",
        renderer: {
          config: "./webpack.renderer.config.js",
          entryPoints: [
            {
              html: "./src/index.html",
              js: "./src/renderer.tsx",
              name: "main_window",
            },
          ],
        },
        loggerPort: "9001",
      },
    ],
    ["@electron-forge/plugin-auto-unpack-natives"],
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: "watercooler-chat",
          name: "watercooler-desktop",
        },
        authToken: process.env.GITHUB_TOKEN,
        prerelease: false,
      },
    },
  ],
};
