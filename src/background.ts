/**
 * Background Service Worker
 */

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("GitHub Pull Request Previewer is installed.");
    chrome.storage.sync.set({ previewEnabled: true });
  } else if (details.reason === "update") {
    console.log("GitHub Pull Request Previewer is updated.");
  }
});
