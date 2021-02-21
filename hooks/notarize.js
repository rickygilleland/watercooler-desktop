const { notarize } = require("electron-notarize");
const path = require("path");

// Path from here to your build app executable:
const buildOutput = path.resolve(
  __dirname,
  "..",
  "out",
  "Blab-darwin-x64",
  "Blab.app",
);

module.exports = function () {
  if (process.platform !== "darwin") {
    console.log("Not a Mac; skipping notarization");
    return;
  }

  console.log("Notarizing...");

  return notarize({
    appBundleId: "com.blab.app",
    appPath: buildOutput,
    appleApiKey: process.env.MAC_API_KEY_ID,
    appleApiIssuer: process.env.MAC_API_KEY_ISSUER_ID,
    ascProvider: process.env.APPLE_PROVIDER,
  }).catch((e) => {
    throw e;
  });
};
