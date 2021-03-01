import {
  BrowserWindow,
  Menu,
  Notification,
  Rectangle,
  app,
  autoUpdater,
  dialog,
  ipcMain,
  nativeTheme,
  powerMonitor,
  screen,
  systemPreferences,
} from "electron";
import { init } from "@sentry/electron/dist/main";
import ElectronStore from "electron-store";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let MAIN_WINDOW_WEBPACK_ENTRY: any;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const contextMenu = require("electron-context-menu");
if (require("electron-squirrel-startup")) app.quit();
const isDevMode = Boolean(process.execPath.match(/[\\/]electron/));

const currentWindowPosition = [0, 0];
const currentContentSize = [350, 520];

let mainWindow: Electron.BrowserWindow;

if (!isDevMode) {
  init({
    dsn:
      "https://20e5d4f5d6d94630a28e5684a3048940@o281199.ingest.sentry.io/5176374",
    release: "blab@" + app.getVersion(),
  });

  const server = "https://updater.blab.to";
  const feed = `${server}/update/${process.platform}/${app.getVersion()}`;

  autoUpdater.setFeedURL({
    url: feed,
  });

  setInterval(() => {
    try {
      autoUpdater.checkForUpdates();
    } catch (error) {
      //internet connection might be down
    }
  }, 3600000);

  autoUpdater.on("update-downloaded", (_event, releaseNotes, releaseName) => {
    if (Notification.isSupported()) {
      const updateNotification = new Notification({
        title: "An Update is Available",
        body: "Click on this notification to restart Blab and update now.",
        closeButtonText: "Later",
      });

      updateNotification.show();

      updateNotification.on("click", () => {
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
  prepend: (): Electron.MenuItem[] => [],
});

const createWindow = () => {
  ElectronStore.initRenderer();

  // Create the browser window.
  if (!isDevMode) {
    let template: Electron.MenuItemConstructorOptions[] | null = [
      {
        label: "Application",
        submenu: [
          {
            label: "About Blab",
            role: "about",
          },
          {
            label: "Check for Updates",
            click: () => autoUpdater.checkForUpdates(),
          },
          { type: "separator" },
          {
            label: "Quit Blab",
            accelerator: "Command+Q",
            click: function () {
              app.quit();
            },
          },
        ],
      },
      {
        label: "Edit",
        role: "editMenu",
      },
    ];

    if (process.platform != "darwin") {
      template = null;
    }

    mainWindow = new BrowserWindow({
      titleBarStyle: "hidden",
      vibrancy: "sidebar",
      transparent: true, //necessary for vibrancy fix on macos
      backgroundColor: process.platform === "darwin" ? "#80FFFFFF" : "#212529",
      width: 350,
      height: 520,
      minWidth: 350,
      minHeight: 520,
      frame: false,
      webPreferences: {
        nodeIntegration: true,
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        devTools: false,
        backgroundThrottling: false,
        enableRemoteModule: true,
      },
    });

    if (template) {
      Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    }
  } else {
    // Create the browser window.
    mainWindow = new BrowserWindow({
      titleBarStyle: "hidden",
      vibrancy: "sidebar",
      transparent: true, //necessary for vibrancy fix on macos
      backgroundColor: process.platform === "darwin" ? "#80FFFFFF" : "#212529",
      width: 350,
      height: 520,
      minWidth: 350,
      minHeight: 520,
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

  //force dark mode
  nativeTheme.themeSource = "dark";

  ipcMain.handle(
    "update-main-window-width",
    async (
      _event,
      args: {
        type: string;
      },
    ) => {
      const width = args.type === "full" ? 1100 : 350;
      const height = args.type === "full" ? 600 : 520;

      mainWindow.setContentSize(width, height, false);
      mainWindow.center();
    },
  );

  ipcMain.handle("get-current-window-dimensions", async () => {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    return { width, height };
  });

  ipcMain.handle("get-media-access-status", async (_event, args) => {
    if (process.platform != "darwin") {
      return "granted";
    }

    return systemPreferences.getMediaAccessStatus(args.mediaType);
  });

  /*ipcMain.handle("update-tray-icon", async (_event, args) => {
    if (args.enable && !tray) {
      tray = new Tray(iconPath);
      tray.setToolTip("Blab");
    }

    if (args.disable && !tray) {
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
                const screenAccessGranted = systemPreferences.getMediaAccessStatus(
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
                const screenAccessGranted = systemPreferences.getMediaAccessStatus(
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
  });*/

  ipcMain.handle(
    "update-screen-sharing-controls",
    async (
      _event,
      args: {
        starting?: boolean;
        leaveRoom?: boolean;
        toggleScreenSharing?: boolean;
        screenSharingWindow?: number;
      },
    ) => {
      if (typeof args.starting != "undefined") {
        return mainWindow.hide();
      }

      if (
        typeof args.leaveRoom != "undefined" ||
        typeof args.toggleScreenSharing != "undefined"
      ) {
        mainWindow.show();
      }

      if (args.screenSharingWindow) {
        BrowserWindow.fromId(args.screenSharingWindow)?.webContents.send(
          "update-screen-sharing-controls",
          args,
        );
      } else {
        mainWindow.webContents.send("update-screen-sharing-controls", args);
      }
      return true;
    },
  );

  mainWindow.webContents.on("new-window", function (e, url) {
    e.preventDefault();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("electron").shell.openExternal(url);
  });

  let currentWindowWidth = 1100;
  let currentWindowHeight = 600;

  mainWindow.on("will-resize", (_event, newBounds) => {
    currentWindowWidth = newBounds.width;
    currentWindowHeight = newBounds.height;
  });

  let currentWindowPosition: Rectangle | undefined;

  mainWindow.on("will-move", (_event, newBounds) => {
    currentWindowPosition = newBounds;
  });

  ipcMain.handle(
    "start-video-room",
    async (
      _event,
      args: {
        inRoom: boolean;
      },
    ) => {
      if (args.inRoom) {
        mainWindow.on("blur", () => {
          mainWindow.setVibrancy(null);
          mainWindow.setVisibleOnAllWorkspaces(true);
          mainWindow.setAlwaysOnTop(true, "floating");
          mainWindow.setOpacity(0.68);
          mainWindow.setHasShadow(false);
          mainWindow.setMinimumSize(100, 100);
          mainWindow.setSize(600, 100, false);
          mainWindow.center();
          const currentPosition = mainWindow.getPosition();

          mainWindow.setPosition(currentPosition[0] - 90, 5, false);

          mainWindow.setBackgroundColor("#00000000");
          mainWindow.setIgnoreMouseEvents(true);
        });

        mainWindow.on("focus", () => {
          mainWindow.setVibrancy("sidebar");
          mainWindow.setVisibleOnAllWorkspaces(false);
          mainWindow.setAlwaysOnTop(false);
          mainWindow.setOpacity(1);
          mainWindow.setHasShadow(true);

          mainWindow.setContentSize(
            currentWindowWidth,
            currentWindowHeight,
            false,
          );

          if (currentWindowPosition) {
            mainWindow.setPosition(
              currentWindowPosition.x,
              currentWindowPosition.y,
            );
          } else {
            mainWindow.center();
          }

          mainWindow.setBackgroundColor(
            process.platform === "darwin" ? "#80FFFFFF" : "#212529",
          );

          mainWindow.setMinimumSize(350, 520);
          mainWindow.setIgnoreMouseEvents(false);
        });
      } else {
        mainWindow.removeAllListeners("blur");
        mainWindow.removeAllListeners("focus");
        mainWindow.removeAllListeners("hide");
      }
    },
  );

  mainWindow.on("closed", () => {
    const allWindows = BrowserWindow.getAllWindows();

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
app.commandLine.appendSwitch("webrtc-max-cpu-consumption-percentage", "100");
app.commandLine.appendSwitch("enable-gpu-rasterization");
app.commandLine.appendSwitch("enable-native-gpu-memory-buffers");
app.commandLine.appendSwitch("enable-accelerated-video");
app.commandLine.appendSwitch("ignore-gpu-blacklist");
app.commandLine.appendSwitch("enable-features", "WebAssemblySimd");

if (process.platform == "darwin") {
  app.commandLine.appendSwitch("enable-oop-rasterization");
  app.commandLine.appendSwitch("enable-features", "metal");
}

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
