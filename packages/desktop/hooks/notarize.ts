/* eslint-disable @typescript-eslint/no-var-requires */
const { notarize } = require('electron-notarize');
const path = require('path');

// Path from here to your build app executable:
const buildOutput = path.resolve(
    __dirname,
    '..',
    'out',
    'Blab-darwin-x64',
    'Blab.app'
);

module.exports = () => {
    if (process.platform !== 'darwin') {
        console.log('Not a Mac; skipping notarization');
        return;
    }

    console.log('Notarizing...');

    return notarize({
        appBundleId: "com.blab.app",
        appPath: buildOutput,
        appleId: process.env.APPLE_ID,
        appleIdPassword: process.env.APPLE_ID_PASSWORD,
        ascProvider: process.env.APPLE_PROVIDER
    }).catch((e) => {
        throw e;
    });
}