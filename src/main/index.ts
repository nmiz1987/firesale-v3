import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { join } from "path";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { homedir } from "node:os";

// This index.ts file is the main process of the Electron application. It is responsible for creating the application window, handling inter-process communication (IPC) between the main and renderer processes, and managing application lifecycle events.

// I will run in the main process

const basePath = join(".electron", "firesale");

const windowStateFile = join(homedir(), basePath, ".firesale-window-state.json");
console.log("====> 1) I will run first");

const getWindowState = async () => {
  try {
    if (existsSync(windowStateFile)) {
      const data = await readFile(windowStateFile, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to read window state:", error);
  }
  return { width: 800, height: 600 };
};

const saveWindowState = async (mainWindow: BrowserWindow) => {
  try {
    const bounds = mainWindow.getBounds();
    const state = {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    };
    // Create directory if it doesn't exist
    await mkdir(join(homedir(), basePath), { recursive: true });
    await writeFile(windowStateFile, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save window state:", error);
  }
};

const createWindow = async () => {
  const windowState = await getWindowState();

  const mainWindow = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    show: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.focus();
    // showOpenDialog(mainWindow);
  });

  mainWindow.webContents.openDevTools({
    mode: "bottom",
  });

  mainWindow.on("close", () => saveWindowState(mainWindow));
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  // if (process.platform !== "darwin") {
  app.quit();
  // }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

const showOpenDialog = async (browserWindow: BrowserWindow) => {
  const result = await dialog.showOpenDialog(browserWindow, {
    properties: ["openFile"],
    filters: [
      {
        name: "Markdown Files",
        extensions: ["md"],
      },
    ],
  });

  if (result.canceled) {
    return;
  }

  const [filePath] = result.filePaths;
  openFile(browserWindow, filePath);
};

const openFile = async (browserWindow: BrowserWindow, filePath: string) => {
  const content = await readFile(filePath, { encoding: "utf-8" });
  // console.log({ content });

  browserWindow.webContents.send("file-opened", content, filePath);
};

const showExportHtmlDialog = async (browserWindow: BrowserWindow, html: string) => {
  const result = await dialog.showSaveDialog(browserWindow, {
    title: "Export HTML",
    filters: [
      {
        name: "HTML File",
        extensions: ["html"],
      },
    ],
  });

  if (result.canceled) return;

  const { filePath } = result;

  if (!filePath) return;

  exportHtml(filePath, html);
};

const exportHtml = async (filePath: string, html: string) => {
  await writeFile(filePath, html, { encoding: "utf-8" });
};

ipcMain.on("show-open-dialog", async (event) => {
  const browserWindow = BrowserWindow.fromWebContents(event.sender);
  if (!browserWindow) return;

  await showOpenDialog(browserWindow);
});

ipcMain.on("show-export-html-dialog", async (event, html: string) => {
  const browserWindow = BrowserWindow.fromWebContents(event.sender);
  if (!browserWindow) return;

  await showExportHtmlDialog(browserWindow, html);
});
