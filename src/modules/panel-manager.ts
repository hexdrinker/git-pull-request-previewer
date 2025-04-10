export class PanelManager {
  private currentPanel: HTMLIFrameElement | null = null
  private floatingButton: HTMLButtonElement | null = null
  private panelEnabled: boolean = true

  constructor() {}

  public isPanelEnabled(): boolean {
    return this.panelEnabled
  }

  public setPanelEnabled(enabled: boolean): void {
    this.panelEnabled = enabled
    this.updatePanelVisibility()
  }

  public createPanel(): Promise<HTMLIFrameElement> {
    if (this.currentPanel) {
      return Promise.resolve(this.currentPanel)
    }

    return new Promise<HTMLIFrameElement>((resolve, reject) => {
      try {
        const iframe = document.createElement('iframe')
        iframe.src = chrome.runtime.getURL('panel.html')
        iframe.id = 'md-preview-panel'
        iframe.style.position = 'fixed'
        iframe.style.top = '0'
        iframe.style.right = '20px'
        iframe.style.width = '38%'
        iframe.style.height = '100%'
        iframe.style.border = 'none'
        iframe.style.zIndex = '9999'
        iframe.style.boxShadow = '-5px 0 25px rgba(0, 0, 0, 0.3)'
        iframe.style.borderRadius = '8px 0 0 8px'
        iframe.style.transition = 'all 0.3s ease'
        document.body.appendChild(iframe)

        this.currentPanel = iframe

        iframe.onload = () => {
          resolve(iframe)
        }
      } catch (error) {
        console.error('[Error] panel creation failed:', error)
        reject(error)
      }
    })
  }

  public createFloatingButton(): HTMLButtonElement {
    if (this.floatingButton) return this.floatingButton

    const button = document.createElement('button')
    button.innerText = '📝'
    button.style.position = 'fixed'
    button.style.bottom = '20px'
    button.style.right = '20px'
    button.style.width = '50px'
    button.style.height = '50px'
    button.style.borderRadius = '50%'
    button.style.backgroundColor = '#238636'
    button.style.color = 'white'
    button.style.border = 'none'
    button.style.fontSize = '20px'
    button.style.cursor = 'pointer'
    button.style.zIndex = '9999'
    button.style.boxShadow = '0 3px 12px rgba(0, 0, 0, 0.25)'
    button.style.display = 'none'
    button.style.transition = 'transform 0.2s ease, background-color 0.2s ease'

    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.05)'
      button.style.backgroundColor = '#2ea043'
    })

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)'
      button.style.backgroundColor = '#238636'
    })

    button.addEventListener('click', () => {
      this.togglePanelVisibility(false)
    })

    document.body.appendChild(button)
    this.floatingButton = button
    return button
  }

  public togglePanelVisibility(minimized: boolean): void {
    if (!this.currentPanel) return

    if (minimized) {
      this.currentPanel.style.display = 'none'

      if (this.floatingButton) {
        this.floatingButton.style.display = 'block'
      } else if (this.panelEnabled) {
        this.createFloatingButton().style.display = 'block'
      }
    } else {
      this.currentPanel.style.display = 'block'

      if (this.floatingButton) {
        this.floatingButton.style.display = 'none'
      }
    }
  }

  /**
   * 패널 가시성 업데이트 (상태에 따라)
   */
  private updatePanelVisibility(): void {
    if (!this.currentPanel) return

    if (this.panelEnabled) {
      this.currentPanel.style.display = 'block'
      if (this.floatingButton) {
        this.floatingButton.style.display = 'none'
      }
    } else {
      this.currentPanel.style.display = 'none'
      if (this.floatingButton) {
        this.floatingButton.style.display = 'none'
      }
    }
  }

  /**
   * 패널 요소 반환
   */
  public getPanel(): HTMLIFrameElement | null {
    return this.currentPanel
  }
}
