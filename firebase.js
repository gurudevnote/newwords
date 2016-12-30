// Initialize Firebase
var fireBaseConfig = {
    apiKey: "AIzaSyABYTFst6nxNJ1vjMKb1lUaa8j6bVJ86rU",
    authDomain: "newwords-d0e1c.firebaseapp.com",
    databaseURL: "https://newwords-d0e1c.firebaseio.com",
    storageBucket: "newwords-d0e1c.appspot.com",
    messagingSenderId: "318144735480"
};
firebase.initializeApp(fireBaseConfig);
var wordsRef = firebase.database().ref('words');
function fireBaseGetWordRef(word) {
    return firebase.database().ref('words/' + word);
}