var words = [];
function setup() {
    noCanvas();
    let lang = navigator.language || 'en-US';
    let speechRec = new p5.SpeechRec(lang, gotSpeech);
    let continous = true;
    let interim = false;
    let output = document.querySelector('.output');
    let startBtn = document.querySelector('#start');
    let stopBtn = document.querySelector('#stop');

    startBtn.addEventListener('click', startListening);
    stopBtn.addEventListener('click', stopListening);

    function startListening() {
        speechRec.start(continous, interim);
    }

    function stopListening() {
        speechRec.stop();
    }
    
    function gotSpeech() {
        
        console.log(speechRec);
        if ( speechRec.resultValue) {
            words = speechRec.resultString.split(" ");
            
            words.forEach((word, index) => {
                setTimeout(function(){
                    var node = EmojiTranslate.translateForDisplay(words[index]);
                    if (node.nodeName == 'SELECT') {
                        console.log('This is a select node');
                        var optionsArray = node.childNodes;
                        var randomNumber = Math.floor(Math.random() * ((optionsArray.length-1) - 0) + 0);
                        console.log('These are the options in it:');
                        console.log(optionsArray);
                        console.log(randomNumber);
                        var pickedNodeValue = optionsArray[randomNumber];
                        console.log(pickedNodeValue);
                        createP(pickedNodeValue.innerText).parent(output);
                        //output.appendChild(optionsArray[randomNumber]);
                    } else if (node) {
                        output.appendChild(node);
                    }
                    console.log(node);
                }, 500*(index+1));
            });
        }
        console.log(words);
    }
}

function draw() {

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