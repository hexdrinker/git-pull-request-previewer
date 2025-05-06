export class RouteObserver {
  private currentUrl: string = window.location.href;
  private callback: (url: string) => void;
  private mutationObserver: MutationObserver | null = null;

  constructor(callback: (url: string) => void) {
    this.callback = callback;
  }

  public startObserving(): void {
    this.initHistoryWatcher();

    this.initUrlChangeDetection();

    this.initDomMutationObserver();
  }

  private initHistoryWatcher(): void {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.onPossibleRouteChange();
    };

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      this.onPossibleRouteChange();
    };

    window.addEventListener("popstate", () => {
      this.onPossibleRouteChange();
    });
  }

  /**
   * Detecting url change by interval
   */
  private initUrlChangeDetection(): void {
    setInterval(() => {
      if (this.currentUrl !== window.location.href) {
        this.onPossibleRouteChange();
      }
    }, 1000);
  }

  /**
   * Detecting url change by dom mutation observer
   */
  private initDomMutationObserver(): void {
    const appContainer = document.querySelector("body");

    if (!appContainer) {
      console.error("Cannot find app container for mutation observer");
      return;
    }

    this.mutationObserver = new MutationObserver((mutations) => {
      const mainContentChanged = mutations.some((mutation) => {
        return (
          mutation.type === "childList" &&
          (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)
        );
      });

      if (mainContentChanged) {
        this.onPossibleRouteChange();
      }
    });

    this.mutationObserver.observe(appContainer, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Callback when possible route change
   */
  private onPossibleRouteChange(): void {
    const newUrl = window.location.href;

    if (this.currentUrl !== newUrl) {
      this.currentUrl = newUrl;
      this.callback(newUrl);
    }
  }

  public stopObserving(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
  }
}
