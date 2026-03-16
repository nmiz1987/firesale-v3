import { ipcRenderer, contextBridge } from "electron";
// import Elements from "./renderer/elements";
// import { renderMarkdown } from "./renderer/markdown";

// This preload.ts file is the preload script for the Electron application. It runs in a separate context from the renderer process and is used to expose a secure API for communication between the renderer and main processes. In this case, it exposes an API for showing an open file dialog and receiving the content of the opened file.

// I will run globally

// ipcRenderer.on("file-opened", (_, content: string, filePath: string) => {
//   console.log({ content, filePath });

// });

console.log("====> 2) I will run second");

contextBridge.exposeInMainWorld("api", {
  showOpenDialog: () => {
    ipcRenderer.send("show-open-dialog");
  },
  onFileOpen: (cb: (content: string) => void) => {
    ipcRenderer.on("file-opened", (_, content: string) => {
      cb(content);
    });
  },
  showExportHtmlDialog: (html: string) => {
    ipcRenderer.send("show-export-html-dialog", html);
  },
});
