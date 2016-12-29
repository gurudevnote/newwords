StorageApi = {}
Storage.prototype.setObject = function(key, value) {
  this.setItem(key, JSON.stringify(value));
  // try
  // {
  // 	var wordObj = {};
  // 	wordObj[key] = JSON.stringify(value);
  // 	chrome.storage.sync.set(wordObj);
  // }
  // catch(err){}
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

StorageApi.getAllWordFromLocalStorage = function(){
	var wordCount = localStorage.length;
	var datas = {};
	for(i = 0; i < wordCount; i++) {
	  var key = localStorage.key(i);
	  var wordObj = localStorage.getObject(key);
	  wordObj.date = moment(wordObj.date).format();
	  wordObj.hideDate = moment(wordObj.date).format('YYYY-MM-DD');
	  if(wordObj.viewCount == undefined || wordObj.viewCount == null) {
	    wordObj.viewCount = 0;
	  }

	  if(wordObj.savedCount == undefined || wordObj.savedCount == null) {
	    wordObj.savedCount = 0;
	  }
	  datas[key] = wordObj;
	}

	return datas;
};

StorageApi.getAllWordForDisplayingOnCalendar = function(datas){
	if(datas == undefined || datas == null) {
		datas = this.getAllWordFromLocalStorage();
	}
	return _.map(datas, function(item){
		return {
	    	title: item.text,
	    	start: item.date || new Date()
	  	};
	});
};

StorageApi.updateViewCountToLocalStorage = function(word){
  var wordObj = localStorage.getObject(word);
  wordObj.viewCount = (wordObj.viewCount == undefined ? 0 : wordObj.viewCount) + 1;
  localStorage.setObject(word, wordObj);
  return wordObj;
};

StorageApi.setWordGoogleImages = function (word, googleImages) {
	var wordObj = localStorage.getObject(word);
	wordObj.googleImages = googleImages;
	localStorage.setObject(word, wordObj);
	return wordObj;
};

StorageApi.setWordDictionaryData = function (word, wordDictionaryData) {
	var wordObj = localStorage.getObject(word);
	wordObj.wordDictionaryData = wordDictionaryData;
	localStorage.setObject(word, wordObj);
	return wordObj;
};

StorageApi.setWordUkDictionaryData = function (word, wordDictionaryData) {
    var wordObj = localStorage.getObject(word);
    wordObj.wordUkDictionaryData = wordDictionaryData;
    localStorage.setObject(word, wordObj);
    return wordObj;
};

StorageApi.setWordUsDictionaryData = function (word, wordDictionaryData) {
    var wordObj = localStorage.getObject(word);
    wordObj.wordUsDictionaryData = wordDictionaryData;
    localStorage.setObject(word, wordObj);
    return wordObj;
};

StorageApi.getWord = function (word) {
	return  localStorage.getObject(word);
};

StorageApi.setTranslateFromEnglishToVn = function(word, translatedWord){
    var wordObj = localStorage.getObject(word);
    wordObj.translateFromEnglishToVn = translatedWord;
    localStorage.setObject(word, wordObj);
    return wordObj;
}