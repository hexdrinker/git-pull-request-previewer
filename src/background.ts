// src/background.ts

chrome.runtime.onInstalled.addListener(() => {
  console.log('pr previewer installed.')

  chrome.storage.sync.set({
    markdown_preview_panel_enabled: true,
  })
})
