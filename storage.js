Storage.prototype.setObject = function(key, value) {
  this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
  var value = this.getItem(key);
  return value && JSON.parse(value);
}

function synchronizeChrome(){
	var wordCount = localStorage.length;
	var listWords = {};
	for(i = 0; i < wordCount; i++) {
	  var key = localStorage.key(i);
	  var wordObjStringification = localStorage.getItem(key);
	  listWords[key] = wordObjStringification;
	}
	//console.dir(listWords);
	chrome.storage.sync.set(listWords, function(){
		alert('synchonize sucessfull');
	});
}