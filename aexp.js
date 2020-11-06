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

    function searchPattern(pattern, aString, start) {
        var i,
            j,
            back = 0;

        outer: for(i = start; i < aString.length; i++) {
            for(j = 0; j < pattern.length; j++) {
                if(i + j >= aString.length) {
                    return false;
                } else if(pattern.charAt(j) === ".") {
                    // next
                } else if(pattern.charAt(j) === "^") {
                    if(i === 0) {
                        back++;
                    } else if(aString.charAt(i + j - back) !== " ") {
                        continue outer;
                    }
                } else if(pattern.charAt(j) !== aString.charAt(i + j - back)) {
                    continue outer;
                }
            }

            return {
                "index": i,
                "lastIndex": i + j - back
            }
        }
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
            matched,
            horizontal = quadro.getHorizontalStrings(),
            vertical = quadro.getVerticalStrings(),
            hPattern = "+.+.+",
            vPattern = "+.+";

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
            matched = { "lastIndex": 0 };
            while(!!(matched = searchPattern(hPattern, horizontal[i], matched.lastIndex))) {
                result.horizontalLines.push({
                    x1: matched.index,
                    x2: matched.lastIndex - 1,
                    y: i,
                });
            }
        }

        for(i = 0; i < vertical.length; i++) {
            matched = { "lastIndex": 0 };
            while(!!(matched = searchPattern(vPattern, vertical[i], matched.lastIndex))) {
                result.verticalLines.push({
                    y1: matched.index,
                    y2: matched.lastIndex - 1,
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
            hPattern = "^>|";

        for(i = 0; i < horizontal.length; i++) {
            matched = { "lastIndex": 0 };
            while(!!(matched = searchPattern(hPattern, horizontal[i], matched.lastIndex))) {
                if((cellId = getConsCellPoint(consCells, matched.lastIndex - 1, i)) !== false) {
                    return cellId;
                }
            }
        }
    }

    function toAtom(aString) {
        var num;

        num = parseFloat(aString);
        if(!isNaN(num)) {
            return num;
        } else {
            return aString;
        }
    }

    function assv(data, key) {
        var i;

        for(i = 0; i < data.length; i++) {
            if(data[i][0] === key) {
                return data[i];
            }
        }
        return false;
    }

    function toSExp(link, rootpoint) {
        var i;

        function walk(link, rootpoint) {
            var car, cdr;

            if(link[rootpoint].visited) {
                return {
                    "visited": rootpoint
                };
            }

            link[rootpoint].visited = true;
            if(link[rootpoint].car === null) {
                car = null;
            } else if(typeof link[rootpoint].car === "object" && link[rootpoint].car !== null) {
                car = walk(link, link[rootpoint].car.cellId);
            } else {
                car = toAtom(link[rootpoint].car);
            }

            if(link[rootpoint].cdr === null) {
                cdr = null;
            } else if(typeof link[rootpoint].cdr === "object" && link[rootpoint].cdr !== null) {
                cdr = walk(link, link[rootpoint].cdr.cellId);
            } else {
                cdr = toAtom(link[rootpoint].cdr);
            }

            link[rootpoint].value = {
                "car": car,
                "cdr": cdr
            };
            return link[rootpoint].value;
        }

        walk(link, rootpoint);
        for(i = 0; i < link.length; i++) {
            if(link[i].value.car !== null && typeof link[i].value.car.visited === "number") {
                link[i].value.car = link[link[i].value.car.visited].value;
            }
            if(link[i].value.cdr !== null && typeof link[i].value.cdr.visited === "number") {
                link[i].value.cdr = link[link[i].value.cdr.visited].value;
            }
        }
        return link[rootpoint].value;
    }

    function convertAExp(inputString) {
        var quadro = createQuadro(inputString),
            consCells = scanConsCell(quadro),
            rootpoint = detectStartPoint(quadro, consCells),
            sexp;

        scanLink(quadro, consCells);
        sexp = toSExp(consCells, rootpoint);
        return sexp;
    }

    function printSExp(sexp) {
        var adata = [],
            num = 1;

        function walkList(sexp) {
            var res;

            if(sexp === null) {
                return ")";
            } else if(typeof sexp !== "object") {
                return ". " + sexp.toString() + ")";
            } else {
                res = assv(adata, sexp);
                if(res) {
                    return "#" + res[1] + "#)";
                }
                adata.push([sexp, num++]);
                return walk(sexp.car) + " " + walkList(sexp.cdr);
            }
        }

        function walk(sexp) {
            var res;

            if(sexp === null) {
                return "()";
            } else if(typeof sexp !== "object") {
                return sexp.toString();
            } else {
                res = assv(adata, sexp);
                if(res) {
                    return "#" + res[1] + "#";
                }
                adata.push([sexp, num++]);
                return "(" + walk(sexp.car) + " " + walkList(sexp.cdr);
            }
        }
        return walk(sexp);
    }

    var aexp = {
        parse: convertAExp,
        toString: printSExp
    };

    if(typeof module !== "undefined" && module.exports) {
        module.exports = aexp;
    } else {
        root["AExp"] = aexp;
    }
})(this);
