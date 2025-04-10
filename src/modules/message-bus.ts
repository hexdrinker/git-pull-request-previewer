/**
 * Message type definition
 */
export type MessageType = 'MARKDOWN' | 'MINIMIZE' | 'TOGGLE_PANEL_STATE'

/**
 * Markdown content message interface
 */
export interface MarkdownMessage {
  type: 'MARKDOWN'
  content: string
}

/**
 * Panel minimize message interface
 */
export interface MinimizeMessage {
  type: 'MINIMIZE'
  minimized: boolean
}

/**
 * Panel state transition message interface
 */
export interface TogglePanelStateMessage {
  type: 'TOGGLE_PANEL_STATE'
  enabled: boolean
}

/**
 * Message type union
 */
export type Message =
  | MarkdownMessage
  | MinimizeMessage
  | TogglePanelStateMessage

/**
 * Message handler type
 */
export type MessageHandler<T extends Message> = (message: T) => void

/**
 * Send message to iframe
 * @param target Target iframe's contentWindow
 * @param message Message to send
 */
export const sendMessage = <T extends Message>(
  target: Window | null,
  message: T
): void => {
  if (!target) return
  target.postMessage(message, '*')
}

/**
 * Register message listener
 * @param messageType Message type
 * @param handler Message handler function
 */
export const listenToMessage = <T extends Message>(
  messageType: MessageType,
  handler: MessageHandler<T>
): (() => void) => {
  const listener = (event: MessageEvent) => {
    if (event.data?.type === messageType) {
      handler(event.data as T)
    }
  }

  window.addEventListener('message', listener)

  return () => window.removeEventListener('message', listener)
}
