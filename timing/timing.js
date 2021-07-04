(function(root) {
    var twoBytesStr = "";
    twoBytesStr += '\u2e80-\u2eff\u3000-\u30ff\u3300-\u4dbf\u4e00-\u9fff\uac00-\ud7af\uf900-\ufaff\ufe30-\ufe4f';
    var TWOBYTES = new RegExp('[' + twoBytesStr + ']');
    var VALIDCHART = /[_\-~\/\\<=>]/;
    var HIGH = 'H';
    var LOW = 'L';

    function createQuadro(inputString) {
        var input = inputString.split(/\r\n|\r|\n/),
            cellMatrix = [],
            maxLength = 0,
            i,
            j,
            y,
            me;

        for(i = 0; i < input.length; i++) {
            maxLength = maxLength < input[i].length ? input[i].length : maxLength;
        }

        for(i = 0; i < input.length; i++) {
            cellMatrix[i] = [];
            for(j = y = 0; j < maxLength; j++, y++) {
                cellMatrix[i][y] = {
                    ch: j < input[i].length ? input[i].charAt(j) : ' '
                };
                if(j < input[i].length && TWOBYTES.test(input[i].charAt(j))) {
                    cellMatrix[i][y + 1] = {
                        ch: ""
                    };
                    y++;
                }
            }
        }

        me = {
            getSizeX: function() {
                return maxLength;
            },

            getSizeY: function() {
                return cellMatrix.length;
            },

            getHorizontalStrings: function() {
                var result = [],
                    i,
                    j;

                for(i = 0; i < cellMatrix.length; i++) {
                    result[i] = "";
                    for(j = 0; j < maxLength; j++) {
                        result[i] += cellMatrix[i][j].ch;
                    }
                }
                return result;
            },

            getVerticalStrings: function() {
                var result = [],
                    i,
                    j;

                for(j = 0; j < maxLength; j++) {
                    result[j] = "";
                }

                for(i = 0; i < cellMatrix.length; i++) {
                    for(j = 0; j < maxLength; j++) {
                        result[j] += cellMatrix[i][j].ch;
                    }
                }
                return result;
            },

            getXY: function(x, y) {
                return cellMatrix[y][x].ch;
            },

            getProperty: function(x, y, name) {
                return cellMatrix[y][x][name];
            },

            setProperty: function(x, y, name, value) {
                cellMatrix[y][x][name] = value;
            }
        };
        return me;
    }

    function svg(width, height, elements) {
        return function() {
            var i,
                element = "";

            for(i = 0; i < elements.length; i++) {
                element += elements[i]() + "\n";
            }
            return '<svg width="' + width + '" height="' + height + '" xmlns="http://www.w3.org/2000/svg">\n' +
                element +
                "</svg>";
        };
    }

    function rect(x, y, width, height) {
        return function() {
            return '<rect x="' + x + '" y="' + y + '" width="' + width + '" height="' + height + '" style="stroke:black; fill:none" />';
        };
    }

    function line(x1, y1, x2, y2, style) {
        return function() {
            return '<line x1="' + x1 + '" x2="' + x2 + '" y1="' + y1 + '" y2="' + y2 + '" stroke="black" style="' + style + '"/>';
        };
    }

    function text(x, y, size, font, text) {
        return function() {
            return '<text x="' + x + '" y="' + y +'" font-size="' + size + '" font-family="' + font + '">' + text + '</text>';
        }
    }

    function arrow(x, y, size, direction) {
        return function() {
            if(direction === "down") {
                return '<path d="M ' + x + ' ' + y + ' l -' + (size / 2) + ' -' + size + ' l ' + size + ' 0 Z" />';
            } else if(direction === "up") {
                return '<path d="M ' + x + ' ' + y + ' l -' + (size / 2) + ' ' + size + ' l ' + size + ' 0 Z" />';
            } else if(direction === "left") {
                return '<path d="M ' + x + ' ' + y + ' l ' + size + ' -' + (size / 2) + ' l 0 ' + size + ' Z" />';
            } else if(direction === "right") {
                return '<path d="M ' + x + ' ' + y + ' l -' + size + ' -' + (size / 2) + ' l 0 ' + size + ' Z" />';
            }
        }
    }

    function drawSvg(quadro, option) {
        var i,
            j,
            opt = opt ? opt : {},
            optLineX = opt.lineX ? opt.lineX : 8,
            optLineY = opt.lineY ? opt.lineY : 8,
            optSizeY = opt.lineX ? opt.sizeY : 16,
            optborder = opt.border ? opt.border : 8,
            timingX,
            timingYArray,
            elements = [];

        function searchTiming() {
            var i,
                j;

            outer: for(i = 0; i < quadro.getSizeX() - 1; i++) {
                timingYArray = [];
                for(j = 0; j < quadro.getSizeY(); j++) {
                    if(quadro.getXY(i, j) === ' ' && quadro.getXY(i + 1, j) === ' ') {
                        continue;
                    } else if(quadro.getXY(i, j) === ' ' && VALIDCHART.test(quadro.getXY(i + 1, j))) {
                        timingYArray.push(j);
                    } else {
                        continue outer;
                    }
                }
                timingX = i + 1;
                return;
            }
            throw new Error("Cannot find timing chart");
        }

        function drawChart(x, y) {
            var i,
                ch,
                level = LOW;

            for(i = x; i < quadro.getSizeX(); i++) {
                ch = quadro.getXY(i, y);
                if(ch === ' ') {
                    if(level === HIGH) {
                        elements.push(line(i * optLineX, (y + 1) * optSizeY - optLineY, i * optLineX, (y + 1) * optSizeY, ""));
                    }
                    return;
                } else if(/[\-~]/.test(ch)) {
                    if(level === LOW) {
                        elements.push(line(i * optLineX, (y + 1) * optSizeY, i * optLineX, (y + 1) * optSizeY - optLineY, ""));
                    }
                    elements.push(line(i * optLineX,
                        (y + 1) * optSizeY - optLineY,
                        (i + 1) * optLineX,
                        (y + 1) * optSizeY - optLineY, ""));
                    level = HIGH;
                } else if(/[_]/.test(ch)) {
                    if(level === HIGH) {
                        elements.push(line(i * optLineX, (y + 1) * optSizeY - optLineY, i * optLineX, (y + 1) * optSizeY, ""));
                    }
                    elements.push(line(i * optLineX, (y + 1) * optSizeY, (i + 1) * optLineX, (y + 1) * optSizeY, ""));
                    level = LOW;
                }
            }
        }

        searchTiming();
        for(i = 0; i < timingYArray.length; i++) {
            drawChart(timingX, timingYArray[i]);
        }
        return svg(optborder * 2 + quadro.getSizeX() * optLineX, optborder * 2 + quadro.getSizeY() * optSizeY, elements);
    }

    function timing(input, option) {
        return drawSvg(createQuadro(input), option);
    }

    if(typeof module !== "undefined" && module.exports) {
        module.exports = timing;
    } else {
        root["Timing"] = timing;
    }
})(this);

