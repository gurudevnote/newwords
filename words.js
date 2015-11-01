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
  datas.push({
    text: wordObj.text,
    date: moment(wordObj.date).format()
  });
  var now = moment();
  datas = _.sortBy(datas, function(item){
    return now - item.date;
  })
}

var dicUrl = "http://www.oxforddictionaries.com/definition/english/";
$(function(){
  $('#my-final-table').dynatable({
    dataset: {
      records: datas
    },
    writers: {
      _rowWriter: function(rowIndex, record, columns, cellWriter) {
        var textWithLink = "<a target='_blank' href='" + dicUrl + record.text +"'>" + record.text + "</a>";
        return '<tr><td style="text-align: left;">' + textWithLink + '</td><td style="text-align: left;">' + record.date + '</td></tr>';
      }
    },
  });
});
