import { app, BrowserWindow, Menu, autoUpdater, dialog, protocol, ipcMain, webContents, screen, powerMonitor, Notification, systemPreferences, Tray } from 'electron';
import { init } from '@sentry/electron/dist/main';
import * as Sentry from '@sentry/electron';
if(require('electron-squirrel-startup')) app.quit();
var path = require("path");

var isDevMode = process.execPath.match(/[\\/]electron/);

const contextMenu = require('electron-context-menu');

let mainWindow;

if (!isDevMode) {

  init({
    dsn: 'https://20e5d4f5d6d94630a28e5684a3048940@o281199.ingest.sentry.io/5176374',
    release: 'watercooler-desktop@' + app.getVersion()
  });

  const server = 'https://updater.watercooler.work'
  const feed = `${server}/update/${process.platform}/${app.getVersion()}`

  autoUpdater.setFeedURL(feed);

  setInterval(() => {
    try {
      autoUpdater.checkForUpdates()
    } catch (error) {
      //internet connection might be down
    }
  }, 3600000);

  autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {

    if (Notification.isSupported()) {
      const updateNotification = new Notification({
        title: 'An Update is Available',
        body: 'Click on this notification to restart Water Cooler and update now.',
        closeButtonText: 'Later'
      });

      updateNotification.show();

      updateNotification.on('click', clickEvent => {
        autoUpdater.quitAndInstall()
      })
    } else {
      const dialogOpts = {
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: 'Update available for Water Cooler',
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail: 'A new version has been downloaded. Click the Restart button to apply the updates.'
      }
  
      dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0) autoUpdater.quitAndInstall()
      })
    }

  })
  
}

contextMenu({
	prepend: (defaultActions, params, browserWindow) => []
});

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

    if (process.platform != "darwin") {
      template = [];
    }

    mainWindow = new BrowserWindow({
      titleBarStyle: 'hidden',
      transparent: true,
      width: 1000,
      height: 600,
      minWidth: 700,
      minHeight: 500,
      frame: false,
      webPreferences: {
        nodeIntegration: true,
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        devTools: false
      }
    });

    Menu.setApplicationMenu(Menu.buildFromTemplate(template)); 

  } else {
    // Create the browser window.
    mainWindow = new BrowserWindow({
      titleBarStyle: 'hidden',
      transparent:true,
      width: 1100,
      height: 600,
      minWidth: 700,
      minHeight: 500,
      frame: false,
      webPreferences: {
        nodeIntegration: true,
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
      }
    });

    if (process.platform != "darwin") {
      mainWindow.removeMenu();
    }

  }

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
};

app.commandLine.appendSwitch('force-fieldtrials', 'WebRTC-SupportVP9SVC/EnabledByFlag_2SL3TL/');
app.commandLine.appendSwitch('webrtc-max-cpu-consumption-percentage', 100);

if (process.platform == "darwin") {
  app.commandLine.appendSwitch('enable-oop-rasterization');
  app.commandLine.appendSwitch('enable-features', 'metal');
}

let tray = null;
let trayMenu = null;
let iconPath = path.resolve(__dirname, 'icons', 'appIconTemplate.png');

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();

  powerMonitor.on('suspend', () => {
    mainWindow.webContents.send('power_update', 'suspend');
  })

  powerMonitor.on('lock-screen', () => {
    mainWindow.webContents.send('power_update', 'lock-screen');
  })

  ipcMain.handle('get-current-window-dimensions', async (event) => {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize
    return { width, height }
  })

  ipcMain.handle('get-media-access-status', async (event, args) => {
    if (process.platform != "darwin") {
      return "granted";
    }

    return systemPreferences.getMediaAccessStatus(args.mediaType);
  })

  ipcMain.handle('update-tray-icon', async (event, args) => {
    if (typeof args.enable != "undefined" && tray == null) {
      tray = new Tray(iconPath);
      tray.setToolTip('Screen Sharing is Active');
    }

    if (typeof args.disable != "undefined" && tray != null) {
      tray.destroy();
      return tray = null;
    }

    if (typeof args.screenSharingActive != "undefined") {
      if (args.videoEnabled) {
        trayMenu = Menu.buildFromTemplate([
          { 
            label: args.screenSharingActive ? "Stop Sharing Screen" : "Start Sharing Entire Screen", click: function() {
              mainWindow.webContents.send('update-screen-sharing-controls', { toggleScreenSharing: args.screenSharingActive ? false : true, entireScreen: true });
              if (args.screenSharingActive) {
                return mainWindow.show();
              }

              mainWindow.setVisibleOnAllWorkspaces(true);
              mainWindow.hide();
              mainWindow.focus();
              mainWindow.setVisibleOnAllWorkspaces(false);
            }
          },
          {
            label: args.audioStatus ? "Mute Microphone" : "Unmute Microphone", click: function() {
              mainWindow.webContents.send('update-screen-sharing-controls', { toggleVideoOrAudio: "audio" });
            }
          },
          {
            label: args.videoStatus ? "Turn Off Camera" : "Turn On Camera", click: function() {
              mainWindow.webContents.send('update-screen-sharing-controls', { toggleVideoOrAudio: "video" });
            }
          },
          {
            label: "Leave Room", click: function() {
              mainWindow.webContents.send('update-screen-sharing-controls', { leaveRoom: true });
              mainWindow.show();
            } 
          }
        ])
      } else {
        trayMenu = Menu.buildFromTemplate([
          { 
            label: args.screenSharingActive ? "Stop Sharing Screen" : "Start Sharing Entire Screen", click: function() {
              mainWindow.webContents.send('update-screen-sharing-controls', { toggleScreenSharing: args.screenSharingActive ? false : true, entireScreen: true });
              if (args.screenSharingActive) {
                return mainWindow.show();
              }

              mainWindow.setVisibleOnAllWorkspaces(true);
              mainWindow.hide();
              mainWindow.focus();
              mainWindow.setVisibleOnAllWorkspaces(false);
            }
          },
          {
            label: args.audioStatus ? "Mute Microphone" : "Unmute Microphone", click: function() {
              mainWindow.webContents.send('update-screen-sharing-controls', { toggleVideoOrAudio: "audio" });
            }
          },
          {
            label: "Leave Room", click: function() {
              mainWindow.webContents.send('update-screen-sharing-controls', { leaveRoom: true });
              mainWindow.show();
            } 
          }
        ])
      }
    }

    tray.setContextMenu(trayMenu)

  })

  ipcMain.handle('update-screen-sharing-controls', async (event, args) => {

    if (typeof args.starting != "undefined") {    
      return mainWindow.hide();
    }

    if (typeof args.leaveRoom != "undefined" || typeof args.toggleScreenSharing != "undefined") {
      mainWindow.show();
    }

    if (typeof args.screenSharingWindow != "undefined") {
      BrowserWindow.fromId(args.screenSharingWindow).webContents.send('update-screen-sharing-controls', args);
    } else {
      mainWindow.webContents.send('update-screen-sharing-controls', args);
    }
    return true;
  })

});

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
app.setAsDefaultProtocolClient("watercooler");

app.on('open-url', (ev, url) => {
  ev.preventDefault();

  mainWindow.webContents.send('url_update', url)
});