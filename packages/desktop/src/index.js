import {
  app,
  BrowserWindow,
  Menu,
  autoUpdater,
  dialog,
  protocol,
  ipcMain,
  webContents,
  screen,
  powerMonitor,
  Notification,
  systemPreferences,
  Tray,
} from "electron";
import { init } from "@sentry/electron/dist/main";
import * as Sentry from "@sentry/electron";
import ElectronStore from "electron-store";
if (require("electron-squirrel-startup")) app.quit();
var path = require("path");

var isDevMode = process.execPath.match(/[\\/]electron/);

const contextMenu = require("electron-context-menu");

let mainWindow;

if (!isDevMode) {
  init({
    dsn:
      "https://20e5d4f5d6d94630a28e5684a3048940@o281199.ingest.sentry.io/5176374",
    release: "blab@" + app.getVersion(),
  });

  const server = "https://updater.blab.to";
  const feed = `${server}/update/${process.platform}/${app.getVersion()}`;

  autoUpdater.setFeedURL(feed);

  setInterval(() => {
    try {
      autoUpdater.checkForUpdates();
    } catch (error) {
      //internet connection might be down
    }
  }, 3600000);

  autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
    if (Notification.isSupported()) {
      const updateNotification = new Notification({
        title: "An Update is Available",
        body: "Click on this notification to restart Blab and update now.",
        closeButtonText: "Later",
      });

      updateNotification.show();

      updateNotification.on("click", (clickEvent) => {
        autoUpdater.quitAndInstall();
      });
    } else {
      const dialogOpts = {
        type: "info",
        buttons: ["Restart", "Later"],
        title: "Update available for Blab",
        message: process.platform === "win32" ? releaseNotes : releaseName,
        detail:
          "A new version has been downloaded. Click the Restart button to apply the updates.",
      };

      dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0) autoUpdater.quitAndInstall();
      });
    }
  });
}

contextMenu({
  prepend: (defaultActions, params, browserWindow) => [],
});

const createWindow = () => {
  ElectronStore.initRenderer();

  // Create the browser window.
  if (!isDevMode) {
    var template = [
      {
        label: "Application",
        submenu: [
          {
            label: "About Application",
            selector: "orderFrontStandardAboutPanel:",
          },
          { label: "Check for Updates", click: autoUpdater.checkForUpdates() },
          { type: "separator" },
          {
            label: "Quit",
            accelerator: "Command+Q",
            click: function () {
              app.quit();
            },
          },
        ],
      },
      {
        label: "Edit",
        submenu: [
          { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
          {
            label: "Redo",
            accelerator: "Shift+CmdOrCtrl+Z",
            selector: "redo:",
          },
          { type: "separator" },
          { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
          { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
          { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
          {
            label: "Select All",
            accelerator: "CmdOrCtrl+A",
            selector: "selectAll:",
          },
        ],
      },
    ];

    if (process.platform != "darwin") {
      template = [];
    }

    mainWindow = new BrowserWindow({
      titleBarStyle: "hidden",
      vibrancy: "sidebar",
      transparent: true, //necessary for vibrancy fix on macos
      backgroundColor: "#80FFFFFF", //necessary for vibrancy fix on macos
      width: 1000,
      height: 600,
      minWidth: 700,
      minHeight: 600,
      frame: false,
      webPreferences: {
        nodeIntegration: true,
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        devTools: false,
        backgroundThrottling: false,
        enableRemoteModule: true,
      },
    });

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  } else {
    // Create the browser window.
    mainWindow = new BrowserWindow({
      titleBarStyle: "hidden",
      vibrancy: "sidebar",
      transparent: true, //necessary for vibrancy fix on macos
      backgroundColor: "#80FFFFFF", //necessary for vibrancy fix on macos
      width: 1100,
      height: 600,
      minWidth: 700,
      minHeight: 600,
      frame: false,
      webPreferences: {
        nodeIntegration: true,
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        backgroundThrottling: false,
        enableRemoteModule: true,
      },
    });

    if (process.platform != "darwin") {
      mainWindow.removeMenu();
    }
  }

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  powerMonitor.on("suspend", () => {
    mainWindow.webContents.send("power_update", "suspend");
  });

  powerMonitor.on("lock-screen", () => {
    mainWindow.webContents.send("power_update", "lock-screen");
  });

  ipcMain.handle("get-current-window-dimensions", async (event) => {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    return { width, height };
  });

  ipcMain.handle("get-media-access-status", async (event, args) => {
    if (process.platform != "darwin") {
      return "granted";
    }

    return systemPreferences.getMediaAccessStatus(args.mediaType);
  });

  ipcMain.handle("update-tray-icon", async (event, args) => {
    if (typeof args.enable != "undefined" && tray == null) {
      tray = new Tray(iconPath);
      tray.setToolTip("Blab");
    }

    if (typeof args.disable != "undefined" && tray != null) {
      tray.destroy();
      return (tray = null);
    }

    if (typeof args.screenSharingActive != "undefined") {
      tray.setToolTip("Blab");
      if (args.screenSharingActive) {
        tray.setToolTip("Blab is Sharing Your Screen");
      }
      if (args.videoEnabled) {
        trayMenu = Menu.buildFromTemplate([
          {
            label: args.screenSharingActive
              ? "Stop Sharing Screen"
              : "Start Sharing Entire Screen",
            click: function () {
              mainWindow.webContents.send("update-screen-sharing-controls", {
                toggleScreenSharing: args.screenSharingActive ? false : true,
                entireScreen: true,
              });
              if (args.screenSharingActive) {
                return mainWindow.show();
              }

              if (process.platform == "darwin") {
                var screenAccessGranted = systemPreferences.getMediaAccessStatus(
                  "screen",
                );

                if (screenAccessGranted != "granted") {
                  return false;
                }
              }

              mainWindow.setVisibleOnAllWorkspaces(true);
              mainWindow.hide();
              mainWindow.focus();
              mainWindow.setVisibleOnAllWorkspaces(false);
            },
          },
          {
            label: args.audioStatus ? "Mute Microphone" : "Unmute Microphone",
            click: function () {
              mainWindow.webContents.send("update-screen-sharing-controls", {
                toggleVideoOrAudio: "audio",
              });
            },
          },
          {
            label: args.videoStatus ? "Turn Off Camera" : "Turn On Camera",
            click: function () {
              mainWindow.webContents.send("update-screen-sharing-controls", {
                toggleVideoOrAudio: "video",
              });
            },
          },
          {
            label: "Leave Room",
            click: function () {
              mainWindow.webContents.send("update-screen-sharing-controls", {
                leaveRoom: true,
              });
              mainWindow.show();
            },
          },
        ]);
      } else {
        trayMenu = Menu.buildFromTemplate([
          {
            label: args.screenSharingActive
              ? "Stop Sharing Screen"
              : "Start Sharing Entire Screen",
            click: function () {
              mainWindow.webContents.send("update-screen-sharing-controls", {
                toggleScreenSharing: args.screenSharingActive ? false : true,
                entireScreen: true,
              });
              if (args.screenSharingActive) {
                return mainWindow.show();
              }

              if (process.platform == "darwin") {
                var screenAccessGranted = systemPreferences.getMediaAccessStatus(
                  "screen",
                );

                if (screenAccessGranted != "granted") {
                  return false;
                }
              }

              mainWindow.setVisibleOnAllWorkspaces(true);
              mainWindow.hide();
              mainWindow.focus();
              mainWindow.setVisibleOnAllWorkspaces(false);
            },
          },
          {
            label: args.audioStatus ? "Mute Microphone" : "Unmute Microphone",
            click: function () {
              mainWindow.webContents.send("update-screen-sharing-controls", {
                toggleVideoOrAudio: "audio",
              });
            },
          },
          {
            label: "Leave Room",
            click: function () {
              mainWindow.webContents.send("update-screen-sharing-controls", {
                leaveRoom: true,
              });
              mainWindow.show();
            },
          },
        ]);
      }
    }

    tray.setContextMenu(trayMenu);
  });

  ipcMain.handle("update-screen-sharing-controls", async (event, args) => {
    if (typeof args.starting != "undefined") {
      return mainWindow.hide();
    }

    if (
      typeof args.leaveRoom != "undefined" ||
      typeof args.toggleScreenSharing != "undefined"
    ) {
      mainWindow.show();
    }

    if (typeof args.screenSharingWindow != "undefined") {
      BrowserWindow.fromId(args.screenSharingWindow).webContents.send(
        "update-screen-sharing-controls",
        args,
      );
    } else {
      mainWindow.webContents.send("update-screen-sharing-controls", args);
    }
    return true;
  });

  ipcMain.handle("face-tracking-update", async (event, args) => {
    if (typeof args.type != "undefined") {
      if (args.type == "updated_coordinates") {
        mainWindow.webContents.send("face-tracking-update", args);
      }
    }
  });

  ipcMain.handle("net-status-update", async (event, args) => {
    if (typeof args.net != "undefined" && args.window != "undefined") {
      BrowserWindow.fromId(args.window).webContents.send(
        "net-status-update",
        args,
      );
    }
  });

  ipcMain.handle("background-blur-update", async (event, args) => {
    if (typeof args.type != "undefined") {
      if (args.type == "updated_coordinates") {
        mainWindow.webContents.send("background-blur-update", args);
      }
    }
  });

  mainWindow.webContents.on("new-window", function (e, url) {
    e.preventDefault();
    require("electron").shell.openExternal(url);
  });

  mainWindow.on("closed", () => {
    let allWindows = BrowserWindow.getAllWindows();

    if (allWindows.length !== 0) {
      allWindows.forEach((backgroundWindow) => {
        if (backgroundWindow.isDestroyed() === false) {
          backgroundWindow.destroy();
        }
      });
    }

    ipcMain.removeHandler("get-current-window-dimensions");
    ipcMain.removeHandler("get-media-access-status");
    ipcMain.removeHandler("update-tray-icon");
    ipcMain.removeHandler("update-screen-sharing-controls");
    ipcMain.removeHandler("face-tracking-update");
    ipcMain.removeHandler("background-blur-update");
    ipcMain.removeHandler("net-status-update");

    powerMonitor.removeAllListeners("suspend");
    powerMonitor.removeAllListeners("lock-screen");
  });
};

app.commandLine.appendSwitch(
  "force-fieldtrials",
  "WebRTC-SupportVP9SVC/EnabledByFlag_2SL3TL/",
);
app.commandLine.appendSwitch("webrtc-max-cpu-consumption-percentage", 100);
app.commandLine.appendSwitch("enable-precise-memory-info");
app.commandLine.appendSwitch("enable-gpu-rasterization");
app.commandLine.appendSwitch("enable-native-gpu-memory-buffers");
app.commandLine.appendSwitch("enable-accelerated-video");
app.commandLine.appendSwitch("ignore-gpu-blacklist");

if (process.platform == "darwin") {
  app.commandLine.appendSwitch("enable-oop-rasterization");
  app.commandLine.appendSwitch("enable-features", "metal");
}

let tray = null;
let trayMenu = null;
let iconPath = path.resolve(__dirname, "icons", "appIconTemplate.png");

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createWindow();
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
app.setAsDefaultProtocolClient("blab");

app.on("open-url", (ev, url) => {
  ev.preventDefault();

  mainWindow.webContents.send("url_update", url);
});
