import { MarkdownRenderer } from './modules/markdown-renderer'
import {
  listenToMessage,
  sendMessage,
  MarkdownMessage,
  MinimizeMessage,
} from './modules/message-bus'

const preview = document.querySelector('#preview') as HTMLElement
const minimizeButton = document.querySelector(
  '#minimize-button'
) as HTMLButtonElement

const markdownRenderer = new MarkdownRenderer()

const initializePanel = () => {
  listenToMessage<MarkdownMessage>('MARKDOWN', async (message) => {
    if (preview) {
      await markdownRenderer.renderToElement(message.content, preview)
    }
  })

  minimizeButton?.addEventListener('click', () => {
    const message: MinimizeMessage = {
      type: 'MINIMIZE',
      minimized: true,
    }

    sendMessage(window.parent, message)
  })
}

initializePanel()
