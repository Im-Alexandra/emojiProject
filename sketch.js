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
var modelReadyB = false;

// ALL DOM ELEMENTS - CONTAINERS
var introContainer = document.querySelector('#intro');
var testContainer = document.querySelector('#test');
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
var positiveText = document.querySelector('.positive');
var negativeText = document.querySelector('.negative');
var positiveEmoji = document.querySelector('.positive2');
var negativeEmoji = document.querySelector('.negative2');
var checkbox = document.querySelector('#continuosCheckbox');
var speechEndNote = document.querySelector('#speechEndNote');

function setup() {
    noCanvas();
    let lang = navigator.language || 'en-US';
    let speechRec = new p5.SpeechRec(lang, gotSpeech);
    let continous = false;
    let interim = false;

    checkbox.addEventListener('click', function (e){
        continous = e.target.checked;
    });

    startBtn.addEventListener('click', startListening);
    restartBtn.addEventListener('click', restart);
    
    newModel = ml5.neuralNetwork();
    sentiment = ml5.sentiment('movieReviews', modelReady);

    sentimentResult = createP('sentiment score:').parent(testContainer);
    emojiSentimentResult = createP('emoji sentiment score:').parent(testContainer);
    sentimentResult.addClass('sentimentScore');
    emojiSentimentResult.addClass('emojiSentimentScore');

    function startListening() {
        speechRec.start(continous, interim);
        speechEndNote.classList.add('hide');
    }

    speechRec.onEnd = showEnd;
    function showEnd() {
        speechEndNote.classList.remove('hide');
    }

    function restart() {
        if (state == "text") {
            allWords = [];
            const textParent = document.getElementById("text")
            while (textParent.firstChild) {
                textParent.firstChild.remove()
            }
        } else if (state == "bins") {
            balls = [];
            allPickedChar = [];
        }
        
         //rating bar
         animatePercentage(50, positive);
         animatePercentage(50, negative);
         negativePercent.style.left = 50+'%';
    }
    
    function gotSpeech() {
        console.log('NEW SPEECH**************************************');
        if (speechRec.resultValue) {
            var words = speechRec.resultString.split(" ");
            
            switch (state) {
                case 'intro':
                    console.log('Intro mode - cant do anything with speech!');
                    break;

                case 'test':
                    //display emoji and words in output call text sentiment
                    displayEmojiInOutput(words);
                    break;

                case 'bins':
                    //display emoji in bins call emoji sentiment
                    var emojiArray = getEmojiFromWords(words);
                    animateScoredEmoji(emojiArray);
                    break;

                case 'text':
                    //display words
                    displayTextInOutput(words);
            }
        }
    }
}

//*****************************************************************
//goes trhough all spoken words, finds corresponding emoji and parents it to the output
//if there is no corresponding emoji it parents the text
function displayEmojiInOutput(words) {
    console.log('Words: ' + words);
    currentPickedChar = [];

    words.forEach((word, index) => {
        var getEmoji =  EmojiTranslate.getAllEmojiForWord(word);

        if (getEmoji !== '') {
            if (getEmoji.length > 1) {
                //MULTIPLE EMOJI OPTIONS
                var randomNumber = Math.floor(Math.random() * ((getEmoji.length - 1) - 0) + 0);
                currentPickedChar.push(getEmoji[randomNumber]);
                //createP(getEmoji[randomNumber].toString().trim()).parent(testContainer);
                console.log('multiple options for this word: ' + word );
                console.log('we are picking: ' + getEmoji[randomNumber]);
            } else {
                //ONLY 1 EMOJI OPTION
                currentPickedChar.push(getEmoji[0]);
                //createP(getEmoji[0].toString().trim()).parent(testContainer);
                console.log('only 1 option for this word: ' + word );
                console.log(getEmoji[0]);
            }
        } else {
            //NO EMOJI FOR THIS WORD
            console.log('This word: ' + word + ' has no emoji');
            //createP(word.toString().trim()).parent(testContainer);
        }
    });

    console.log('currentPickedChar: ');
    console.log(currentPickedChar);
    console.log(currentPickedChar[0]);
    
    console.log(allPickedChar);

    currentPickedChar.forEach((char, index) => {
        setTimeout(function(){
            createP(char.toString().trim()).parent(testContainer);
        }, 500*(index+1));
    });

    animateScoredEmoji(currentPickedChar);
}

//*****************************************************************
//goes trhough all spoken words, finds corresponding emoji and returns them in array
//if there is no corresponding emoji it ignores the word
function getEmojiFromWords(words) {
    var emojiToAnimate = [];
    words.forEach((word, index) => {
        var node = EmojiTranslate.translateForDisplay(words[index]);

        if (node.nodeName == 'SELECT') {
            var optionsArray = node.childNodes;
            var randomNumber = Math.floor(Math.random() * ((optionsArray.length - 1) - 0) + 0);
            var pickedNodeValue = optionsArray[randomNumber];
            emojiToAnimate.push(pickedNodeValue.innerText.toString().trim());
        } else if (node.nodeName == 'SPAN') {
            var getEmoji =  EmojiTranslate.getAllEmojiForWord(word);
            if (getEmoji !== '') {
                //its emoji
                emojiToAnimate.push(node.innerText.toString().trim());
            }
        }
    });

    return emojiToAnimate;
}

//*****************************************************************
//receives array of emoji -> turns it into an array of scored emoji and displays them
//in correspondig bins + calculates score
function animateScoredEmoji(emojis) {
    var scoredEmoji = [];
    var emojiList = loadJSON('libraries/emojiNewWithScore.json', fileLoaded);
    
    function fileLoaded() {
        console.log('------- emoji sentiment ------');

        emojis.forEach((emoji, index) => {
            for (let e in emojiList) {
                if (emojiList[e].char == emoji.toString().trim()) {
                    if (Math.sign(emojiList[e].score) === 1) {
                        score += Number(emojiList[e].score);
                    }
                    var newEmoji = {};
                    newEmoji["emoji"] = emojiList[e].char;
                    newEmoji["score"] = emojiList[e].score;
                    scoredEmoji.push(newEmoji);
                    allPickedChar.push(emojiList[e].char);
                }
            }
        });

        startBinAnimation(scoredEmoji);
        
        if (Math.sign(score) === 1) {
            positiveEmojiPercentage = limitNumberWithinRange (Math.round((100 / allPickedChar.length) * score), 0, 100);
            negativeEmojiPercentage = limitNumberWithinRange (Math.round((100 / allPickedChar.length) * (allPickedChar.length - score)), 0, 100);
        } else if (Math.sign(score) === -1) {
            negativeEmojiPercentage = limitNumberWithinRange (Math.round((100 / allPickedChar.length) * score), 0, 100);
            positiveEmojiPercentage = limitNumberWithinRange (Math.round((100 / allPickedChar.length) * (allPickedChar.length - score)), 0, 100);
        } else if (Math.sign(score) === 0) {
            negativeEmojiPercentage = 50;
            positiveEmojiPercentage = 50;
        }

        console.log("Score: " + score);
        console.log(allPickedChar);

        animatePercentage(positiveEmojiPercentage, positive);
        animatePercentage(negativeEmojiPercentage, negative);
        negativePercent.style.left = positiveEmojiPercentage+'%';

        console.log('Positive percentage: ' + positiveEmojiPercentage);
        console.log('Negative percentage: ' + negativeEmojiPercentage);
        emojiSentimentResult.html('emoji sentiment score: ' + score + ' allPickedChar lenghth: ' + allPickedChar.length + ' comparative: ' + score / allPickedChar.length + ' ' + Math.round((score / allPickedChar.length) * 100) + '%');
    }
}

function limitNumberWithinRange (num, min, max) {
    const MIN = min || 0;
    const MAX = max || 100;
    const parsed = parseInt(num);
    return Math.min(Math.max(parsed, MIN), MAX);
}


//*****************************************************************
//goes trhough all spoken words and prints them in the output
function displayTextInOutput(words) {
    var counter = words.length;

    words.forEach((word, index) => {
        setTimeout(function(){
            if (counter == words.length) {
                word = word.charAt(0).toUpperCase() + word.slice(1); ;
            }
            allWords.push(word);

            var addWord = createP(word).parent(textContainer);
            counter --;

            if (counter == 0) {
                addWord.addClass('lastWord');
                var dot = createP('.').parent(textContainer);
                //call analyse sentiment when all words are added to allWords array
                analyseSentiment(allWords);
            }
        }, 500*(index+1));
    });
};

function analyseSentiment(text){
    console.log('Do academic sentiment analysis for: ');
    console.log(text.join(' '));

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
};

function analyseEmojiSentiment(char) {
    var emoji = loadJSON('libraries/emojiNewWithScore.json', fileLoaded);
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

        console.log('HELLLOOOOOO');
        console.log(negativePercent);
        negativePercent.style.left = positiveEmojiPercentage+'%';
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
        createP(emojiToBeRatedList).parent(testContainer);
    }

}

//*****************************************************************
//used to get the score from our excel sheet JSON to the JSON we are actually using
function scoreTheList() {
    console.log('SCORE THE LIST');
    var toBeScoredList = loadJSON('libraries/emojiWithScore.json', toBeScoredListLoaded); //change to emojiWithScore
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
                        emoji[i].score = newScore;
                    }
                };
            });
        });

        //NEW LIST
        console.log(JSON.stringify(toBeScoredListArray));
    };
};

//*****************************************************************
//Callback for loading the data model for ml5 library 
function modelReady() {
    // model is ready
    console.log('ML5 MODEL LOADED');
    modelReadyB = true;
    if (state != 'intro') {
        startBtn.disabled = false;
        //stopBtn.disabled = false;
        restartBtn.disabled = false;
    };
}

//*****************************************************************
//to animate the percentage numbers change 
function animatePercentage(finalNumber, element) {
    var $this = element;
    //console.log(finalNumber, element);
    jQuery({ Counter: $this.text()}).animate({ Counter: finalNumber }, {
        duration: 4000,
        easing: 'swing',
        step: function () {
            $this.text(Math.round(this.Counter));
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
            testContainer.classList.remove('active');
            textContainer.classList.remove('active');
            ratingContainer.classList.remove('active');
            binsContainer.classList.remove('active');
            startBtn.disabled = true;
            restartBtn.disabled = true;
            controlsContainer.classList.remove('active');
            break;
        case 'test':
            introContainer.classList.remove('active');
            introContainer.classList.add('hide');
            testContainer.classList.add('active');
            textContainer.classList.remove('active');
            ratingContainer.classList.add('active');
            binsContainer.classList.remove('active');
            controlsContainer.classList.add('active');
            if (modelReadyB) {
                startBtn.disabled = false;
                restartBtn.disabled = false;
            };
            break;
        case 'bins':
            introContainer.classList.remove('active');
            introContainer.classList.add('hide');
            testContainer.classList.remove('active');
            textContainer.classList.remove('active');
            ratingContainer.classList.add('active');
            binsContainer.classList.add('active');
            controlsContainer.classList.add('active');

            positiveText.classList.add('hide');
            negativeText.classList.add('hide');
            positiveEmoji.classList.remove('hide');
            negativeEmoji.classList.remove('hide');

            //fix rating when toggling
            if (score) {
                animatePercentage(positiveEmojiPercentage, positive);
                animatePercentage(negativeEmojiPercentage, negative);
                negativePercent.style.left = positiveEmojiPercentage+'%';
            } else {
                animatePercentage(50, positive);
                animatePercentage(50, negative);
                negativePercent.style.left = 50+'%';
            }

            if (modelReadyB) {
                startBtn.disabled = false;
                restartBtn.disabled = false;
            };
            break;
        case 'text':
            introContainer.classList.remove('active');
            introContainer.classList.add('hide');
            testContainer.classList.remove('active');
            textContainer.classList.add('active');
            ratingContainer.classList.add('active');
            binsContainer.classList.remove('active');
            controlsContainer.classList.add('active');

            positiveText.classList.remove('hide');
            negativeText.classList.remove('hide');
            positiveEmoji.classList.add('hide');
            negativeEmoji.classList.add('hide');

            //fix rating when toggling
            if (allWords.length != 0) {
                analyseSentiment(allWords);
            } else {
                animatePercentage(50, positive);
                animatePercentage(50, negative);
                negativePercent.style.left = 50+'%';
            }
            
            if (modelReadyB) {
                startBtn.disabled = false;
                restartBtn.disabled = false;
            };
            break;
    }
};

function isElement(element) {
    // works on major browsers back to IE7
    return element instanceof Element || element instanceof HTMLDocument;  
}