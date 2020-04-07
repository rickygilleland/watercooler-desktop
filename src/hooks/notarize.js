const { notarize } = require('electron-notarize');

// Path from here to your build app executable:
const buildOutput = require('path').resolve(
    __dirname,
    '..',
    'out',
    'Water Cooler-darwin-x64',
    'Water Cooler.app'
);

module.exports = function () {
    if (process.platform !== 'darwin') {
        console.log('Not a Mac; skipping notarization');
        return;
    }

    console.log('Notarizing...');

    return notarize({
        appBundleId: "com.watercooler.app",
        appPath: buildOutput,
        appleId: process.env.APPLE_ID,
        appleIdPassword: process.env.APPLE_ID_PASSWORD
    }).catch((e) => {
        console.error(e);
        throw e;
    });
}