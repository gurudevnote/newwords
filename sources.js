var url = window.location.href;
var highlightWordRegexp = /\?word=([^\?#&\\\/]*)/g;
var match = highlightWordRegexp.exec(url);
//console.dir(match);
var word = null;
if(match != null && match[1] != undefined) {
  word = match[1];
}

var wordObj = localStorage.getObject(word);

if(wordObj.urls) {
	wordObj.urls.map(function(it){
		var source = '<p><a target="_blank" href="' + it + '#__highlightword=' + word +'">' + it + '</a></p>';
		document.write(source);
	})
}