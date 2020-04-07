module.exports = {
    buildIdentifier: process.env.IS_BETA ? 'beta' : 'prod',
    "make_targets": {
        "win32": [
          "squirrel"
        ],
        "darwin": [
          "dmg"
        ],
        "linux": [
          "deb",
          "rpm"
        ]
      },
      "electronPackagerConfig": {
        "packageManager": "yarn",
        "icon": "icons/app",
        "osxSign": {
          "hardened-runtime": true,
	      "gatekeeper-assess": false,
        },
	    "entitlements": "./src/entitlements.plist",
        "entitlement-inherit": "./src/entitlements.plist",
        "appBundleId": "com.watercooler.app",
        "afterCopy": [
        ],
        "ignore": [
            ".md$",
            ".cache$",
            "out$",
            "env$",
            "rc$",
            "test$"
        ]
      },
      "electronInstallerDMG": {
        "sign": false
      },
      "electronWinstallerConfig": {
        "name": "watercooler"
      },
      "electronInstallerDebian": {},
      "electronInstallerRedhat": {},
      "github_repository": {
        "owner": "",
        "name": ""
      },
      "windowsStoreConfig": {
        "packageName": "",
        "name": "watercooler"
      },
      "hooks": {
        "postPackage": "./src/hooks/notarize.js"
      }
}


     