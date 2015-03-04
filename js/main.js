
var patternRecognizer = {}

patternRecognizer.ctx = document.getElementById('canvas').getContext('2d');

patternRecognizer.width = 0;
patternRecognizer.height = 0;

patternRecognizer.randomNumber = function(m,n) {
    return Math.floor( Math.random() * (n - m + 1) ) + m;
}

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
    return pixels;
};

patternRecognizer.Area = function(areasCounter) {
    this.pixels = [];
    this.number = areasCounter;
    this.color = new patternRecognizer.randomRGB();
}

patternRecognizer.areaMap = {
    field: [],

    init: function() {
        for (var i = 0; i < patternRecognizer.width; i++) {
            this.field[i] = [];
            for(var j = 0; j < patternRecognizer.height; j++) {
                this.field[i][j] = -1;
            }
        }
    },

    note: function (x,y,areasCounter) {
        this.field[x][y] = areasCounter;
    },

    isFree: function (x,y) {
        return this.field[x][y];
    },
};

patternRecognizer.RGB = function(r,g,b) {
    this.r = r;
    this.g = g;
    this.b = b;
};

patternRecognizer.randomRGB = function() {
    var m = 0;
    var n = 255;
    this.r = Math.floor( Math.random() * (n - m + 1) ) + m;
    this.g = Math.floor( Math.random() * (n - m + 1) ) + m;
    this.b = Math.floor( Math.random() * (n - m + 1) ) + m;
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
        self.paintAreas();
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
    this.areas = [];
    var pixels = this.binaryzedPixels;
    var areasCounter = 0;
    this.areaMap.init();
    console.log(this.areaMap);
    for (i = 0; i < pixels.height; i++)
        for(j = 0; j < pixels.width; j++) {
            if(pixels.getColor(j, i) !== 0) {
                this.areaMap.note(j,i,areasCounter);
                if(pixels.getColor(j - 1, i) === 0 && pixels.getColor(j, i - 1) === 0) {
                    var currentArea = new this.Area(areasCounter);
                    currentArea.pixels.push({'x': j, 'y': i});
                    this.areas.push(currentArea);
                    areasCounter++;
                    this.areaMap.note(j,i,areasCounter);
                    // console.log(areasCounter);
                }
                if (pixels.getColor(j, i - 1) !== 0) {
                    var number = this.areaMap.isFree(j, i - 1);
                    if(number !== areasCounter) {
                        console.log(number);
                        this.areas[number].pixels.push({'x': j, 'y': i});
                    }
                    else {
                        this.areas[areasCounter - 1].pixels.push({'x': j, 'y': i});
                    }
                    continue;
                }
                if(pixels.getColor(j - 1, i) !== 0) {
                    this.areas[areasCounter - 1].pixels.push({'x': j, 'y': i});
                    continue;
                }
            }
        }
};

patternRecognizer.paintAreas = function() {
    var image = this.extendedPixels(this.getPixels());
    console.log(this.areas);
    this.areas.forEach(function(entry) {
        entry.pixels.forEach(function(pixel) {
            image.setColor(pixel.x, pixel.y, entry.color);
        })
    });
    this.ctx.putImageData(image, 0, 0);
}


patternRecognizer.loadImage('images/test.jpg');