// Set up context menu at install time.
chrome.runtime.onInstalled.addListener(function() {
  var context = "selection";
  var title = "Save selected \"%s\" text to local storage";
  var id = chrome.contextMenus.create({
    "title": title,
    "contexts": [context],
    "id": "context" + context
  });
});

// add click event
chrome.contextMenus.onClicked.addListener(onClickHandler);

// The onClicked callback function.
function onClickHandler(info, tab) {
  var selectedText = info.selectionText;
  alert(selectedText);
};

chrome.browserAction.onClicked.addListener(function () {
  window.open('words.html')
})