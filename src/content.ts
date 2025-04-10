import { PanelManager } from './modules/panel-manager'
import { MarkdownSyncManager } from './modules/markdown-sync'
import { listenToMessage, MinimizeMessage } from './modules/message-bus'

// Global state manager
const panelManager = new PanelManager()
let markdownSyncManager: MarkdownSyncManager | null = null

/**
 * Find PR body textarea element and set focus detection
 */
const findTextarea = () => {
  const textarea = document.querySelector<HTMLTextAreaElement>(
    "textarea[name='pull_request[body]']"
  )

  if (textarea) {
    console.log('PR textarea found!')
    observeTextareaFocus(textarea)
    return true
  }

  // If element not found, retry
  setTimeout(findTextarea, 1000)
  return false
}

/**
 * Set focus state detection for Textarea
 */
const observeTextareaFocus = (textarea: HTMLTextAreaElement) => {
  const observer = new MutationObserver(async (mutations) => {
    for (const mutation of mutations) {
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'data-focus-visible-added'
      ) {
        const focused = textarea.getAttribute('data-focus-visible-added')
        if (focused !== null && panelManager.isPanelEnabled()) {
          try {
            // Create or reuse panel
            const panel = await panelManager.createPanel()

            // Set markdown synchronization
            if (!markdownSyncManager) {
              markdownSyncManager = new MarkdownSyncManager(panel.contentWindow)
            }
            markdownSyncManager.setupSync()
          } catch (error) {
            console.error('[Error] Panel initialization failed:', error)
          }
        }
      }
    }
  })

  observer.observe(textarea, { attributes: true })
  console.log('Started observing textarea focus')
  return true
}

/**
 * Set message event listener
 */
const setupMessageListeners = () => {
  // Handle panel minimize message
  listenToMessage<MinimizeMessage>('MINIMIZE', (message) => {
    panelManager.togglePanelVisibility(message.minimized)
  })

  // Handle panel state change message (from extension popup)
  chrome.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
    if (message.type === 'TOGGLE_PANEL_STATE') {
      panelManager.setPanelEnabled(message.enabled)
      sendResponse({ success: true })
    }
    return true // Return true for asynchronous response
  })
}

/**
 * Extension program initialization
 */
const initialize = () => {
  findTextarea()
  setupMessageListeners()
}

// Initialize when page loads
window.onload = () => {
  initialize()
}
