var patternRecognizer = {}
patternRecognizer.ctx = document.getElementById('canvas').getContext('2d');
patternRecognizer.width = patternRecognizer.height = 0;
patternRecognizer.areasNumber = 1;

Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

Array.prototype.min = function() {
  return Math.min.apply(null, this);
};

patternRecognizer.extendedPixels = function(pixels) {
    pixels.getColor = function(x,y) {
        return {
            r :this.data[(x + y*this.width)*4],
            g :this.data[(x + y*this.width)*4 + 1], 
            b :this.data[(x + y*this.width)*4 + 2], 
        };
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

patternRecognizer.randomRGB = function() {
    var m = 0;
    var n = 255;
    this.r = Math.floor( Math.random() * (n - m + 1) ) + m;
    this.g = Math.floor( Math.random() * (n - m + 1) ) + m;
    this.b = Math.floor( Math.random() * (n - m + 1) ) + m;
};

patternRecognizer.loadImage = function(src) {
    var self = this;
    this.originalImage = new Image();
    this.originalImage.src = src;
    this.originalImage.onload = function() {
        var d = new Date();
        self.startTime = d.getTime();
        self.width = self.ctx.canvas.width = self.originalImage.width;
        self.height = self.ctx.canvas.height = self.originalImage.height;
        self.ctx.drawImage(self.originalImage, 0, 0);
        setTimeout(self.start,10);
    };
};

patternRecognizer.start = function() {
    patternRecognizer.binaryzedPixels = patternRecognizer.minFilter();
    patternRecognizer.binaryzedPixels = patternRecognizer.threshold(190);
    patternRecognizer.searchForObjects();
    patternRecognizer.paintAreas();
}

patternRecognizer.getPixels = function() {
    return this.ctx.getImageData(0, 0, this.width, this.height);
};

patternRecognizer.threshold = function(threshold) {
    var pixels = this.binaryzedPixels;
    for (var i=0; i<pixels.data.length; i+=4) {
        var r = pixels.data[i],
            g = pixels.data[i+1],
            b = pixels.data[i+2];
        var v = (0.2126*r + 0.7152*g + 0.0722*b >= threshold) ? 255 : 0;
        pixels.data[i] = pixels.data[i+1] = pixels.data[i+2] = v;
    }
    return pixels;
};

patternRecognizer.minFilter = function() {
    var pixels = patternRecognizer.extendedPixels(patternRecognizer.getPixels());;
    for (y = 2; y < pixels.height - 2; y+=3) {
        for(x = 2; x < pixels.width - 2; x+=3) {
            var red = 256, green= 256, blue = 256;
            for(i = -1; i < 2; i ++) {
                for(j = -1; j < 2; j ++) {
                    if (red > pixels.getColor(x+i,y+j).r) red = pixels.getColor(x+i,y+j).r;
                    if (green > pixels.getColor(x+i,y+j).g) green = pixels.getColor(x+i,y+j).g;
                    if (blue > pixels.getColor(x+i,y+j).b) blue = pixels.getColor(x+i,y+j).b;
                }
            }
             for(i = -1; i < 2; i ++) {
                for(j = -1; j < 2; j ++) {
                    pixels.setColor(x+i,y+j, new this.RGB(red,green,blue));
                }
            }
        }
    }
    return pixels;

}

patternRecognizer.searchForObjects = function() {
    var pixels = this.binaryzedPixels;
    this.areaMap.init();
    this.areasNumber = 0;
    for (y = 1; y < pixels.height; y++)
        for(x = 1; x < pixels.width; x++) {
            if(pixels.getColor(x, y).r !== 0) {
                if(this.areaMap.getArea(x,y-1) != this.areaMap.getArea(x-1,y)) {
                    area = this.areaMap.getArea(x,y-1);
                    currentArea = this.areaMap.getArea(x-1,y);
                    if (area != 0 && currentArea != 0) {
                        this.areaMap.setArea(x,y,area);
                        this.areaMap.spaces[area] ++;

                        var top = (y < 200) ? 0 : y - 200;
                        var right = (x > this.width - 50) ? this.width : x + 50;
                        var left = (x < 200) ? 0 : x - 200;

                        for (j = top; j < y + 1; j++)
                            for(i = left; i < right; i++) {
                                if (this.areaMap.getArea(i, j) === currentArea) {
                                    this.areaMap.setArea(i, j, area);
                                    this.areaMap.spaces[area] ++;
                                }
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
}

patternRecognizer.getTopCoordinate = function(areaNumber) {
    for (y = 0; y < this.height; y++)
        for(x = 0; x < this.width; x++)
            if(this.areaMap.getArea(x,y) === areaNumber) {
                return {'x':x, 'y':y};
            }
}

patternRecognizer.getBottomCoordinate = function(areaNumber) {
    for (y = this.height; y > 0; y--)
        for(x = 0; x < this.width; x++)
            if(this.areaMap.getArea(x,y) === areaNumber) {
                return {'x':x, 'y':y};
            }
}

patternRecognizer.getLeftCoordinate = function(areaNumber) {
    for (x = 0; x < this.width; x++)
        for (y = 0; y < this.height; y++)
            if(this.areaMap.getArea(x,y) === areaNumber) {
                return {'x':x, 'y':y};
            }
}

patternRecognizer.getRightCoordinate = function(areaNumber) {
    for (x = this.width - 1; x > 0; x--)
        for (y = 0; y < this.height; y++)
            if(this.areaMap.getArea(x,y) === areaNumber) {
                return {'x':x, 'y':y};
            }
}

patternRecognizer.getDistance = function(A,B) {
    return Math.sqrt(Math.pow((B.x - A.x),2) + Math.pow((B.y - A.y),2));
}

patternRecognizer.paintAreas = function() {
    this.resultImage = this.extendedPixels(this.getPixels());
    var randomColors = [], areas = [],
        colors = {'spoon' : new this.RGB(105, 211, 243), 'sugar': new this.RGB(133, 243, 105)};

    for(var i = 1; i < this.areasNumber; i++) { 
        var space = this.areaMap.spaces[i];
        randomColors[i] = new this.randomRGB();
        if (space > 500) {
            var area = {};
            area.distances = [];
            area.space = space;
            area.type = null;
            area.top = this.getTopCoordinate(i);
            area.bottom = this.getBottomCoordinate(i);
            area.left = this.getLeftCoordinate(i);
            area.right = this.getRightCoordinate(i);
            if(typeof area.right != 'undefined') {
                area.distances[0] = this.getDistance(area.top, area.left);
                area.distances[1] = this.getDistance(area.left, area.bottom);
                area.distances[2] = this.getDistance(area.bottom, area.right);
                area.distances[3] = this.getDistance(area.right, area.top);
                area.distances.sort(function(a, b) {return a - b});
                area.elongation = (area.distances[2] + area.distances[3])/(area.distances[0] + area.distances[1]);
            }

            if (area.elongation > 0.7 && area.elongation < 2.6 && space < 1310 && area.distances.max() < 60) {
                area.type = 'sugar';
            }
            if (area.elongation > 2 && area.elongation < 20 && space > 1300 && 
                space < 5000 &&  area.distances.max() > 130 &&  area.distances.max() < 250) {
                    area.type = 'spoon';
            }
            areas[i] = area;
        }
    }

    for (y = 0; y < this.height; y++)
        for(x = 0; x < this.width; x++) {
            var number = this.areaMap.getArea(x,y);
            if (areas[number] && areas[number].type) 
                this.resultImage.setColor(x, y, colors[areas[number].type]);
        }
    var d = new Date();
    this.endTime = d.getTime();
    console.log(this.endTime - this.startTime,' ms');
}