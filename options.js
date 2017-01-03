$(function(){
	$('#synchonize').click(function(){
		synchronizeChrome();
	});

	$('#getAllfromChromeStorage').click(function(){
		chrome.storage.sync.get(null, function(items) {
			//console.dir(items);
		    //var allKeys = Object.keys(items);
		    //console.dir(allKeys);
		    var numberUpdated = 0;
		    var updatedKeys = [];
		    _.map(items, function(value, key){
		    	//console.log(key);
		    	var localValue = localStorage.getObject(key);
		    	if(localValue == undefined || localValue == null) {
		    		localStorage.setItem(key, value);
		    		updatedKeys.push(key);
		    		numberUpdated ++;
		    	}
		    })
		    alert('number items is imported from chrome storage to local storage is ' + numberUpdated + '\n' + updatedKeys.join('\n'));
		});
	});

	$("#exportToJson").click(function(){
		StorageApi.getAllWords().then(function (data) {
			$('#result').html(JSON.stringify(data,  null, 4));
		});
	});
});