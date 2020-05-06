module.exports = {
    "packagerConfig": {
        "icon": "icons/app",
        "extendInfo": "./src/info.plist",
        "osxSign": {
            "hardened-runtime": true,
            "gatekeeper-assess": false,
            "entitlements": "./src/entitlements.plist",
            "entitlements-inherit": "./src/entitlements.plist",
            "appBundleId": "com.watercooler.app"
        },
        "appBundleId": "com.watercooler.app"
    },
      "makers": [
        {
          "name": "@electron-forge/maker-squirrel",
          "config": {
            "name": "watercooler"
          }
        },
        {
            "name": '@electron-forge/maker-dmg',
            "config": {}
        },
        {
          "name": "@electron-forge/maker-deb",
          "config": {}
        },
        {
          "name": "@electron-forge/maker-rpm",
          "config": {}
        },
        {
          "name": '@electron-forge/maker-zip',
          "config": {}
        }
      ],
      "plugins": [
        [
          "@electron-forge/plugin-webpack",
          {
            "mainConfig": "./webpack.main.config.js",
            "renderer": {
              "config": "./webpack.renderer.config.js",
              "entryPoints": [
                {
                  "html": "./src/index.html",
                  "js": "./src/renderer.js",
                  "name": "main_window"
                }
              ]
            }
          }
        ]
      ],
      "hooks": {
        "postPackage": require("./hooks/notarize.js")
        },
    "publishers": [
        {
            "name": '@electron-forge/publisher-github',
            "config": {
              "repository": {
                "owner": process.env.GITHUB_REPO_OWNER,
                "name": process.env.GITHUB_REPO_NAME
              },
              "authToken": process.env.GITHUB_TOKEN,
              "prerelease": false
            }
          }
    ]
}
