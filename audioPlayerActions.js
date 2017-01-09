$(function () {
   $('#clearPlayList').click(clearPlayList);
});

function clearPlayList(){
    $('ul.sm2-playlist-bd').html('');
}