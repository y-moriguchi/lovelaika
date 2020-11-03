(function(root) {
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

            setXY: function(x, y, ch) {
                cellMatrix[y][x].ch = ch;
            }
        };
        return me;
    }

    function scanConsCell(quadro) {
        var i,
            j,
            result = {},
            vt1,
            vt2,
            ho1,
            ho2,
            cell,
            horizontal = quadro.getHorizontalStrings(),
            vertical = quadro.getVerticalStrings(),
            hPattern = /\+[\|\-]\+[\|\-]\+/g,
            vPattern = /\+[\|\-]\+/g;

        function scanHorizontalLine(ypoint) {
            var i,
                j;

            for(i = 0; i < result.horizontalLines.length; i++) {
                if(ypoint === result.horizontalLines[i].y) {
                    return result.horizontalLines[i];
                }
            }
            return false;
        }

        function scanVerticalLine(xpoint, ypoint) {
            var i,
                j,
                matched;

            for(i = 0; i < result.verticalLines.length; i++) {
                if(xpoint === result.verticalLines[i].x && ypoint === result.verticalLines[i].y1) {
                    return result.verticalLines[i];
                }
            }
            return false;
        }

        result.horizontalLines = [];
        result.verticalLines = [];
        result.consCells = [];

        for(i = 0; i < horizontal.length; i++) {
            while(!!(matched = hPattern.exec(horizontal[i]))) {
                result.horizontalLines.push({
                    x1: matched.index,
                    x2: hPattern.lastIndex - 1,
                    y: i,
                });
            }
        }

        for(i = 0; i < vertical.length; i++) {
            while(!!(matched = vPattern.exec(vertical[i]))) {
                result.verticalLines.push({
                    y1: matched.index,
                    y2: vPattern.lastIndex - 1,
                    x: i,
                });
            }
        }

        for(i = 0; i < result.horizontalLines.length; i++) {
            vt1 = scanVerticalLine(result.horizontalLines[i].x1, result.horizontalLines[i].y);
            vt2 = scanVerticalLine(result.horizontalLines[i].x2, result.horizontalLines[i].y);
            if(vt1 && vt2) {
                ho1 = result.horizontalLines[i];
                ho2 = scanHorizontalLine(vt1.y2);
                if(ho1 && ho2) {
                    result.consCells.push({
                        up: ho1,
                        left: vt1,
                        right: vt2,
                        bottom: ho2
                    });
                }
            }
        }
        return result.consCells;
    }

    function getConsCellPoint(consCells, x, y) {
        var i;

        for(i = 0; i < consCells.length; i++) {
            if(x >= consCells[i].up.x1 && x <= consCells[i].up.x2 && y >= consCells[i].left.y1 && y <= consCells[i].left.y2) {
                return i;
            }
        }
        return false;
    }

    function scanLink(quadro, consCells) {
        var i;

        function traverseLink(x, y) {
            var state = {
                "start": function(x, y) {
                    if(quadro.getXY(x, y - 1) === "|") {
                        return state["traverseUp"](x, y - 1);
                    } else {
                        return state["startRight"](x, y);
                    }
                },

                "startRight": function(x, y) {
                    if(quadro.getXY(x + 1, y) === "-") {
                        return state["traverseRight"](x + 1, y);
                    } else {
                        return state["startDown"](x, y);
                    }
                },

                "startDown": function(x, y) {
                    if(quadro.getXY(x, y + 1) === "|") {
                        return state["traverseDown"](x, y + 1);
                    } else {
                        return state["startLeft"](x, y);
                    }
                },

                "startLeft": function(x, y) {
                    if(quadro.getXY(x - 1, y) === "-") {
                        return state["traverseLeft"](x - 1, y);
                    } else {
                        throw new Error("Syntax Error");
                    }
                },

                "traverseUp": function(x, y) {
                    quadro.setXY(x, y, " ");
                    if(quadro.getXY(x, y - 1) === "^") {
                        return state["endpoint"](x, y - 2);
                    } else if(quadro.getXY(x, y - 1) === "+") {
                        return state["start"](x, y - 1);
                    } else {
                        return state["traverseUp"](x, y - 1);
                    }
                },

                "traverseRight": function(x, y) {
                    quadro.setXY(x, y, " ");
                    if(quadro.getXY(x + 1, y) === ">") {
                        return state["endpoint"](x + 2, y);
                    } else if(quadro.getXY(x + 1, y) === "+") {
                        return state["start"](x + 1, y);
                    } else {
                        return state["traverseRight"](x + 1, y);
                    }
                },

                "traverseDown": function(x, y) {
                    quadro.setXY(x, y, " ");
                    if(quadro.getXY(x, y + 1) === "v") {
                        return state["endpoint"](x, y + 2);
                    } else if(quadro.getXY(x, y + 1) === "+") {
                        return state["start"](x, y + 1);
                    } else {
                        return state["traverseDown"](x, y + 1);
                    }
                },

                "traverseLeft": function(x, y) {
                    quadro.setXY(x, y, " ");
                    if(quadro.getXY(x - 1, y) === "<") {
                        return state["endpoint"](x, y - 2);
                    } else if(quadro.getXY(x - 1, y) === "+") {
                        return state["start"](x - 1, y);
                    } else {
                        return state["traverseLeft"](x - 1, y);
                    }
                },

                "endpoint": function(x, y) {
                    var cellId;

                    if((cellId = getConsCellPoint(consCells, x, y)) !== false) {
                        return {
                            "cellId": cellId
                        };
                    } else {
                        return state["getValue"](x - 1, y);
                    }
                },

                "getValue": function(x, y) {
                    var x1,
                        result = "";

                    for(x1 = x; quadro.getXY(x1, y) !== " "; x1--) {}
                    for(x1++; quadro.getXY(x1, y) !== " "; x1++) {
                        result += quadro.getXY(x1, y);
                    }
                    return result;
                }
            };

            if(quadro.getXY(x, y) === "/") {
                return null;
            } else {
                return state["start"](x, y);
            }
        }

        for(i = 0; i < consCells.length; i++) {
            consCells[i].car = traverseLink(consCells[i].up.x1 + 1, consCells[i].up.y + 1);
            consCells[i].cdr = traverseLink(consCells[i].up.x1 + 3, consCells[i].up.y + 1);
        }
    }

    function detectStartPoint(quadro, consCells) {
        var i,
            cellId,
            matched,
            horizontal = quadro.getHorizontalStrings(),
            hPattern = /(^| )>\|/g;

        for(i = 0; i < horizontal.length; i++) {
            while(!!(matched = hPattern.exec(horizontal[i]))) {
                if((cellId = getConsCellPoint(consCells, hPattern.lastIndex - 1, i)) !== false) {
                    return cellId;
                }
            }
        }
    }

    function detectCommon(link, rootpoint) {
        if(link[rootpoint].visited1pass) {
            link[rootpoint].common = true;
            return;
        }
        link[rootpoint].visited1pass = true;
        if(typeof link[rootpoint].car === "object" && link[rootpoint].car !== null) {
            detectCommon(link, link[rootpoint].car.cellId);
        }
        if(typeof link[rootpoint].cdr === "object" && link[rootpoint].cdr !== null) {
            detectCommon(link, link[rootpoint].cdr.cellId);
        }
        return;
    }

    function toSExp(link, rootpoint) {
        var car, cdr, common = "";

        if(link[rootpoint].visited) {
            return "#" + rootpoint + "#";
        }

        link[rootpoint].visited = true;
        if(link[rootpoint].car === null) {
            car = "NIL";
        } else if(typeof link[rootpoint].car === "object" && link[rootpoint].car !== null) {
            car = toSExp(link, link[rootpoint].car.cellId);
        } else {
            car = link[rootpoint].car;
        }

        if(link[rootpoint].cdr === null) {
            cdr = "NIL";
        } else if(typeof link[rootpoint].cdr === "object" && link[rootpoint].cdr !== null) {
            cdr = toSExp(link, link[rootpoint].cdr.cellId);
        } else {
            cdr = link[rootpoint].cdr;
        }

        if(link[rootpoint].common) {
            common = "#" + rootpoint + "=";
        }
        return common + "(" + car + " . " + cdr + ")";
    }

    function convertAExp(inputString) {
        var quadro = createQuadro(inputString),
            consCells = scanConsCell(quadro),
            rootpoint = detectStartPoint(quadro, consCells),
            sexp;

        scanLink(quadro, consCells);
        detectCommon(consCells, rootpoint);
        sexp = toSExp(consCells, rootpoint);
        return sexp;
    }

    var aexp = {
        parse: convertAExp
    };

    if(typeof module !== "undefined" && module.exports) {
        module.exports = aexp;
    } else {
        root["AExp"] = aexp;
    }
})(this);
