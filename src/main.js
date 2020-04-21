import { app, BrowserWindow, Menu, session, autoUpdater, dialog } from 'electron';

var isDevMode = process.execPath.match(/[\\/]electron/);

const contextMenu = require('electron-context-menu');

let mainWindow;

if (!isDevMode) {

  const server = 'https://updater.watercooler.work'
  const feed = `${server}/update/${process.platform}/${app.getVersion()}`

  autoUpdater.setFeedURL(feed);

  setInterval(() => {
    autoUpdater.checkForUpdates()
  }, 900000);

  autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    const dialogOpts = {
      type: 'info',
      buttons: ['Restart', 'Later'],
      title: 'Update available for Water Cooler',
      message: process.platform === 'win32' ? releaseNotes : releaseName,
      detail: 'A new version has been downloaded. Restart the application to apply the updates.'
    }

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) autoUpdater.quitAndInstall()
    })
  })

  autoUpdater.on('error', message => {
    console.error('There was a problem updating the application')
    console.error(message)
  })

}

contextMenu({
	prepend: (defaultActions, params, browserWindow) => []
});


const filter = {
  urls: ['https://watercooler.work/api/login/slack?code=*&state=*', 'https://w.test/api/login/slack?code=*&state=*']
};

const createWindow = () => {

  // Create the browser window.
  if (!isDevMode) {

    var template = [{
      label: "Application",
      submenu: [
          { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
          { label: "Check for Updates", click: autoUpdater.checkForUpdates() },
          { type: "separator" },
          { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
      ]}, {
      label: "Edit",
      submenu: [
          { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
          { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
          { type: "separator" },
          { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
          { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
          { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
          { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
      ]}
    ];
  
    Menu.setApplicationMenu(Menu.buildFromTemplate(template)); 

    mainWindow = new BrowserWindow({
      titleBarStyle: 'hidden',
      width: 900,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        devTools: true
      }
    });
  } else {
    // Create the browser window.
    mainWindow = new BrowserWindow({
      titleBarStyle: 'hidden',
      width: 900,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
      }
    });
  }

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  session.defaultSession.webRequest.onBeforeRequest(filter, function (details, callback) {
    const url = details.url;

    var urlParams = new URLSearchParams(url);
    var slackCode = urlParams.get('https://watercooler.work/api/login/slack?code');

    mainWindow.loadURL(`${MAIN_WINDOW_WEBPACK_ENTRY}#/callback/slack/${slackCode}`);

    callback({
      cancel: false
    });
  });
};

app.commandLine.appendSwitch('force-fieldtrials', 'WebRTC-SupportVP9SVC/EnabledByFlag_2SL3TL/');

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
