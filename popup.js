import { getActiveTabURL } from "./utils.js";

// adding a new bookmark row to the popup
const addNewBookmark = (bookmarksElement, bookmark) => {
  const bookmarkTitleElement = document.createElement("div");
  const newBookmarkElement = document.createElement("div");
  const controlsElement = document.createElement("div");

  bookmarkTitleElement.textContent = bookmark.desc;
  bookmarkTitleElement.className = "bookmark-title";

  controlsElement.className = "bookmark-controls";

  newBookmarkElement.id = "bookmark-" + bookmark.time;
  newBookmarkElement.className = "bookmark";
  newBookmarkElement.setAttribute("timestamp", bookmark.time);

  setBookmarkAttributes("play", onPlay, controlsElement);
  setBookmarkAttributes("delete", onDelete, controlsElement);

  newBookmarkElement.appendChild(bookmarkTitleElement); // displays within the new bookmark element
  newBookmarkElement.appendChild(controlsElement);
  bookmarksElement.appendChild(newBookmarkElement);
};

const viewBookmarks = (currentBookmarks = []) => {
  const bookmarksElement = document.getElementById("bookmarks");
  bookmarksElement.innerHTML = ""; // if there any bm, set it to nothing

  if (currentBookmarks.length > 0) {
    for (let i = 0; i < currentBookmarks.length; i++) {
      const bookmark = currentBookmarks[i]; // grabing the bookmark through indexing
      addNewBookmark(bookmarksElement, bookmark); //populating bookmarks, adding one bookmark at a time
    }
  } else {
    // if there is no bookmarks
    bookmarksElement.innerHTML = '<i class="row">No bookmarks yet</i>';
  }
};

const onPlay = async (e) => {
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp"); // grabbing the timestamp of the bookmark
  const activeTab = await getActiveTabURL(); // grabbing the active tab

  chrome.tabs.sendMessage(activeTab.id, {
    type: "PLAY",
    value: bookmarkTime,
  });
};

const onDelete = async (e) => {
  const activeTab = await getActiveTabURL(); // grabbing the active tab
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp"); // grabbing the timestamp of the bookmark
  const bookmarkElementToDelete = document.getElementById(
    "bookmark-" + bookmarkTime
  ); // grabbing the elmt to be deleted

  bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

  chrome.tabs.sendMessage(
    activeTab.id,
    {
      type: "DELETE",
      value: bookmarkTime,
    },
    viewBookmarks
  );
};

const setBookmarkAttributes = (src, eventListener, controlParentElement) => {
  const controlElement = document.createElement("img");

  controlElement.src = "assets/" + src + ".png";
  controlElement.title = src;
  controlElement.addEventListener("click", eventListener);
  controlParentElement.appendChild(controlElement);
};

// this fires when an HTML doc has intitally been loaded (when to load all the bookmards and show them)
document.addEventListener("DOMContentLoaded", async () => {
  const activeTab = await getActiveTabURL(); // looking at the users current active tab
  const queryParameters = activeTab.url.split("?")[1]; // identifying the video
  const urlParameters = new URLSearchParams(queryParameters); // identifing the unique identifier for each video

  const currentVideo = urlParameters.get("v"); // getting unique identifier

  if (activeTab.url.includes("youtube.com/watch") && currentVideo) {
    chrome.storage.sync.get([currentVideo], (data) => {
      const currentVideoBookmarks = data[currentVideo]
        ? JSON.parse(data[currentVideo])
        : [];

      // view bookmarks
      viewBookmarks(currentVideoBookmarks);
    });
  } else {
    // not a youtube video page
    const container = document.getElementsByClassName("container")[0];

    container.innerHTML = '<div class="title">Not a YouTube video page!</div>';
  }
});
