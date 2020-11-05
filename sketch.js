//START GLOBAL VARS
var state = 'intro'; // text or bins or intro - according to toggle value
var allWords = [];
var sentiment;
var sentimentResult;
var emojiSentimentResult;
var newModel;
var score = 0;
var currentPickedChar = [];
var allPickedChar = [];

// ALL DOM ELEMENTS - CONTAINERS
var introContainer = document.querySelector('#intro');
var textContainer = document.querySelector('#text');
var binsContainer = document.querySelector('#bins');
var ratingContainer = document.querySelector('#rating');
var controlsContainer = document.querySelector('#controls');
// ALL DOM ELEMENTS - OTHER
var negativePercent = document.querySelector('.negativePercent');
var startBtn = document.querySelector('#start');
var stopBtn = document.querySelector('#stop');
var restartBtn = document.querySelector('#restart');
var positive = jQuery('.positiveNumber');
var negative = jQuery('.negativeNumber');

function setup() {
    noCanvas();
    let lang = navigator.language || 'en-US';
    let speechRec = new p5.SpeechRec(lang, gotSpeech);
    let continous = true;
    let interim = false;

    startBtn.addEventListener('click', startListening);
    stopBtn.addEventListener('click', stopListening);
    restartBtn.addEventListener('click', scoreTheList);

    newModel = ml5.neuralNetwork();
    sentiment = ml5.sentiment('movieReviews', modelReady);

    sentimentResult = createP('sentiment score:').parent(textContainer);
    emojiSentimentResult = createP('emoji sentiment score:').parent(textContainer);
    sentimentResult.addClass('sentimentScore');
    emojiSentimentResult.addClass('emojiSentimentScore');

    function startListening() {
        speechRec.start(continous, interim);
    }

    function stopListening() {
        speechRec.stop();
    }
    
    function gotSpeech() {
        console.log('NEW SPEECH**************************************');
        if (speechRec.resultValue) {
            var words = speechRec.resultString.split(/\W/);
            
            switch (state) {
                case 'intro':
                    console.log('Intro mode - cant do anything with speech!');
                    break;
                case 'text':
                    //display emoji and words in output call text sentiment
                    displayEmojiInOutput(words);

                    // PROBLEM - BELOW IS NOT UPDATED ON FIRST SPEECH
                    allPickedChar = allPickedChar.concat(currentPickedChar);
                        console.log('Current characters: ' + currentPickedChar);
                        console.log('All characters ever said: ' + allPickedChar);
                        console.log('All characters lenght: ' + allPickedChar.length);
    
                    allWords.push(words);
                    analyseSentiment(words);

                    for ( let i in currentPickedChar ) {
                        analyseEmojiSentiment(currentPickedChar[i]);
                    }     
                    currentPickedChar = [];
                    
                    break;
                case 'bins':
                    //display emoji in bins call emoji sentiment
                    //displayEmojiInOutput(words);

                    break;
            }
        }
    }
}

//*****************************************************************
//goes trhough all spoken words, finds corresponding emoji and parents it to the output
//if there is no corresponding emoji it parents the text
function displayEmojiInOutput(words) {
    console.log('Words: ' + words);
    var counter = words.length;

    words.forEach((word, index) => {
        setTimeout(function(){
            var node = EmojiTranslate.translateForDisplay(words[index]);
            if (node.nodeName == 'SELECT') {
                var optionsArray = node.childNodes;
                var randomNumber = Math.floor(Math.random() * ((optionsArray.length - 1) - 0) + 0);
                // console.log('Word: ' + word + '\n' +
                // 'Number of options: ' + optionsArray.length + '\n' +
                // 'Random number picked: ' + randomNumber);
                var pickedNodeValue = optionsArray[randomNumber];
                createP(pickedNodeValue.innerText).parent(textContainer);
                //textContainer.appendChild(optionsArray[randomNumber]);
                currentPickedChar.push(pickedNodeValue.innerText.toString().trim());
            } else if (node.nodeName == 'SPAN') {
                var getEmoji =  EmojiTranslate.getAllEmojiForWord(word);
                if (getEmoji !== '') {
                    currentPickedChar.push(node.innerText.toString().trim());
                }
                textContainer.appendChild(node);
            }
            
        }, 500*(index+1));
    });
}

//*****************************************************************
//goes through all spoken words and parents them to the output
function displayWordsInOutput(words) {

}

function analyseSentiment(text){
    console.log('Do sentiment analysis for: ' +text);
    console.log('All words said: ' + allWords);
    console.log(text);

    // make the prediction
    var prediction = sentiment.predict(text.join(' '));
    console.log(prediction);
    var positivePercentage = Math.round(prediction.score * 100);
    // display sentiment result on html page
    sentimentResult.html('sentiment score: ' + prediction.score + ' ' + positivePercentage + '%');
    negativePercent.style.left = positivePercentage+'%';
    console.log(negativePercent.style.left);

    var negativePercentage = 100 - positivePercentage;
    animatePercentage(positivePercentage, positive);
    animatePercentage(negativePercentage, negative);
}

function analyseEmojiSentiment(char) {
    var emoji = loadJSON('libraries/emojiWithScore.json', fileLoaded);
    var positiveEmojiPercentage, negativeEmojiPercentage;
    
    function fileLoaded() {
        console.log('Json file loaded!');
        
        console.log('------- emoji sentiment ------');
        console.log(char.toString().trim());

        for (let e in emoji) {
            if (emoji[e].char == char.toString().trim() ) {
                console.log(emoji[e].score);
                score += Number(emoji[e].score);
            }
        }

        positiveEmojiPercentage = Math.round((score / allPickedChar.length) * 100);
        negativeEmojiPercentage = 100 - positiveEmojiPercentage;

        animatePercentage(positiveEmojiPercentage, positive);
        animatePercentage(negativeEmojiPercentage, negative);

        console.log('Positive percentage: ' + positiveEmojiPercentage);
        console.log('Negative percentage: ' + negativeEmojiPercentage);
        emojiSentimentResult.html('emoji sentiment score: ' + score + ' comparative: ' + score / allPickedChar.length + ' ' + Math.round((score / allPickedChar.length) * 100) + '%');
    }
}

//*****************************************************************
//used to get the list of emojis to be scored
function remakeList() {
    var list = loadJSON('libraries/emojiWithScore.json', testListLoaded);
    var emojiToBeRatedList = [];

    function testListLoaded() {
        console.log('Loaded list: ', list);
        console.log(list.coffee.keywords);

        for (let i in list) {
            emojiToBeRatedList.push(list[i].char);
            //console.log(i);
        }

        console.log(emojiToBeRatedList);
        //console.log(emojiToBeRatedList);
        createP(emojiToBeRatedList).parent(textContainer);
    }

}

//*****************************************************************
//used to get the score from our excel sheet JSON to the JSON we are actually using
function scoreTheList() {
    console.log('SCORE THE LIST');
    var toBeScoredList = loadJSON('libraries/test/toBeScoredTest.json', toBeScoredListLoaded); //change to emojiWithScore
    var scoreList;

    function toBeScoredListLoaded() {
        scoreList = loadJSON('libraries/test/score.json', scoreListLoaded);
    }

    function scoreListLoaded() {
        console.log('Both lists are loaded');
        console.log(toBeScoredList);
        console.log(scoreList);

        var scoreListArray = Object.keys(scoreList).map(key => {
            return scoreList[key];
        });
        var toBeScoredListArray = Object.entries(toBeScoredList).map((e) => ( { [e[0]]: e[1] } ));
        //loop through new score - for each find an equivalent in the emoji list and put the new score in
        scoreListArray.forEach((scoreItem, index) => {
            // console.log(scoreItem.emoji.toString());
            // console.log(scoreItem.score.toString());
            var emojiScore = scoreItem.emoji;
            var newScore = scoreItem.score.toString();

            toBeScoredListArray.forEach((emoji, index) => {
                for (var i in emoji) {
                    if (i == emojiScore) {
                        // console.log(i);
                        emoji.score = newScore;
                        // console.log(emoji);
                    }
                };
            });
        });

        //NEW LIST
        console.log(toBeScoredListArray);
    };
};

//*****************************************************************
//Callback for loading the data model for ml5 library 
function modelReady() {
    // model is ready
    console.log('ML5 MODEL LOADED');
    startBtn.disabled = false;
    stopBtn.disabled = false;
    restartBtn.disabled = false;
}

function animatePercentage(finalNumber, element) {
    var $this = element;
    jQuery({ Counter: $this.text()}).animate({ Counter: finalNumber }, {
        duration: 4000,
        easing: 'swing',
        step: function () {
        if (finalNumber > 50) {
            $this.text(Math.ceil(this.Counter));
        } else if (finalNumber <= 50) {
            $this.text(Math.floor(this.Counter));
        }
        }
    });
}

//*****************************************************************
//called when <select> is changed, to toggle visibility of elements 
function toggle(value) {
    state = value;
    console.log(state);
    switch (value) {
        case 'intro':
            introContainer.classList.add('active');
            introContainer.classList.remove('hide');
            textContainer.classList.remove('active');
            ratingContainer.classList.remove('active');
            binsContainer.classList.remove('active');
            break;
        case 'text':
            introContainer.classList.remove('active');
            introContainer.classList.add('hide');
            textContainer.classList.add('active');
            ratingContainer.classList.add('active');
            binsContainer.classList.remove('active');
            break;
        case 'bins':
            introContainer.classList.remove('active');
            introContainer.classList.add('hide');
            textContainer.classList.remove('active');
            ratingContainer.classList.add('active');
            binsContainer.classList.add('active');
            break;
    }
}

function isElement(element) {
    // works on major browsers back to IE7
    return element instanceof Element || element instanceof HTMLDocument;  
}