var words = [];
var allWords = [];
let sentiment;
let sentimentResult;
let newModel;
var negativePercent = document.querySelector('.negativePercent');
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

    startBtn.addEventListener('click', startListening);
    stopBtn.addEventListener('click', stopListening);

    newModel = ml5.neuralNetwork();
    sentiment = ml5.sentiment('movieReviews', modelReady);
    sentimentResult = createP('sentiment score:').parent(output);
    sentimentResult.addClass('sentimentScore');

    function startListening() {
        speechRec.start(continous, interim);
    }

    function stopListening() {
        speechRec.stop();
    }
    
    function gotSpeech() {
        console.log('**************************************');
        console.log(speechRec.resultString);

        if (speechRec.resultValue) {
            words = speechRec.resultString.split(" ");
        
            console.log('Words: ' + words);
            var counter = words.length;
            words.forEach((word, index) => {
                setTimeout(function(){
                    var node = EmojiTranslate.translateForDisplay(words[index]);
                    if (node.nodeName == 'SELECT') {
                        var optionsArray = node.childNodes;
                        var randomNumber = Math.floor(Math.random() * ((optionsArray.length - 1) - 0) + 0);
                        console.log('Word: ' + word + '\n' +
                        'Number of options: ' + optionsArray.length + '\n' +
                        'Random number picked: ' + randomNumber);
                        var pickedNodeValue = optionsArray[randomNumber];
                        createP(pickedNodeValue.innerText).parent(output);
                        //output.appendChild(optionsArray[randomNumber]);
                    } else if (node) {
                        console.log('Word: ' + word);
                        output.appendChild(node);
                    }
                    
                    counter -= 1;
                    if (counter === 0){
                        allWords.push(words);
                        analyseSentiment(words);
                    }
                    
                }, 500*(index+1));
            });
            
        }
        
    }
}

function analyseSentiment(text){
    console.log('Do sentiment analysis for: ' +text);

    // make the prediction
    var prediction = sentiment.predict(text.join(' '));
    console.log(prediction);
    var positivePercentage = Math.round(prediction.score * 100);
    // display sentiment result on html page
    sentimentResult.html('Sentiment score: ' + prediction.score + ' ' + positivePercentage + '%');
    negativePercent.style.left = positivePercentage+'%';
    console.log(negativePercent.style.left);

    var positive = jQuery('.positiveNumber');
    var negative = jQuery('.negativeNumber');
    var negativePercentage = 100 - positivePercentage;
    animatePercentage(positivePercentage, positive);
    animatePercentage(negativePercentage, negative);
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