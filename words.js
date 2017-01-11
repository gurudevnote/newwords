var datas = [];
var events = [];
var listeningWords = [];
var defaultDictionaryCountry = 'Uk';
var currentSelectedWord = '';
function updateViewCountToUi(word){
  return fireBaseGetWordRef(word).once("value").then(function (snapshort) {
    var wordObj = snapshort.val();
    wordObj.viewCount = (wordObj.viewCount == undefined ? 0 : wordObj.viewCount) + 1;
    var id = wordObj.text.replace(/\s+/g, '_');
    $('#viewCount_'+id).html(wordObj.viewCount);
    return fireBaseGetWordRef(word).set(wordObj).then(function () {
      return wordObj.viewCount;
    });
  });
}

$.ajaxPrefilter(function( options, originalOptions ) {
  if(originalOptions.url.indexOf('http://localhost:3000/')){
    options.url = "http://localhost:3000/?url=" + encodeURIComponent( originalOptions.url );
  }
});

var urlClear = "http://localhost:3000/remove_caches?url=";
var dicUrl = "https://en.oxforddictionaries.com/definition/";
//var dicUrlResult = 'https://en.oxforddictionaries.com/search?utf8=%E2%9C%93&filter=dictionary&query=';
var dicUrlResult = dicUrl;
var googleImagesApi = 'https://ajax.googleapis.com/ajax/services/search/images?v=1.0&rsz=8&q=';
var googleImagesWeb = 'https://www.google.com/search?tbm=isch&q=';
var cambridgeDic = 'http://dictionary.cambridge.org/dictionary/english/';
var googleTranslateToVn = 'https://translate.google.com/#en/vi/';
var ludwigUrl = 'https://ludwig.guru/s/';
var dynamicTable = null;
var audios = [];
function getDictionaryUrlByContry(country) {
  if(country == 'Uk'){
    return 'https://en.oxforddictionaries.com/definition/';
  }else{
    return 'https://en.oxforddictionaries.com/definition/us/'
  }
}
function stopAudios(){
  _.map(audios, function(audio){
    audio.pause();
  });
}
$.ajaxSetup({ cache: true });
function getWordIdfromWord(text) {
  return text.replace(/[\s;,.]+/g, '_');
}
function showDictionaryData(text, dictionary) {
  currentSelectedWord = text;
  var id = getWordIdfromWord(text);
  fireBaseGetWordDictionary(text).then(function(snapshort) {
    var wordObj = snapshort.val();
    var computedDictionary = dictionary == undefined ? defaultDictionaryCountry : dictionary;
    var dictionaryDataKey = 'word' + computedDictionary + 'DictionaryData';
    if (wordObj && wordObj[dictionaryDataKey] && wordObj[dictionaryDataKey] != null) {
      showMeaning(id, wordObj[dictionaryDataKey]);
      var audioSrc = wordObj[dictionaryDataKey] && wordObj[dictionaryDataKey].mp3;
      playAudio(audioSrc);
    } else {
      var combineDicUrlResult = dictionary == undefined ? dicUrlResult : getDictionaryUrlByContry(computedDictionary);
      $.get(combineDicUrlResult + text, function (dicResult, textStatus, xhr) {
        var dicData = getDicDataFromWebContent(text, dicResult);
        if (computedDictionary === 'Uk') {
          StorageApi.setWordUkDictionaryData(text, dicData);
        } else {
          StorageApi.setWordUsDictionaryData(text, dicData);
        }
        showMeaning(id, dicData);
        var audioSrc = dicData && dicData.mp3;
        playAudio(audioSrc);
      });
    }
  });
}

function showTranslateFromEnglishToVn(word) {
  fireBaseGetWordDictionary(word).then(function(snapshort) {
    var wordObj = snapshort.val();
    if (wordObj && wordObj.translateFromEnglishToVn) {
      $('#translate_' + getWordIdfromWord(word)).text(wordObj.translateFromEnglishToVn);
    } else {
      $.get(googleTranslateToVn + word, function (googleTranslateResult) {
        var translateText = $(googleTranslateResult).find('#result_box').text();
        StorageApi.setTranslateFromEnglishToVn(word, translateText);
        $('#translate_' + getWordIdfromWord(word)).text(translateText);
      });
    }
  });
}

function getGoogleImageWebOfWord(text) {
  return googleImagesWeb + text;
}
$(function(){
  $('button#showAddForm').click(function(){
    $(this).hide();
    $('div#add').show();
    $('div#dicOptoin').hide();
    $('#tableView, #calendar, #google-images').hide();
  });

  $('button#cancelWords').click(function(){
    $('div#add').hide();
    $('div#dicOptoin').show();
    $('button#showAddForm').show();
    $('#tableView, #calendar, #google-images').show();
  });

  $('button#saveWords').click(function(){
    $('div#add').hide();
    $('button#showAddForm').show();
    $('div#dicOptoin').show();
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
    var promises = _.map(listWords, function(word){
      var selectedText = word.toLowerCase();
      var url = '';
      return fireBaseGetWordRef(selectedText).once('value').then(function(snapshort){
        var wordObj = snapshort.val();
        if(wordObj == undefined || wordObj == null) {
          wordObj = {
            "text": selectedText,
            "date":  moment(new Date()).format(),
            "url": url,
            "viewCount": 0,
            "savedCount": 1
          };
        } else {
          wordObj.date = moment(new Date()).format();
          wordObj.savedCount = (wordObj.savedCount==undefined ? 0 : wordObj.savedCount) + 1;
        }
        return fireBaseGetWordRef(selectedText).set(wordObj).then(function(){
          return wordObj;
        });
      });
    });

    Promise.all(promises).then(function () {
      window.location.reload();
    });
  });

  wordsRef.once('value', function(snapshot) {
    var words = [];
    snapshot.forEach(function(childSnapshot) {
      var word = childSnapshot.val();
      words.push(word);
      if(!word.hideDate){
        word.hideDate = moment(word.date).format('YYYY-MM-DD');
      }
    });

    datas = words;
    var now = moment();
    datas = _.sortBy(datas, function(item){
      return now - item.date;
    });

    events = StorageApi.getAllWordForDisplayingOnCalendar(datas);
    dynamicTable = $('#my-final-table').dynatable({
      dataset: {
        records: datas,
        perPageOptions: [10,20,50,100,200,400,600,1000, 10000]
      },
      writers: {
        _rowWriter: function(rowIndex, record, columns, cellWriter) {
          var tdClass = '';
          if(_.includes(listeningWords, record.text.toLowerCase())) {
            tdClass = 'listening'
          }
          var id = record.text.replace(/\s+/g, '_');
          var source = '<td>&nbsp;</td>';
          var savedCount = '<td>&nbsp;</td>';
          var viewCount = '<td id="viewCount_' + id + '">&nbsp;</td>';
          //var action = '<td><a class="action" word="'+ record.text +'" href="#">delete</a></td>';
          var action = '<td><span class="action" word="'+ record.text +'"><i class="material-icons">more_vert</i></span></td>';
          if(record.urls) {
            if(record.urls.length == 1){
              source = '<td><a target="_blank" href="' + record.urls[0] + '#__highlightword=' + record.text +'">source</a></td>';
            } else {
              source = '<td><a target="_blank" href="sources.html?word='+ record.text +'">sources</a>('+record.urls.length+')</td>';
            }
          } else if(record.url) {
            source = '<td><a target="_blank" href="' + record.url + '#__highlightword=' + record.text +'">source</a></td>';
          }
          if(record.savedCount) {
            savedCount = '<td>' + record.savedCount + '</td>';
          }
          if(record.viewCount) {
            viewCount = '<td id="viewCount_' + id + '">' + record.viewCount + '</td>';
          }
          var cambridgeWordLink = cambridgeDic + record.text;
          var oxfordWordLink = dicUrlResult + record.text;
          var cambridgeLink = ' <a id="cambridge_'+id+'" target="_blank" word="'+record.text+'" href="'+cambridgeWordLink+'"><image class="cambridge_icon" src="images/cambridge.ico"></a>';
          var oxfordLink = ' <a id="oxford_'+id+'" target="_blank" word="'+record.text+'" href="'+oxfordWordLink+'"><image class="oxford_icon" src="images/oxforddictionary.ico"></a>';
          var textWithLink = "<span class='word_hover' google-image='' target='_blank' id='text_" + id + "'"
              + ">" + record.text + "</span>"
              + '<span id="correctedWord_' + id + '"></span>'
              + oxfordLink
              + cambridgeLink
              + ' <a href="' + googleImagesWeb + record.text + '" target="_blank"><image class="google_icon" src="images/googleg_lodp.ico"></a>'
              + ' <a href="https://translate.google.com/#en/vi/' + record.text + '" target="_blank"><image class="google_icon" src="images/google_translate.ico"></a>'
              + '<a href="' + ludwigUrl + record.text + '" target="_blank"><image class="ludwig_icon" src="images/ludwig.ico" /></a>'
              + "<span class='correctedWord' id='phonetic_" + id + "'></span><span id='wordType_" + id + "'></span>"
              + "<span class='correctedWord' id='translate_" + id + "'></span>"
              + "<br/> <span id='meaning_" + id + "'></span><span class='examples' id='examples_" + id + "'></span>";
          return '<tr class="' + tdClass + '"><td style="text-align: left;">' + textWithLink + '</td><td style="text-align: left;">' + record.date + '</td>' + savedCount + viewCount + source + action + '</tr>';
        }
      },
    }).data('dynatable');

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
  });

  $('body').on('click', "a[id^=text_]", function () {
    var text =($(this).text());
    updateViewCountToUi(text).then(function(viewCount){
      dynamicTable.settings.dataset.originalRecords = _.map(dynamicTable.settings.dataset.originalRecords, function(it){
        if(it.text == text){
          it.viewCount = viewCount;
        }
        return it;
      });
      dynamicTable.process();
    });
  });

  function displayGoogleImages(listImages, callback) {
    var listImagesContent = _.map(listImages, function (it) {
      return '<img src="' + it.url + '"/>';
    });
    var listBigImage = _.map(listImages, function (it) {
      return '<img src="' + it.realUrl + '" />';
    });
    //$('#google-images').html(listBigImage);

    callback(_.sampleSize(listImagesContent, 4).join(' '));
  }

  $(document).tooltip({
    items: '[google-image],span.fc-title',
      tooltipClass: 'images-tooltip',
      content: function(callback){
        var text =($(this).text());
        fireBaseGetWordDictionary(text).then(function(snapshort){
          var wordObj = snapshort.val();
          if(wordObj && wordObj.googleImages && wordObj.googleImages.length > 0){
            var listImages = wordObj.googleImages;
            displayGoogleImages(listImages, callback);
          }
          else
          {
            $.get(getGoogleImageWebOfWord(text), function(data){
              var listImages = $.map($(data).find('[data-src^=http]'),function(item){
                var linkData = $(item).parent().attr('href');
                var result = {url: '', realUrl: '', refUrl: ''};
                try {
                  result = {
                    url: $(item).attr('data-src'),
                    realUrl: decodeURIComponent(/\/imgres\?imgurl=([^&]+)/.exec(linkData)[1]),
                    refUrl: decodeURIComponent(/&imgrefurl=([^&]+)/.exec(linkData)[1])
                  };
                } catch (e) {

                } finally {

                }

                return result;
              });

              StorageApi.setWordGoogleImages(text, listImages);
              displayGoogleImages(listImages, callback);
            });
          }
        });
      },
      position: {
        my: "left top+15",
        at: "left bottom+15",
        collision: "flipfit flip"
      },
    });

  $('body').on('click', "span.fc-title", function () {
    var text =($(this).text());
    window.open(dicUrlResult + text);
  });

  $('body').on('mouseover', "span.fc-title, span[id^=text_]", function () {
    showDictionaryData($(this).text());
    showTranslateFromEnglishToVn($(this).text());
  });
  $('#isUKDic').click(function(){
    if($(this).is(':checked')){
      dicUrl = "https://en.oxforddictionaries.com/definition/";
      dicUrlResult = 'https://en.oxforddictionaries.com/definition/';
      defaultDictionaryCountry = 'Uk';
    } else {
      dicUrl = "https://en.oxforddictionaries.com/definition/us/";
      dicUrlResult = 'https://en.oxforddictionaries.com/definition/us/';
      defaultDictionaryCountry = 'Us';
    }
  });
  var switchedDictionaryCountrys = [];
  var hideTimeout = null;
  $(document).keydown(function(event){
    if(event.which=="17" && $('#add').css('display') == 'none') {
      $('#isUKDic').trigger('click');
      var message = '';
      if($('#isUKDic').is(':checked')){
        message += "English UK";
      } else {
        message += "English US";
      }
      $('#notice').html(message);
      $('#notice').show();
      clearTimeout(hideTimeout);
      hideTimeout = setTimeout(function(){
        $('#notice').hide();
      }, 1500);
    }

    if(event.keyCode == 16){
      if(currentSelectedWord == ''){
        return;
      }
      if(switchedDictionaryCountrys[currentSelectedWord] == 'Uk'){
        switchedDictionaryCountrys[currentSelectedWord] = 'Us';
      }
      else if(switchedDictionaryCountrys[currentSelectedWord] == 'Us'){
        switchedDictionaryCountrys[currentSelectedWord] = 'Uk';
      }
      else{
        switchedDictionaryCountrys[currentSelectedWord] = 'Us';
      }
      showDictionaryData(currentSelectedWord, switchedDictionaryCountrys[currentSelectedWord]);
    }
  });

  $.contextMenu({
        selector: 'span.action',
        trigger: 'left',
        callback: function(key, options) {
            var word = $(this['context']).attr('word');
            if(key == 'delete') {
              if(confirm('Are you sure to remove the word: ' + word)){
                localStorage.removeItem(word);

                fireBaseGetWordRef(word).remove().then(function () {
                  window.location.reload();
                });
              }
            } else if(key == 'listen') {
              //add words to listening list
              listeningWords.push(word);
              $(this['context']).closest('tr').addClass('listening');
              fireBaseGetWordDictionary(word).then(function (snapshort) {
                var wordObj = snapshort.val();
                var dictionaryDataKey = 'word' + defaultDictionaryCountry + 'DictionaryData';
                if(wordObj && wordObj[dictionaryDataKey]){
                  addSoundOfWordToPlaylist(wordObj[dictionaryDataKey]);
                  showMeaning(getWordIdfromWord(word), wordObj[dictionaryDataKey]);
                  var audioSrc = wordObj[dictionaryDataKey] && wordObj[dictionaryDataKey].mp3;
                  playAudio(audioSrc);
                }else{
                  showDictionaryData(word);
                }

                showTranslateFromEnglishToVn(word);
              });
            } else if(key == 'clear images'){
              StorageApi.setWordGoogleImages(word, null);
              $.get(urlClear + encodeURIComponent(getGoogleImageWebOfWord(word)));
            } else if(key == 'clear dictionary data'){
              $.get(urlClear + encodeURIComponent(getDictionaryUrlByContry('Uk') + word));
              $.get(urlClear + encodeURIComponent(getDictionaryUrlByContry('Us') + word));
              StorageApi.clearWordDictionaryData(word);
            }
        },
        items: {
            "listen": {name: "Listen", icon: "listen"},
            "delete": {name: "Delete", icon: "delete"},
            "clear images": {name: "clear images", icon: "delete"},
            "clear dictionary data": {name: "clear dictionary data", icon: "delete"},
        }
    });

});

function showMeaning(id, dicData){
  $('#phonetic_'+id).text(dicData.phonetic);
  $('#wordType_'+id).text(dicData.partOfSpeech);
  $('#meaning_' + id).text(dicData.meaning);
  $('#examples_' + id).html(dicData.examplesText);
  $('#text_' + id).attr('correctedWord', dicData.correctedWord);
  var inputtedWord = $('#text_' + id).text();
  if(dicData.correctedWord
      && dicData.correctedWord != ''
      && dicData.correctedWord != inputtedWord
  ){
    $('#correctedWord_' + id).text(' ' + dicData.correctedWord);
  }
  $('#cambridge_' + id).attr('href', cambridgeDic + dicData.correctedWord);
}

function getDicDataFromWebContent(word, dicDataWebContent){
  var dicDataDom = $(dicDataWebContent);
  var mp3 = dicDataDom.find('.headwordAudio audio:eq(0)').attr('src') || dicDataDom.find('a.speaker audio:eq(0)').attr('src') || '';
  var title = dicDataDom.find('[data-headword-id]:eq(0)').attr('data-headword-id').trim().replace(/\d+/i, '') || '';
  var phonetic = dicDataDom.find('.phoneticspelling:eq(0)').text() || $('.pron.alternative').text() || '';
  phonetic = phonetic.replace('Pronunciation:', title) || '';
  var meaning = dicDataDom.find('.semb .ind:eq(0)').text() + dicDataDom.find('.semb .ex:eq(0)').text() || '';
  var partOfSpeech = _.map(dicDataDom.find('.pos'), function(partOfSpeech){
    return $(partOfSpeech).text();
  });
  partOfSpeech =  '(' + _.uniq(partOfSpeech).join(', ') + ')';
  var examples = _.map(dicDataDom.find('.exg .ex'), function(item){
    return $(item).text();
  });
  //var examplesText = examples.join('<br/>');
  var examplesText = '';
  return {
    word: word,
    correctedWord: title,
    title: title,
    mp3: mp3,
    phonetic: phonetic,
    meaning: meaning,
    partOfSpeech: partOfSpeech,
    examples: examples,
    examplesText: examplesText
  }
}

function playAudio(audioSrc){
  if(!audioSrc){
    return;
  }
  var audio = new Audio();
  audio.src = audioSrc;
  stopAudios();
  audio.play();
}

function addSoundOfWordToPlaylist(dicData){
  if(!dicData.mp3) return;

  if($('ul.sm2-playlist-bd li[word="'+dicData.word+'"]').length == 0){
    var wordData = "<span class='correctedWord'>"+dicData.phonetic+"</span><span>" + dicData.partOfSpeech +"</span>"
          + "<span>"+dicData.meaning+"</span>";
    $('ul.sm2-playlist-bd').append('<li word="'+dicData.word+'"><a href="'+dicData.mp3+'">'+wordData+'</a></li>');
  }else if($('ul.sm2-playlist-bd li[word="'+dicData.title+'"]').length == 0){
    var wordData = "<span class='correctedWord'>"+dicData.phonetic+"</span><span>" + dicData.partOfSpeech +"</span>"
        + "<span>"+dicData.meaning+"</span>";
    $('ul.sm2-playlist-bd').append('<li word="'+dicData.title+'"><a href="'+dicData.mp3+'">'+wordData+'</a></li>');
  }
}
