import { Janus } from "janus-gateway";
import { desktopCapturer, ipcRenderer } from "electron";
import { useEffect, useState } from "react";

interface Dimensions {
  width: number;
  height: number;
}

type ReturnFunction = () => void;

export const useInitializeJanus = (): void => {
  Janus.init({
    debug: process.env.NODE_ENV == "production" ? false : true,
    dependencies: Janus.useDefaultDependencies(),
    callback: function () {
      // Done!
    },
  });
};

export const useGetAvailableScreensToShare = (): {
  availableScreensToShare: Electron.DesktopCapturerSource[];
  screensourcesLoading: boolean;
} => {
  const [availableScreensToShare, setAvailableScreensToShare] = useState<
    Electron.DesktopCapturerSource[]
  >([]);
  const [screensourcesLoading, setScreenSourcesLoading] = useState(false);

  useEffect(() => {
    setScreenSourcesLoading(false);
    ipcRenderer
      .invoke("get-media-access-status", { mediaType: "screen" })
      .then(async (response: string) => {
        if (response === "granted") {
          const availableScreensToShare: Electron.DesktopCapturerSource[] = [];

          const sources = await desktopCapturer.getSources({
            types: ["window", "screen"],
            thumbnailSize: { width: 1000, height: 1000 },
            fetchWindowIcons: true,
          });

          sources.forEach((source) => {
            if (!source.name.includes("Blab")) {
              let name = source.name;
              if (name.length > 50) {
                name = source.name.slice(0, 49).trim() + "...";
              }
              availableScreensToShare.push({
                ...source,
                name,
              });
            }
          });

          setAvailableScreensToShare(availableScreensToShare);
          setScreenSourcesLoading(true);
        }
      });
  }, []);

  return { availableScreensToShare, screensourcesLoading };
};

export const useResizeListener = (): Dimensions => {
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: window.innerWidth,
    height: window.innerHeight / 2,
  });

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  const handleResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    setDimensions({
      width,
      height,
    });
  };

  return dimensions;
};

export const useOnlineListener = (): boolean => {
  const [online, setIsOnline] = useState(true);
  useEffect(() => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    ipcRenderer.on("power_update", (_event, arg) => {
      if (arg == "suspend" || arg == "lock-screen") {
        handleOffline;
      }
      if (arg == "unlock-screen" || arg == "resume") {
        handleOnline;
      }
    });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      ipcRenderer.removeAllListeners("power_update");
    };
  });

  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);

  return online;
};
