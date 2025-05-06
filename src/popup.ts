import { PANEL_STATE_KEY } from "@/constants";

document.addEventListener("DOMContentLoaded", async () => {
  const toggleCheckbox = document.getElementById(
    "panel-toggle",
  ) as HTMLInputElement;

  const result = await chrome.storage.sync.get(PANEL_STATE_KEY);
  const isEnabled = PANEL_STATE_KEY in result ? result[PANEL_STATE_KEY] : true;

  toggleCheckbox.checked = isEnabled;

  toggleCheckbox.addEventListener("change", async () => {
    const newState = toggleCheckbox.checked;

    await chrome.storage.sync.set({ [PANEL_STATE_KEY]: newState });

    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "TOGGLE_PANEL_STATE",
        enabled: newState,
      });
    }
  });
});
