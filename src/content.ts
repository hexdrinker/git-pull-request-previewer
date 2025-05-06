import { MarkdownPreviewManager } from "@/modules/markdown-preview-manager";
import { RouteObserver } from "@/modules/route-observer";

/**
 * Main entry point
 */
class GitHubPullRequestPreviewerExtension {
  private markdownPreviewManager: MarkdownPreviewManager;
  private routeObserver: RouteObserver;

  constructor() {
    this.markdownPreviewManager = new MarkdownPreviewManager();
    this.routeObserver = new RouteObserver(this.onRouteChange.bind(this));

    this.initMessageListeners();
  }

  /**
   * Callback when github route changed
   */
  private onRouteChange(url: string): void {
    if (this.isPullRequestPage(url)) {
      this.initializePullRequestPage();
    } else {
      this.markdownPreviewManager.cleanup();
    }
  }

  private isPullRequestPage(url: string): boolean {
    return (
      url.includes("/pull/") ||
      url.includes("/compare/") ||
      url.includes("/pull-requests/") ||
      url.includes("/pulls")
    );
  }

  /**
   * Pull Request 페이지 초기화 작업 수행
   */
  private initializePullRequestPage(): void {
    this.findTextareaAndObserve();
  }

  /**
   * PR 텍스트 영역을 찾고 관찰 설정
   */
  private findTextareaAndObserve(): void {
    // DOM이 완전히 로드된 후 텍스트 영역 찾기
    const findAndObserve = () => {
      const textarea = document.querySelector<HTMLTextAreaElement>(
        "textarea[name='pull_request[body]']",
      );

      if (textarea) {
        console.log("PR textarea found!");
        this.observeTextareaFocus(textarea);
        return true;
      }

      // 요소를 찾지 못한 경우 재시도
      setTimeout(findAndObserve, 1000);
      return false;
    };

    findAndObserve();
  }

  /**
   * 텍스트 영역의 포커스 상태 관찰 설정
   */
  private observeTextareaFocus(textarea: HTMLTextAreaElement): void {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-focus-visible-added"
        ) {
          const focused = textarea.getAttribute("data-focus-visible-added");
          if (
            focused !== null &&
            this.markdownPreviewManager.isPreviewEnabled()
          ) {
            this.markdownPreviewManager.initializePreview(textarea);
          }
        }
      }
    });

    observer.observe(textarea, { attributes: true });
    console.log("Started observing textarea focus");

    // 변경 감지 설정 - 텍스트 영역 내용이 변경될 때 미리보기 업데이트
    textarea.addEventListener("input", () => {
      if (
        this.markdownPreviewManager.isPreviewEnabled() &&
        this.markdownPreviewManager.isPreviewVisible()
      ) {
        this.markdownPreviewManager.updatePreview(textarea.value);
      }
    });
  }

  /**
   * 확장 프로그램 메시지 리스너 설정
   */
  private initMessageListeners(): void {
    // 확장 프로그램 팝업에서 패널 상태 변경 메시지 처리
    chrome.runtime.onMessage.addListener(
      (message: any, sender, sendResponse) => {
        if (message.type === "TOGGLE_PANEL_STATE") {
          this.markdownPreviewManager.setPreviewEnabled(message.enabled);
          sendResponse({ success: true });
        }
        return true; // 비동기 응답을 위해 true 반환
      },
    );
  }

  /**
   * 확장 프로그램 초기화
   */
  public initialize(): void {
    this.routeObserver.startObserving();
    // 현재 페이지가 PR 페이지인지 확인하고 초기화
    if (this.isPullRequestPage(window.location.href)) {
      this.initializePullRequestPage();
    }
  }
}

// 확장 프로그램 인스턴스 생성 및 초기화
const extension = new GitHubPullRequestPreviewerExtension();

// 페이지 로드 시 초기화
window.addEventListener("load", () => {
  extension.initialize();
});
