$(function () {
    $('#getAllPicture').click(getAllGoogleImages);
});

function getAllGoogleImages() {
    var listWords = getAllWordsInCurrentPage();
    _.each(listWords, function (word) {
        if(!word){
            return;
        }

        fireBaseGetImageWordDictionary(word).then(function (snapshort) {
            var googleImages = snapshort.val();
            var needGetImageFromGoogleImage = false;
            var count = 0;
            if(googleImages == null || googleImages.length == 0)
            {
                needGetImageFromGoogleImage = true;
            }else {
                count = _.filter(googleImages, function (item) {
                    return item.url != '';
                }).length;
                if(count < googleImages.length - 10){
                    needGetImageFromGoogleImage = true;
                }
            }


            if(needGetImageFromGoogleImage){
                console.log(word, count, googleImages.length);
                $.get(urlClear + encodeURIComponent(getGoogleImageWebOfWord(word)), function () {
                    $.get(getGoogleImageWebOfWord(word), function(data){
                        var listImages = getGoogleImagesFromWebContent(data);
                        StorageApi.setWordGoogleImages(word, listImages);
                    });
                });
            }
        });
    });
}