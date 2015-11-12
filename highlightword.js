var url = window.location.href;
var highlightWordRegexp = /__highlightword=([^\?#&\\\/]*)/g;
var match = highlightWordRegexp.exec(url);
//console.dir(match);
var word = match[1];
var achorIndex = 1;
if(word != undefined || word != null || word != '') {
	//highlight the word
	//alert(word);
	highlightSearchTerms(word);

	//create nex button
	document.body.innerHTML += '<div style="position:fixed;top:5px;left:5px;background:red;z-index:99999;">'+
	'Total match: ' + (achorIndex - 1) + '<button onclick="nextAchor()">next</button></div>';	

	var actualCode = [
		"var currentAchorIndex = 1;",
		"var achorIndex = " + achorIndex + ";",
		"function nextAchor() {",
			"if(currentAchorIndex <= achorIndex) {",
				"currentAchorIndex++;",
			"}",

			"if(currentAchorIndex > achorIndex) {",
				"currentAchorIndex = 1;",
			"}",

			"window.location.href='#achorIndex' + currentAchorIndex;",
		"}",

	].join('\n');

	var script = document.createElement('script');
	script.textContent = actualCode;
	(document.head||document.documentElement).appendChild(script);
	script.parentNode.removeChild(script);
}

//source code from website: http://www.nsftools.com/misc/SearchAndHighlight.htm

function doHighlight(bodyText, searchTerm, highlightStartTag, highlightEndTag) 
{  
  // the highlightStartTag and highlightEndTag parameters are optional
  if ((!highlightStartTag) || (!highlightEndTag)) {
    highlightStartTag = "<font style='color:blue; background-color:yellow; font-size: 40px; font-weight:bold;'>";
    highlightEndTag = "</font>";
  }  
  
  // find all occurences of the search term in the given text,
  // and add some "highlight" tags to them (we're not using a
  // regular expression search, because we want to filter out
  // matches that occur within HTML tags and script blocks, so
  // we have to do a little extra validation)
  var newText = "";
  var i = -1;
  var lcSearchTerm = searchTerm.toLowerCase();
  var lcBodyText = bodyText.toLowerCase();
    
  while (bodyText.length > 0) {
    i = lcBodyText.indexOf(lcSearchTerm, i+1);
    if (i < 0) {
      newText += bodyText;
      bodyText = "";
    } else {
      // skip anything inside an HTML tag
      if (bodyText.lastIndexOf(">", i) >= bodyText.lastIndexOf("<", i)) {
        // skip anything inside a <script> block
        if (lcBodyText.lastIndexOf("/script>", i) >= lcBodyText.lastIndexOf("<script", i)) {
          var highlightStartTagWithAchor = "<a id='achorIndex" + achorIndex + "'></a>" + highlightStartTag;	
          newText += bodyText.substring(0, i) + highlightStartTagWithAchor + bodyText.substr(i, searchTerm.length) + highlightEndTag;
          bodyText = bodyText.substr(i + searchTerm.length);
          lcBodyText = bodyText.toLowerCase();
          i = -1;
          achorIndex++;
        }
      }
    }
  }
  
  return newText;
}


/*
 * This is sort of a wrapper function to the doHighlight function.
 * It takes the searchText that you pass, optionally splits it into
 * separate words, and transforms the text on the current web page.
 * Only the "searchText" parameter is required; all other parameters
 * are optional and can be omitted.
 */
function highlightSearchTerms(searchText, treatAsPhrase, warnOnFailure, highlightStartTag, highlightEndTag)
{
  // if the treatAsPhrase parameter is true, then we should search for 
  // the entire phrase that was entered; otherwise, we will split the
  // search string so that each word is searched for and highlighted
  // individually
  if (treatAsPhrase) {
    searchArray = [searchText];
  } else {
    searchArray = searchText.split(" ");
  }
  
  if (!document.body || typeof(document.body.innerHTML) == "undefined") {
    if (warnOnFailure) {
      alert("Sorry, for some reason the text of this page is unavailable. Searching will not work.");
    }
    return false;
  }
  
  var bodyText = document.body.innerHTML;
  for (var i = 0; i < searchArray.length; i++) {
    bodyText = doHighlight(bodyText, searchArray[i], highlightStartTag, highlightEndTag);
  }
  
  document.body.innerHTML = bodyText;

  window.location.href = "#achorIndex1";
  return true;
}
