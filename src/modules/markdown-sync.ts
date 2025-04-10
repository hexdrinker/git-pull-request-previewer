import { MarkdownMessage, sendMessage } from './message-bus'

export class MarkdownSyncManager {
  private textarea: HTMLTextAreaElement | null = null
  private inputListener: ((event: Event) => void) | null = null

  constructor(private panelWindow: Window | null) {
    if (!panelWindow) {
      console.error('[Error] panel window is invalid.')
    }
  }

  public setupSync(): boolean {
    this.textarea = document.querySelector<HTMLTextAreaElement>(
      "textarea[name='pull_request[body]']"
    )

    if (!this.textarea) {
      console.error('[Error] PR body textarea not found.')
      return false
    }

    if (!this.panelWindow) {
      console.error('[Error] panel window is invalid.')
      return false
    }

    this.inputListener = () => this.sendMarkdownContent()
    this.textarea.addEventListener('input', this.inputListener)

    this.sendMarkdownContent()
    return true
  }

  private sendMarkdownContent(): void {
    if (!this.textarea || !this.panelWindow) return

    const message: MarkdownMessage = {
      type: 'MARKDOWN',
      content: this.textarea.value,
    }

    sendMessage(this.panelWindow, message)
  }

  public cleanup(): void {
    if (this.textarea && this.inputListener) {
      this.textarea.removeEventListener('input', this.inputListener)
    }

    this.textarea = null
    this.inputListener = null
  }
}
