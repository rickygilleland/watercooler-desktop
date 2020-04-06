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
          "identity": process.env.SIGNING_IDENTITY
        },
        "hardened-runtime": true,
	    "gatekeeper-assess": false,
	    "entitlements": "./src/entitlements.plist",
        "entitlement-inherit": "./src/entitlements.plist",
        "appBundleId": "com.watercooler.app",
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


     