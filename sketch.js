// let button = document.querySelector(".color");
// let text = document.querySelector("h5");

// var c1 = "#65d2a9";
// button.style.background = c1;

// button.addEventListener("click", () => {
//   text.classList.add("disappear");
//   button.classList.add("grow");
// });


// button.addEventListener("animationend", () => {
//   if(button.classList.contains("grow")) {
//     document.body.style.background = button.style.background;
//     button.classList.remove("grow");
//     button.style.background = "hsl(" + 360 * Math.random() + ',' +
//     (25 + 70 * Math.random()) + '%,' + 
//     (85 + 10 * Math.random()) + '%)';
//   }
// });

// text.addEventListener("animationend", () => {text.remove();});
var words = [];
function setup() {
	// createCanvas(windowWidth, windowHeight);
    noCanvas();
    let lang = navigator.language || 'en-US';
    let speechRec = new p5.SpeechRec(lang, gotSpeech);
    let continuous = true;
    let interim = false;
    
    speechRec.start(continuous, interim);

    function gotSpeech() {
        
        if ( speechRec.resultValue) {
            createP(speechRec.resultString);
        }
        words = speechRec.resultString.split(" ");

        
        words.forEach((word, index) => {
            console.log(word);
            console.log(getTextWidth(word, "bold 14pt arial"));
            //animate the word falling - calculate
        });
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

//console.log(getTextWidth("hello there!", "bold 12pt arial"));  // close to 86


function positionText() {
    //will calculate the end position of text
}