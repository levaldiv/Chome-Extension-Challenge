/* adding the btn of the YT player to save bookmarks with timestamps
 * 1st, manipulate the DOM of the current (youtube) site */

(() => {
  let youtubeLeftControls, youtubePlayer; // 1 for accessing the YT player, 2 for accessing the controls
  let currentVideo = ""; //set as the string set from the background.js
  let currentVideoBookmarks = [];

  // listens to any of the incoming messages from the background.js
  // response = the message being sent to the content script, send a res back
  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, value, videoId } = obj;

    if (type === "NEW") {
      currentVideo = videoId;
      newVideoLoaded(); // fcn to handle any actions w new video
    } else if (type === "PLAY") {
      // sets it to the saved timestamp of the bookmark
      youtubePlayer.currentTime = value;
    } else if (type === "DELETE") {
      currentVideoBookmarks = currentVideoBookmarks.filter(
        (b) => b.time != value // value to be deleted
      );
      // if this page reloads , the deleted bookmark does not show up
      chrome.storage.sync.set({
        [currentVideo]: JSON.stringify(currentVideoBookmarks),
      });

      response(currentVideoBookmarks); // send the updated bookmarks back to the popup.js to disp recent bookmarks
    }
  });

  /** grab asynchronsously, all bookmakrs from Chrome storage, by wrtiting a promise that resolves once all bookmarks
   * have been retrieved
   */

  const fetchBookmarks = () => {
    return new Promise((resolve) => {
      chrome.storage.sync.get([currentVideo], (obj) => {
        resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
      });
    });
  };

  /* Checks if a bookmark btn already exists */
  const newVideoLoaded = async () => {
    const bookmarkBtnExists =
      document.getElementsByClassName("bookmark-btn")[0]; // grabs the 1sts elmt that matches this classname
    currentVideoBookmarks = await fetchBookmarks();

    if (!bookmarkBtnExists) {
      const bookmarkBtn = document.createElement("img");

      bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png"); // pulling the img
      bookmarkBtn.className = "ytp-button " + "bookmark-btn";
      bookmarkBtn.title = "Click to bookmark current timestamp";

      // grabbing the YT controls
      youtubeLeftControls =
        document.getElementsByClassName("ytp-left-controls")[0];
      youtubePlayer = document.getElementsByClassName("video-stream")[0];

      youtubeLeftControls.appendChild(bookmarkBtn); // adding bookmark btn
      bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler); // listenr to lsitento any clicks on the icon
    }
  };

  // adding functionality to when the icon is clicked
  const addNewBookmarkEventHandler = async () => {
    const currentTime = youtubePlayer.currentTime; // grabbing the current time of the video
    // called when a new bookmark is created
    const newBookmark = {
      time: currentTime,
      desc: "Bookmarked at " + getTime(currentTime),
    };
    currentVideoBookmarks = await fetchBookmarks(); // ensures that were always using the most up to date bookmarks

    //syncing to chrome storage
    chrome.storage.sync.set({
      [currentVideo]: JSON.stringify(
        [...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time)
      ),
    });
  };

  newVideoLoaded(); // calling this anytime the content script  matches youtube.com; call the NVL fcn anytime theres a hit on the match pattern
})();

// converting seconds into time
const getTime = (t) => {
  var date = new Date(0);
  date.setSeconds(t);

  return date.toISOString().substr(11, 8);
};
