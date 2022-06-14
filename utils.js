/** THis will determine if a given page is a Youtube video page or not
 * If it is, it will fetch any bookmarks for that video from Chrome storage
 * If it is not, display a msg saying it isnt a YT video page
 */

// Retrieving the currently foucsed tab
export async function getActiveTabURL() {
  const tabs = await chrome.tabs.query({
    currentWindow: true,
    active: true,
  });

  return tabs[0];
}
