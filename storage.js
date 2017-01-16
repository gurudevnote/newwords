StorageApi = {}

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

StorageApi.getAllWords = function(){
	return wordsRef.once('value').then(function (snapshort) {
		var words = {};
		var dictionary = {};
		snapshort.forEach(function(childSnapshot) {
			var key = childSnapshot.getKey();
			var wordObj = childSnapshot.val();
			words[key] = wordObj;
			dictionary[key] = {
				translateFromEnglishToVn : wordObj.translateFromEnglishToVn,
				wordUsDictionaryData: wordObj.wordUsDictionaryData,
				wordUkDictionaryData: wordObj.wordUkDictionaryData,
				googleImages: wordObj.googleImages
			}

			wordObj.translateFromEnglishToVn = undefined;
			wordObj.wordUsDictionaryData = undefined;
			wordObj.wordUkDictionaryData = undefined;
			wordObj.wordDictionaryData = undefined;
			wordObj.googleImages = undefined;
		});

		return {words: words, dictionary: dictionary}
	});
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
	return fireBaseGetImageWordDictionaryRef(word).set(googleImages);
};

StorageApi.setWordDictionaryData = function (word, wordDictionaryData) {
	return fireBaseGetWordDictionary(word).then(function(snapshort){
		var wordObj = snapshort.val()  || {};
		wordObj.wordDictionaryData = wordDictionaryData;
		fireBaseGetWordDictionaryRef(word).set(wordObj);
		return wordObj;
	});
};

StorageApi.setWordUkDictionaryData = function (word, wordDictionaryData) {
	return fireBaseGetWordDictionary(word).then(function(snapshort){
		var wordObj = snapshort.val()  || {};
		wordObj.wordUkDictionaryData = wordDictionaryData;
		fireBaseGetWordDictionaryRef(word).set(wordObj);
		return wordObj;
	});
};

StorageApi.setWordUsDictionaryData = function (word, wordDictionaryData) {
	return fireBaseGetWordDictionary(word).then(function(snapshort){
		var wordObj = snapshort.val()  || {};
		wordObj.wordUsDictionaryData = wordDictionaryData;
		fireBaseGetWordDictionaryRef(word).set(wordObj);
		return wordObj;
	});
};

StorageApi.setTranslateFromEnglishToVn = function(word, translatedWord){
	return fireBaseGetWordDictionary(word).then(function(snapshort){
		var wordObj = snapshort.val()  || {};
		wordObj.translateFromEnglishToVn = translatedWord;
		fireBaseGetWordDictionaryRef(word).set(wordObj);
		return wordObj;
	});
};

StorageApi.clearWordDictionaryData = function (word) {
	return fireBaseGetWordDictionary(word).then(function(snapshort){
		var wordObj = snapshort.val()  || {};
		delete wordObj.translateFromEnglishToVn;
		delete wordObj.wordUsDictionaryData;
		delete wordObj.wordUkDictionaryData;
		return fireBaseGetWordDictionaryRef(word).set(wordObj);
	});
}