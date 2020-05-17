(function(root) {
    function createQuadro(inputString) {
        var input = inputString.split(/\r\n|\r|\n/),
            cellMatrix = [],
            maxLength = 0,
            i,
            j,
            me;

        for(i = 0; i < input.length; i++) {
            maxLength = maxLength < input[i].length ? input[i].length : maxLength;
        }

        for(i = 0; i < input.length; i++) {
            cellMatrix[i] = [];
            for(j = 0; j < maxLength; j++) {
                cellMatrix[i][j] = {
                    ch: j < input[i].length ? input[i].charAt(j) : ' '
                };
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
            }
        };
        return me;
    }

    function parse(input) {
        var i,
            j,
            result = {},
            quadro = createQuadro(input),
            horizontal = quadro.getHorizontalStrings(),
            vertical = quadro.getVerticalStrings(),
            hPattern = /[\+][-\+]*[\+]/g,
            vPattern = /[\+][\|\+]*[\+]/g;

        result.horizontalLines = [];
        result.verticalLines = [];

        for(i = 0; i < horizontal.length; i++) {
            while(!!(matched = hPattern.exec(horizontal[i]))) {
                result.horizontalLines.push({
                    x1: matched.index,
                    x2: hPattern.lastIndex - 1,
                    y: i
                });
                hPattern.lastIndex--;
            }
        }

        for(i = 0; i < vertical.length; i++) {
            while(!!(matched = vPattern.exec(vertical[i]))) {
                result.verticalLines.push({
                    y1: matched.index,
                    y2: vPattern.lastIndex - 1,
                    x: i
                });
                vPattern.lastIndex--;
            }
        }

        result.sizeX = quadro.getSizeX();
        result.sizeY = quadro.getSizeY();
        return result;
    }

    function findBox(parsed) {
        var i,
            j,
            horizontalPair = [],
            verticalPair = [];

        parsed.boxes = [];
        for(i = 0; i < parsed.horizontalLines.length; i++) {
            for(j = 0; j < parsed.horizontalLines.length; j++) {
                if(i !== j) {
                    if(parsed.horizontalLines[i].x1 === parsed.horizontalLines[j].x1 &&
                            parsed.horizontalLines[i].x2 === parsed.horizontalLines[j].x2) {
                        horizontalPair.push({ i: i, j: j });
                        break;
                    }
                }
            }
        }

        for(i = 0; i < parsed.verticalLines.length; i++) {
            for(j = 0; j < parsed.verticalLines.length; j++) {
                if(i !== j) {
                    if(parsed.verticalLines[i].y1 === parsed.verticalLines[j].y1 &&
                            parsed.verticalLines[i].y2 === parsed.verticalLines[j].y2) {
                        verticalPair.push({ i: i, j: j });
                        break;
                    }
                }
            }
        }

        for(i = 0; i < horizontalPair.length; i++) {
            for(j = 0; j < verticalPair.length; j++) {
                if(!parsed.horizontalLines[horizontalPair[i].i].box &&
                        parsed.horizontalLines[horizontalPair[i].i].y === parsed.verticalLines[verticalPair[j].i].y1 &&
                        parsed.horizontalLines[horizontalPair[i].j].y === parsed.verticalLines[verticalPair[j].i].y2) {
                    parsed.boxes.push({
                        x1: parsed.horizontalLines[horizontalPair[i].i].x1,
                        x2: parsed.horizontalLines[horizontalPair[i].i].x2,
                        y1: parsed.verticalLines[verticalPair[j].i].y1,
                        y2: parsed.verticalLines[verticalPair[j].i].y2
                    });
                    parsed.horizontalLines[horizontalPair[i].i].box = true;
                    parsed.horizontalLines[horizontalPair[i].j].box = true;
                    parsed.verticalLines[verticalPair[j].i].box = true;
                    parsed.verticalLines[verticalPair[j].j].box = true;
                }
            }
        }
        return parsed;
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

    function line(x1, y1, x2, y2) {
        return function() {
            return '<line x1="' + x1 + '" x2="' + x2 + '" y1="' + y1 + '" y2="' + y2 + '" stroke="black" />';
        };
    }

    function drawSvg(input, option) {
        var i,
            elements = [],
            optsize = 12,
            optborder = 12;

        for(i = 0; i < input.boxes.length; i++) {
            elements.push(rect(optborder + input.boxes[i].x1 * optsize,
                optborder + input.boxes[i].y1 * optsize,
                (input.boxes[i].x2 - input.boxes[i].x1) * optsize,
                (input.boxes[i].y2 - input.boxes[i].y1) * optsize));
        }

        for(i = 0; i < input.horizontalLines.length; i++) {
            if(!input.horizontalLines[i].box) {
                elements.push(line(optborder + input.horizontalLines[i].x1 * optsize,
                    optborder + input.horizontalLines[i].y * optsize,
                    optborder + input.horizontalLines[i].x2 * optsize,
                    optborder + input.horizontalLines[i].y * optsize));
            }
        }

        for(i = 0; i < input.verticalLines.length; i++) {
            if(!input.verticalLines[i].box) {
                elements.push(line(optborder + input.verticalLines[i].x * optsize,
                    optborder + input.verticalLines[i].y1 * optsize,
                    optborder + input.verticalLines[i].x * optsize,
                    optborder + input.verticalLines[i].y2 * optsize));
            }
        }
        return svg(optborder * 2 + input.sizeX * optsize, optborder * 2 + input.sizeY * optsize, elements);
    }

    function pic(input) {
        var result;

        result = parse(input);
        result = findBox(result);
        result = drawSvg(result, {});
        return result;
    }

    if(typeof module !== "undefined" && module.exports) {
        module.exports = pic;
    } else {
        root["Pic"] = pic;
    }
})(this);

