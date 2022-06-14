/* This will listen to any updates in the tab system and find the most
 * recent tab / current tab and check if its a YT page */

chrome.tabs.onUpdated.addListener((tabId, tab) => {
  // if there is a tab url and if it includes YT
  if (tab.url && tab.url.includes("youtube.com/watch")) {
    const queryParameters = tab.url.split("?")[1]; // using this as a unique ID for each video to be able to grab it from storage
    const urlParameters = new URLSearchParams(queryParameters);
    console.log(urlParameters);

    /* Sending a message to content script that a new video has been loaded using the video ID */
    chrome.tabs.sendMessage(tabId, {
      type: "NEW", // type of new video event
      videoId: urlParameters.get("v"), // geting the speific url
    });
  }
});
