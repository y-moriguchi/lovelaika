(function(root) {
    var twoBytesStr = "";
    twoBytesStr += '\u2e80-\u2eff\u3000-\u30ff\u3300-\u4dbf\u4e00-\u9fff\uac00-\ud7af\uf900-\ufaff\ufe30-\ufe4f';
    var TWOBYTES = new RegExp('[' + twoBytesStr + ']');

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

    function parse(quadro) {
        var i,
            j,
            result = {},
            horizontal = quadro.getHorizontalStrings(),
            vertical = quadro.getVerticalStrings(),
            matched,
            matchedText,
            hPattern = /([\+<])(([\-\|\+]|"([^"]*)\")*)([\+>])/g,
            vPattern = /([\+\^])([\-\|\+:\*]*)([\+v])/g,
            textPattern = /"([^"]*)"/;

        result.horizontalLines = [];
        result.verticalLines = [];

        for(i = 0; i < horizontal.length; i++) {
            while(!!(matched = hPattern.exec(horizontal[i]))) {
                matchedText = textPattern.exec(matched[2]);
                result.horizontalLines.push({
                    x1: matched.index,
                    x2: hPattern.lastIndex - 1,
                    y: i,
                    leftArrow: matched[1] === "<",
                    rightArrow: matched[5] === ">",
                    text: matchedText ? matchedText[1] : false
                });

                for(j = matched.index; j < hPattern.lastIndex; j++) {
                    quadro.setProperty(j, i, "hline", true);
                }
                hPattern.lastIndex--;
            }
        }

        for(i = 0; i < vertical.length; i++) {
            while(!!(matched = vPattern.exec(vertical[i]))) {
                result.verticalLines.push({
                    y1: matched.index,
                    y2: vPattern.lastIndex - 1,
                    x: i,
                    upArrow: matched[1] === "^",
                    downArrow: matched[3] === "v",
                    dashed: /:/.test(matched[2]),
                    nobox: /\*/.test(matched[2])
                });

                for(j = matched.index; j < vPattern.lastIndex; j++) {
                    quadro.setProperty(i, j, "vline", true);
                }
                vPattern.lastIndex--;
            }
        }

        result.sizeX = quadro.getSizeX();
        result.sizeY = quadro.getSizeY();
        return result;
    }

    function findBox(parsed, quadro) {
        var i,
            j,
            horizontalPair = [],
            verticalPair = [],
            texts,
            nobox;

        function getText(x1, y1, x2, y2) {
            var i,
                j,
                inLine,
                text1,
                result = [];

            for(i = y1 + 1; i < y2; i++) {
                text1 = "";
                inLine = false;
                for(j = x1 + 1; j < x2; j++) {
                    if(!inLine && quadro.getProperty(j, i, "vline")) {
                        inLine = true;
                    } else if(inLine && quadro.getProperty(j, i, "vline")) {
                        inLine = false;
                    }
                    if(!inLine && !quadro.getProperty(j, i, "hline") && !quadro.getProperty(j, i, "vline")) {
                        text1 += quadro.getXY(j, i);
                    }
                }
                result.push(text1.trim());
            }
            return result;
        }

        parsed.boxes = [];
        for(i = 0; i < parsed.horizontalLines.length; i++) {
            for(j = i + 1; j < parsed.horizontalLines.length; j++) {
                if(parsed.horizontalLines[i].x1 === parsed.horizontalLines[j].x1 &&
                        parsed.horizontalLines[i].x2 === parsed.horizontalLines[j].x2) {
                    horizontalPair.push({ i: i, j: j });
                    break;
                }
            }
        }

        for(i = 0; i < parsed.verticalLines.length; i++) {
            for(j = i + 1; j < parsed.verticalLines.length; j++) {
                if(parsed.verticalLines[i].y1 === parsed.verticalLines[j].y1 &&
                        parsed.verticalLines[i].y2 === parsed.verticalLines[j].y2) {
                    verticalPair.push({ i: i, j: j });
                    break;
                }
            }
        }

        for(i = 0; i < horizontalPair.length; i++) {
            for(j = 0; j < verticalPair.length; j++) {
                if(!parsed.horizontalLines[horizontalPair[i].i].box &&
                        !parsed.horizontalLines[horizontalPair[i].j].box &&
                        !parsed.verticalLines[verticalPair[j].i].box &&
                        !parsed.verticalLines[verticalPair[j].j].box &&
                        parsed.horizontalLines[horizontalPair[i].i].y === parsed.verticalLines[verticalPair[j].i].y1 &&
                        parsed.horizontalLines[horizontalPair[i].j].y === parsed.verticalLines[verticalPair[j].i].y2) {
                    nobox = parsed.verticalLines[verticalPair[j].i].nobox || parsed.verticalLines[verticalPair[j].j].nobox;
                    texts = getText(
                        parsed.horizontalLines[horizontalPair[i].i].x1,
                        parsed.verticalLines[verticalPair[j].i].y1,
                        parsed.horizontalLines[horizontalPair[i].i].x2,
                        parsed.verticalLines[verticalPair[j].i].y2);
                    parsed.boxes.push({
                        x1: parsed.horizontalLines[horizontalPair[i].i].x1,
                        x2: parsed.horizontalLines[horizontalPair[i].i].x2,
                        y1: parsed.verticalLines[verticalPair[j].i].y1,
                        y2: parsed.verticalLines[verticalPair[j].i].y2,
                        texts: texts,
                        nobox: nobox
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

    function drawSvg(input, option) {
        var i,
            j,
            elements = [],
            opt = option ? option : {},
            optsizex = opt.sizex ? opt.sizex : 12,
            optsizey = opt.sizey ? opt.sizey : optsizex / 12 * 16,
            optborder = opt.border ? opt.border : 12,
            arrowSize = opt.arrowSize ? opt.arrowSize : 8,
            optdash = opt.dash ? opt.dash : 5,
            optfont = opt.font ? opt.font : "Verdana",
            optx1,
            opty1,
            optx2,
            opty2,
            style;

        for(i = 0; i < input.boxes.length; i++) {
            if(!input.boxes[i].nobox) {
                elements.push(rect(optborder + input.boxes[i].x1 * optsizex,
                    optborder + input.boxes[i].y1 * optsizey,
                    (input.boxes[i].x2 - input.boxes[i].x1) * optsizex,
                    (input.boxes[i].y2 - input.boxes[i].y1) * optsizey));
            }
            for(j = 0; j < input.boxes[i].texts.length; j++) {
                elements.push(text(optborder + (input.boxes[i].x1 + 0.5) * optsizex,
                    optborder + (input.boxes[i].y1 + 1 + j) * optsizey,
                    optsizex,
                    optfont,
                    input.boxes[i].texts[j]));
            }
        }

        for(i = 0; i < input.horizontalLines.length; i++) {
            if(!input.horizontalLines[i].box) {
                opty1 = optborder + input.horizontalLines[i].y * optsizey;
                if(input.horizontalLines[i].leftArrow) {
                    optx1 = optborder + (input.horizontalLines[i].x1 - 1) * optsizex + arrowSize;
                    elements.push(arrow(optx1 - arrowSize, opty1, arrowSize, "left"));
                } else {
                    optx1 = optborder + input.horizontalLines[i].x1 * optsizex;
                }
                if(input.horizontalLines[i].rightArrow) {
                    optx2 = optborder + (input.horizontalLines[i].x2 + 1) * optsizex - arrowSize;
                    elements.push(arrow(optx2 + arrowSize, opty1, arrowSize, "right"));
                } else {
                    optx2 = optborder + input.horizontalLines[i].x2 * optsizex;
                }
                if(input.horizontalLines[i].dashed) {
                    style = "stroke-dasharray: " + optdash + ", " + optdash;
                } else {
                    style = "";
                }
                elements.push(line(optx1, opty1, optx2, opty1, style));
                if(input.horizontalLines[i].text) {
                    elements.push(text(optborder + (input.horizontalLines[i].x1 +
                            (input.horizontalLines[i].x2 - input.horizontalLines[i].x1) / 2) * optsizex,
                        optborder + (input.horizontalLines[i].y - 1) * optsizey,
                        optsizex,
                        optfont,
                        input.horizontalLines[i].text));
                }
            }
        }

        for(i = 0; i < input.verticalLines.length; i++) {
            if(!input.verticalLines[i].box) {
                optx1 = optborder + input.verticalLines[i].x * optsizex;
                if(input.verticalLines[i].upArrow) {
                    opty1 = optborder + (input.verticalLines[i].y1 - 1) * optsizey + arrowSize;
                    elements.push(arrow(optx1, opty1 - arrowSize, arrowSize, "up"));
                } else {
                    opty1 = optborder + input.verticalLines[i].y1 * optsizey;
                }
                if(input.verticalLines[i].downArrow) {
                    opty2 = optborder + (input.verticalLines[i].y2 + 1) * optsizey - arrowSize;
                    elements.push(arrow(optx1, opty2 + arrowSize, arrowSize, "down"));
                } else {
                    opty2 = optborder + input.verticalLines[i].y2 * optsizey;
                }
                if(input.verticalLines[i].dashed) {
                    style = "stroke-dasharray: " + optdash + ", " + optdash;
                } else {
                    style = "";
                }
                elements.push(line(optx1, opty1, optx1, opty2, style));
            }
        }
        return svg(optborder * 2 + input.sizeX * optsizex, optborder * 2 + input.sizeY * optsizey, elements);
    }

    function pic(input, option) {
        var result,
            quadro = createQuadro(input);

        result = parse(quadro);
        result = findBox(result, quadro);
        result = drawSvg(result, option);
        return result;
    }

    if(typeof module !== "undefined" && module.exports) {
        module.exports = pic;
    } else {
        root["Pic"] = pic;
    }
})(this);

