Storage.prototype.setObject = function(key, value) {
  this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
  var value = this.getItem(key);
  return value && JSON.parse(value);
}

// Set up context menu at install time.
chrome.runtime.onInstalled.addListener(function() {
  var context = "selection";
  var title = "Save selected \"%s\" text to local storage";
  var id = chrome.contextMenus.create({
    "title": title,
    "contexts": [context],
    "id": "context" + context
  });

  chrome.browserAction.setBadgeText({text: localStorage.length + ''});
});

// add click event
chrome.contextMenus.onClicked.addListener(onClickHandler);

// The onClicked callback function.
function onClickHandler(info, tab) {
  var selectedText = info.selectionText.toLocaleString();
  localStorage.setObject(selectedText, {
    "text": selectedText,
    "date": new Date()
  });
  chrome.browserAction.setBadgeText({text: localStorage.length + ''});
};

chrome.browserAction.onClicked.addListener(function () {
  window.open('words.html')
})