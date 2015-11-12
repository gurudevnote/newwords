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
  var selectedText = info.selectionText.toLowerCase();
  var url = tab.url;
  var wordObj = localStorage.getObject(selectedText);
  if(wordObj == undefined || wordObj == null) {
    localStorage.setObject(selectedText, {
      "text": selectedText,
      "date": new Date(),
      "url": url,
      "viewCount": 0,
      "savedCount": 1
    });
  } else {
    wordObj.date = new Date();
    wordObj.savedCount = (wordObj.savedCount==undefined ? 0 : wordObj.savedCount) + 1;
    localStorage.setObject(selectedText, wordObj);
  }
  chrome.browserAction.setBadgeText({text: localStorage.length + ''});
};

chrome.browserAction.onClicked.addListener(function () {
  //close all extension tabs
  var appId = chrome.runtime.id;
  var appUrl = 'chrome-extension://'+appId+'/*';
  chrome.tabs.query({"url": appUrl}, function(tabs){
    for(i = 0; i < tabs.length ;i++){
      chrome.tabs.remove(tabs[i].id);
    }
  });
  window.open('words.html?sorts[date]=-1');
});