var words = [];
var allWords = [];
let sentiment;
let sentimentResult;
let emojiSentimentResult;
let newModel;
var score = 0;
var negativePercent = document.querySelector('.negativePercent');
var currentPickedChar = [];
var allPickedChar = [];
function setup() {
    noCanvas();
    let lang = navigator.language || 'en-US';
    let speechRec = new p5.SpeechRec(lang, gotSpeech);
    let continous = true;
    let interim = false;
    let output = document.querySelector('.output');
    let score = document.querySelector('#score');
    let startBtn = document.querySelector('#start');
    let stopBtn = document.querySelector('#stop');
    let restartBtn = document.querySelector('#restart');

    startBtn.addEventListener('click', startListening);
    stopBtn.addEventListener('click', stopListening);
    restartBtn.addEventListener('click', remakeList);

    newModel = ml5.neuralNetwork();
    sentiment = ml5.sentiment('movieReviews', modelReady);
    sentimentResult = createP('sentiment score:').parent(output);
    emojiSentimentResult = createP('emoji sentiment score:').parent(output);
    sentimentResult.addClass('sentimentScore');
    emojiSentimentResult.addClass('emojiSentimentScore');

    function startListening() {
        speechRec.start(continous, interim);
    }

    function stopListening() {
        speechRec.stop();
    }
    
    function gotSpeech() {
        console.log('NEW**************************************');

        if (speechRec.resultValue) {
            words = speechRec.resultString.split(/\W/);
        
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
                        createP(pickedNodeValue.innerText).parent(output);
                        //output.appendChild(optionsArray[randomNumber]);
                        currentPickedChar.push(pickedNodeValue.innerText);
                    } else if (node.nodeName == 'SPAN') {
                        var getEmoji =  EmojiTranslate.getAllEmojiForWord(word);
                        if (getEmoji !== '') {
                            currentPickedChar.push(node.innerText);
                        }
                        output.appendChild(node);
                    }

                    // ONLY ONCE
                    counter -= 1;
                    if (counter === 0){
                        allPickedChar.push(currentPickedChar);
                        console.log('Current characters: ' + currentPickedChar);
                        console.log('All characters: ' + allPickedChar);

                        allWords.push(words);
                        //analyseSentiment(words);
                        for ( let i in currentPickedChar ) {
                            analyseEmojiSentiment(currentPickedChar[i]);
                        }     
                        currentPickedChar = [];
                    }
                    
                }, 500*(index+1));
            });
            
        }
        
    }
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

    var positive = jQuery('.positiveNumber');
    var negative = jQuery('.negativeNumber');
    var negativePercentage = 100 - positivePercentage;
    animatePercentage(positivePercentage, positive);
    animatePercentage(negativePercentage, negative);
}

function analyseEmojiSentiment(char) {
    var emoji = loadJSON('libraries/emojiWithScore.json', fileLoaded);
    
    function fileLoaded() {
        console.log('Json file loaded!');
        
        console.log('------- emoji sentiment ------');
        console.log(char.toString().trim());
         //console.log(emoji);
         //console.log(test);
         //console.log(emoji.coffee);
         //console.log(test['coffee']);

        for (let e in emoji) {
            //WARNING: disgusting code
            if (emoji[e].char == char.toString().trim() ) {
                console.log(emoji[e].score);
                //console.log(emoji.emoji.score);
                score = emoji[e].score;
            }
        }
 
        // for (var i = 0; i < text.length; i++) {
        //     var word = text[i].toString();
        //     if (emoji.hasOwnProperty(text[i])) {
        //         console.log('Emoji matched: ' + word);
        //         console.log('Score is: '+ parseInt(emoji[word]["score"]));
        //         score += parseInt(emoji[word]["score"]);
        //     }
        // }
        emojiSentimentResult.html('emoji sentiment score: ' + score + ' comparative: ' + score / allPickedChar.length );
    }
}

function remakeList() {
    var list = loadJSON('libraries/emojiWithScore.json', testListLoaded);
    var keywords;

    function testListLoaded() {
        console.log('Loaded list: ', list);
        console.log(list.coffee.keywords);

        for (let i in list) {

            if (list[i].keywords.includes("espresso") ) {
                console.log(list[i].score);
                console.log(list.emoji.score);
            }
        }
        
    }

}

function modelReady() {
    // model is ready
    console.log('MODEL LOADED');
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

function isElement(element) {
    // works on major browsers back to IE7
    return element instanceof Element || element instanceof HTMLDocument;  
  }