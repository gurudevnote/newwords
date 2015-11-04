Storage.prototype.setObject = function(key, value) {
  this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
  var value = this.getItem(key);
  return value && JSON.parse(value);
}

var wordCount = localStorage.length;
var datas = [];
for(i = 0; i < wordCount; i++) {
  var key = localStorage.key(i);
  var wordObj = localStorage.getObject(key);
  wordObj.date = moment(wordObj.date).format();
  if(wordObj.viewCount == undefined || wordObj.viewCount == null) {
    wordObj.viewCount = 0;
  }

  if(wordObj.savedCount == undefined || wordObj.savedCount == null) {
    wordObj.savedCount = 0;
  }

  datas.push(wordObj);
}

var now = moment();
datas = _.sortBy(datas, function(item){
  return now - item.date;
});

function updateViewCount(word){
  var wordObj = localStorage.getObject(word);
  wordObj.viewCount = (wordObj.viewCount == undefined ? 0 : wordObj.viewCount) + 1;
  localStorage.setObject(word, wordObj);

  var id = wordObj.text.replace(/\s+/g, '_');
  $('#viewCount_'+id).html(wordObj.viewCount);
  return wordObj.viewCount;
}

//var dicUrl = "http://www.oxforddictionaries.com/definition/english/";
var dicUrl = 'http://www.oxforddictionaries.com/search/?multi=1&dictCode=english&q=';
var googleImages = 'https://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=';
var dynamicTable = null;
$(function(){
  dynamicTable = $('#my-final-table').dynatable({
    dataset: {
      records: datas
    },
    writers: {
      _rowWriter: function(rowIndex, record, columns, cellWriter) {
        var id = record.text.replace(/\s+/g, '_');
        var source = '<td>&nbsp;</td>';
        var savedCount = '<td>&nbsp;</td>';
        var viewCount = '<td id="viewCount_' + id + '">&nbsp;</td>';
        if(record.url) {
          source = '<td><a target="_blank" href="' + record.url +'">source</a></td>';
        }
        if(record.savedCount) {
          savedCount = '<td>' + record.savedCount + '</td>';
        }
        if(record.viewCount) {
          viewCount = '<td id="viewCount_' + id + '">' + record.viewCount + '</td>';
        }
        var textWithLink = "<a google-image='' target='_blank' id='text_" + id + "' href='" + dicUrl + record.text +"'>" + record.text + "</a>";
        return '<tr><td style="text-align: left;">' + textWithLink + '</td><td style="text-align: left;">' + record.date + '</td>' + savedCount + viewCount + source + '</tr>';
      }
    },
  }).data('dynatable');

  $('body').on('click', "a[id^=text_]", function () {
    var text =($(this).text());
    var viewCount = updateViewCount(text);
    dynamicTable.settings.dataset.originalRecords = _.map(dynamicTable.settings.dataset.originalRecords, function(it){
      if(it.text == text){
        it.viewCount = viewCount;
      }
      return it;
    });
    dynamicTable.process();
  });

  $(document).tooltip({items: '[google-image]', content: function(callback){
    var text =($(this).text());
    $.getJSON(googleImages + text, function(data){
      var listImages = _.map(data.responseData.results, function(item){
        return {tbUrl: item.tbUrl, tbHeight: item.tbHeight, tbWidth: item.tbWidth, url: item.url, width: item.width, height: item.height}
      });
      var listImagesContent = _.map(listImages, function(it){
        return '<img src="' + it.tbUrl + '"/>';
      });
      callback(listImagesContent.join());
    });
  }});
});
