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

function draw() {

}

function analyseSentiment(text){
    console.log('Do sentiment analysis for: ' +text);

    // make the prediction
    var prediction = sentiment.predict(text.join(' '));
    console.log(prediction);
    var percentage = Math.round(prediction.score * 100);
    // display sentiment result on html page
    sentimentResult.html('Sentiment score: ' + prediction.score + ' ' + percentage + '%');
    negativePercent.style.left = percentage+'%';
    console.log(negativePercent.style.left);
}

function modelReady() {
    // model is ready
    console.log('MODEL LOADED');
}

function getTextWidth(text, font) {
    // if given, use cached canvas for better performance
    // else, create new canvas
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    var context = canvas.getContext("2d");
    context.font = font;
    var metrics = context.measureText(text);
    //always round up so they are not on top of each other
    return Math.ceil(metrics.width + 5);
};


function positionText() {
    //will calculate the end position of text
}

function isElement(element) {
    // works on major browsers back to IE7
    return element instanceof Element || element instanceof HTMLDocument;  
  }