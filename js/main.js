
var patternRecognizer = {}

patternRecognizer.ctx = document.getElementById('canvas').getContext('2d');

patternRecognizer.width = 0;
patternRecognizer.height = 0;

patternRecognizer.extendedPixels = function(pixels) {
    //**** Additional functions ****//
    pixels.getColor = function(x,y) {
        return this.data[(x + y*this.width)*4];
    };
    pixels.setColor = function(x,y,color) {
        this.data[(x + y*this.width)*4] = color.r;
        this.data[(x + y*this.width)*4 + 1] = color.g;
        this.data[(x + y*this.width)*4 + 2] = color.b;
    };
    /*pixels.leftIsTheSame = function(x,y) {

    };
    pixels.rightIsTheSame = function(x,y) {

    };
    pixels.upperIsTheSame = function(x,y) {

    };
    pixels.lowerIsTheSame = function(x,y) {

    };*/
    return pixels;
};

patternRecognizer.RGB = function(r,g,b) {
    this.r = r;
    this.g = g;
    this.b = b;
};

patternRecognizer.loadImage = function(src) {
    var self = this;
    var img = new Image();
    img.src = src;
    img.onload = function() {
        self.width = self.ctx.canvas.width = img.width;
        self.height = self.ctx.canvas.height = img.height;
        self.ctx.drawImage(img, 0, 0);
        self.binaryzedPixels = patternRecognizer.extendedPixels(self.threshold(128));
        self.searchForObjects();
    };
};

patternRecognizer.getPixels = function() {
    return this.ctx.getImageData(0, 0, this.width, this.height);
};

patternRecognizer.threshold = function(threshold) {
    var pixels = this.getPixels();
    var d = pixels.data;
    for (var i=0; i<d.length; i+=4) {
        var r = d[i];
        var g = d[i+1];
        var b = d[i+2];
        var v = (0.2126*r + 0.7152*g + 0.0722*b >= threshold) ? 255 : 0;
        d[i] = d[i+1] = d[i+2] = v;
    }
    return pixels;
};

patternRecognizer.searchForObjects = function() {
    var pixels = this.binaryzedPixels;
    for (i = 0; i < pixels.height; j++)
        for(j = 0; j < pixels.width; j ++) {
            if(pixels.getColor(j, i) === 0) {
                pixels.setColor(j,i, new patternRecognizer.RGB(255,0,0));
            }
        }
     this.ctx.putImageData(pixels, 0, 0);
};


patternRecognizer.loadImage('images/P0001471.jpg');