var wordCount = localStorage.length;
var datas = [];
var events = [];
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

  datas.push(wordObj);
  events.push({
    title: wordObj.text,
    start: wordObj.date
  });
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

var dicUrl = "http://www.oxforddictionaries.com/definition/english/";
var dicUrlResult = 'http://www.oxforddictionaries.com/search/?multi=1&dictCode=english&q=';
var googleImages = 'https://ajax.googleapis.com/ajax/services/search/images?v=1.0&rsz=8&q=';
var dynamicTable = null;
var audios = [];
function stopAudios(){
  _.map(audios, function(audio){
    audio.pause();
  });
}
$.ajaxSetup({ cache: true });
$(function(){
  $('button#showAddForm').click(function(){
    $(this).hide();
    $('div#add').show();
    $('#tableView, #calendar, #google-images').hide();
  });

  $('button#saveWords').click(function(){
    $('div#add').hide();
    $('button#showAddForm').show();
    $('#tableView, #calendar, #google-images').show();
    var listWords = $('#inputeText').val().toLowerCase().split(/[\n\r,;]+/i);
    //console.dir(listWords);
    //console.log($('#inputeText').val().toLowerCase());
    listWords = _.map(listWords, function(it){
      return it.trim();
    });
    listWords = _.uniq(listWords);
    listWords = _.filter(listWords, function(word){
      return word != undefined && word != null && word != '';
    });

    //console.dir(listWords);
    //add list word to storage
    var listWordsSyn = {};
    _.map(listWords, function(word){
      var selectedText = word.toLowerCase();
      var url = '';
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
      listWordsSyn[selectedText] = localStorage.getItem(selectedText);
    });

    //synch to chrome storage
    try
    {
      chrome.storage.sync.set(listWordsSyn, function(){
      });
    }
    catch(err) {

    }
  });



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
        var action = '<td><a class="action" word="'+ record.text +'" href="#">delete</a></td>';
        if(record.url) {
          source = '<td><a target="_blank" href="' + record.url + '#__highlightword=' + record.text +'">source</a></td>';
        }
        if(record.savedCount) {
          savedCount = '<td>' + record.savedCount + '</td>';
        }
        if(record.viewCount) {
          viewCount = '<td id="viewCount_' + id + '">' + record.viewCount + '</td>';
        }
        var textWithLink = "<a google-image='' target='_blank' id='text_" + id
          + "' href='" + dicUrlResult + record.text +"'>" + record.text
          + "</a> <span class='correctedWord' id='phonetic_" + id + "'></span>"
          + "<br/> <span id='meaning_" + id + "'></span>";
        return '<tr><td style="text-align: left;">' + textWithLink + '</td><td style="text-align: left;">' + record.date + '</td>' + savedCount + viewCount + source + action + '</tr>';
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

  dynamicTable.queries.functions['hideDate'] = function(record, queryValue) {
      return queryValue == record.hideDate;
  };

  $('#calendar').fullCalendar({
    header: {
      left: 'prev,next today',
      center: 'title',
      right: 'month,agendaWeek,agendaDay'
    },
    defaultDate: moment().format('YYYY-MM-DD'),
    editable: false,
    eventLimit: true, // allow "more" link when too many events
    events: events,
    dayClick: function(date, jsEvent, view) {
      dynamicTable.queries.add("hideDate",date.format('YYYY-MM-DD'));
      dynamicTable.process();
    }
  });

  $(document).tooltip({items: '[google-image],span.fc-title', tooltipClass: 'images-tooltip', content: function(callback){
      var text =($(this).text());
      $.getJSON(googleImages + text, function(data){
        var listImages = _.map(data.responseData.results, function(item){
          return {tbUrl: item.tbUrl, tbHeight: item.tbHeight, tbWidth: item.tbWidth, url: item.url, width: item.width, height: item.height}
        });
        var listImagesContent = _.map(listImages, function(it){
        return '<img src="' + it.url + '"/>';
        });
        var listBigImage = _.map(listImages, function(it){
          return '<img src="' +it.url + '" />';
        });
        $('#google-images').html(listBigImage);
        callback(listImagesContent.join(' '));
      });
    },
  });

  $('body').on('click', "span.fc-title", function () {
    var text =($(this).text());
    window.open(dicUrlResult + text);
  });

  $('body').on('click', "a.action", function () {
    var text =$(this).attr('word');
    if(confirm('Are you sure to remove the word: ' + text)){
      localStorage.removeItem(text);
      window.location.reload();
    }
  });

  $('body').on('mouseover', "span.fc-title, a[id^=text_]", function () {
    var text = $(this).text();
    var id = text.replace(/\s+/g, '_');
    $.get(dicUrlResult + text, function(dicResult){
      var url = $(dicResult).find('#searchPageResults a:eq(0)').attr('href');
      var mp3 = $(dicResult).find('.audio_play_button:eq(0)').attr('data-src-mp3');
      if(mp3 != undefined){
        var dicResultDom = $(dicResult);
        var phonetic = dicResultDom.find('.headpron:eq(0)').text();
        var title = dicResultDom.find('.pageTitle').text();
        phonetic = phonetic.replace('Pronunciation:', title);
        var meaning = dicResultDom.find('.definition:eq(0)').text();
        $('#phonetic_'+id).text(phonetic);
        $('#meaning_' + id).text(meaning);
        var audio = new Audio();
        audio.src = mp3;
        stopAudios();
        audio.play();
        audios.push(audio);
      } else {
        $.get(url, function (dicData) {
          var dicDataDom = $(dicData);
          var mp3 = dicDataDom.find('.audio_play_button:eq(0)').attr('data-src-mp3');
          var title = dicDataDom.find('.pageTitle').text();
          var phonetic = dicDataDom.find('.headpron:eq(0)').text();
          phonetic = phonetic.replace('Pronunciation:', title);
          var meaning = dicDataDom.find('.definition:eq(0)').text();
          $('#phonetic_'+id).text(phonetic);
          $('#meaning_' + id).text(meaning);
          var audio = new Audio();
          audio.src = mp3;
          stopAudios();
          audio.play();
          audios.push(audio);
        });
      }
    });
  });
});
