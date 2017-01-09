$(function () {
   $('#clearPlayList').click(clearPlayList);
   $('#listenToAll').click(listenToAllWordOfCurrentPage); 
});

function clearPlayList(){
    $('ul.sm2-playlist-bd').html('');
}

function listenToAllWordOfCurrentPage() {
    var listWords = $('[id^=text]').map(function(){return $(this).text()}).get();
    _.each(listWords, function (word) {
        if(!word){
            return;
        }

        listeningWords.push(word);
        $('#text_' + getWordIdfromWord(word)).closest('tr').addClass('listening');
        fireBaseGetWordDictionary(word).then(function (snapshort) {
            var wordObj = snapshort.val();
            var dictionaryDataKey = 'word' + defaultDictionaryCountry + 'DictionaryData';
            if(wordObj && wordObj[dictionaryDataKey]){
                addSoundOfWordToPlaylist(wordObj[dictionaryDataKey]);
                makeSoundAndMeaning(getWordIdfromWord(word), wordObj[dictionaryDataKey]);
            }else{
                showDictionaryData(word);
            }

            showTranslateFromEnglishToVn(word);
        });
    })
}