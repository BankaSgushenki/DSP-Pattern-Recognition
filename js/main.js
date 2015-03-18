patternRecognizer.loadImage('images/P0001468.jpg');


function showOriginalImage() { 
		 patternRecognizer.ctx.drawImage(patternRecognizer.originalImage, 0, 0); 
	}

function showBinaryzedPixels() { 
		patternRecognizer.ctx.putImageData(patternRecognizer.binaryzedPixels, 0, 0);
	}

function showResultImage() { 
		 patternRecognizer.ctx.putImageData(patternRecognizer.resultImage, 0, 0);
	}

 function key(photo) {
 		var str = "images/P00014" + photo + ".jpg";
 		patternRecognizer.loadImage(str);
	}
