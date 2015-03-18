var patternRecognizer = {}
patternRecognizer.ctx = document.getElementById('canvas').getContext('2d');
patternRecognizer.width = patternRecognizer.height = 0;
patternRecognizer.areasNumber = 1;

patternRecognizer.extendedPixels = function(pixels) {
    pixels.getColor = function(x,y) {
        return this.data[(x + y*this.width)*4];
    };
    pixels.setColor = function(x,y,color) {
        this.data[(x + y*this.width)*4] = color.r;
        this.data[(x + y*this.width)*4 + 1] = color.g;
        this.data[(x + y*this.width)*4 + 2] = color.b;
    };
    pixels.leftPixelIsBlack = function(x,y) {
        return !this.data[(x-1 + y*this.width)*4];
    };
    pixels.upperPixelIsBlack = function(x,y) {
        return !this.data[(x + (y-1)*this.width)*4];
    }
    return pixels;
};

patternRecognizer.areaMap = {
    field: [],

    spaces: [],

    init: function() {
        for (var i = 0; i < patternRecognizer.width; i++) {
            this.field[i] = [];
            for(var j = 0; j < patternRecognizer.height; j++) {
                this.field[i][j] = 0;
            }
        }

        for(var j = 0; j < 10000; j++) {
            this.spaces[j] = 0;
        }
    },

    setArea: function (x,y,areasCounter) {
        this.field[x][y] = areasCounter;
    },

    getArea: function (x,y) {
        return this.field[x][y];
    },
};

patternRecognizer.RGB = function(r,g,b) {
    this.r = r;
    this.g = g;
    this.b = b;
};

patternRecognizer.loadImage = function(src) {
    var self = this;
    this.originalImage = new Image();
    this.originalImage.src = src;
    this.originalImage.onload = function() {
        self.width = self.ctx.canvas.width = self.originalImage.width;
        self.height = self.ctx.canvas.height = self.originalImage.height;
        self.ctx.drawImage(self.originalImage, 0, 0);
        self.binaryzedPixels = patternRecognizer.extendedPixels(self.threshold(180));
        self.searchForObjects();
        self.paintAreas();
    };
};

patternRecognizer.getPixels = function() {
    return this.ctx.getImageData(0, 0, this.width, this.height);
};

patternRecognizer.threshold = function(threshold) {
    var pixels = this.getPixels();
    for (var i=0; i<pixels.data.length; i+=4) {
        var r = pixels.data[i],
            g = pixels.data[i+1],
            b = pixels.data[i+2];
        var v = (0.2126*r + 0.7152*g + 0.0722*b >= threshold) ? 255 : 0;
        pixels.data[i] = pixels.data[i+1] = pixels.data[i+2] = v;
    }
    return pixels;
};

patternRecognizer.searchForObjects = function() {
    var pixels = this.binaryzedPixels;
    this.areas = [];
    this.areaMap.init();
    for (y = 1; y < pixels.height; y++)
        for(x = 1; x < pixels.width; x++) {
            if(pixels.getColor(x, y) !== 0) {
                if(this.areaMap.getArea(x,y-1) != this.areaMap.getArea(x-1,y)) {
                    area = this.areaMap.getArea(x,y-1);
                    if (area != 0) {
                        this.areaMap.setArea(x,y,area);
                        this.areaMap.spaces[area] ++;
                        for(i = 0; i < 50; i++) {
                            if (this.areaMap.getArea(x - i,y) === 0) break;
                            this.areaMap.setArea(x-i,y,area);
                        }
                        continue;
                    }
                }
                if(!pixels.leftPixelIsBlack(x,y)) {
                    area = this.areaMap.getArea(x-1,y);
                    this.areaMap.setArea(x,y,area);
                    this.areaMap.spaces[area] ++;
                    continue;
                }
                if(!pixels.upperPixelIsBlack(x,y)) {
                    area = this.areaMap.getArea(x,y-1);
                    this.areaMap.setArea(x,y,area);
                    this.areaMap.spaces[area] ++;
                    continue;
                }
                this.areaMap.setArea(x,y,this.areasNumber);
                this.areaMap.spaces[this.areasNumber] ++;
                this.areasNumber++;
        }
    }
    console.log(this.areaMap.spaces);
}

patternRecognizer.getAreaParametres = function(areaNumber) {
    var space = 0;
    for (y = 0; y < this.height; y++)
        for(x = 0; x < this.width; x++) {
            if (this.areaMap.getArea(x,y) == areaNumber) space ++;
        }
    return space;
}

patternRecognizer.paintAreas = function() {
    this.resultImage = this.extendedPixels(this.getPixels());
    var spoons = [], sugar = [],
        spoonColor = new this.RGB(105, 211, 243),
        sugarColor = new this.RGB(133, 243, 105);

    for(var i = 1; i < this.areasNumber; i++) { 
        // var space = this.getAreaParametres(i);
        var space = this.areaMap.spaces[i];
        if (space > 100) {
            if (space > 2000) spoons.push(i);
            else sugar.push(i);
        }
    }

    for (y = 0; y < this.height; y++)
        for(x = 0; x < this.width; x++) {
            var area = this.areaMap.getArea(x,y);
            if (area !== 0) {
                if (spoons.indexOf(area) >= 0) this.resultImage.setColor(x, y, spoonColor);
                if (sugar.indexOf(area) >= 0) this.resultImage.setColor(x, y, sugarColor);
            }
        }
}