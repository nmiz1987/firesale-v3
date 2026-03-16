import { renderMarkdown } from "./markdown";
import Elements from "./elements";

// This index.ts file is the entry point for the renderer process of the Electron application. It is responsible for handling user interactions in the renderer process, such as input events and button clicks, and updating the DOM accordingly. It also listens for IPC messages from the main process to update the content displayed in the renderer.

// I will run on the web page

window.api.onFileOpen((content: string, filePath: string) => {
  console.log({ content, filePath });
  Elements.MarkdownView.value = content;
  renderMarkdown(content);
});

Elements.MarkdownView.addEventListener("input", async () => {
  const markdown = Elements.MarkdownView.value;
  renderMarkdown(markdown);
});

Elements.OpenFileButton.addEventListener("click", () => {
  window.api.showOpenDialog();
});

Elements.ExportHtmlButton.addEventListener("click", () => {
  const html = Elements.RenderedView.innerHTML;
  window.api.showExportHtmlDialog(html);
});

console.log("====> 3) I will run third");
