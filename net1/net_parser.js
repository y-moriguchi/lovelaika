var undef = void 0,
    BOUND = -1,
    UP = { x:0, y:-1 },
    RIGHT = { x:1, y:0 },
    DOWN = { x:0, y:1 },
    LEFT = { x:-1, y:0 };

function log(message) {
    //console.log(message);
}

function quadro(inputString) {
    var TURN = [UP, RIGHT, DOWN, LEFT],
        input = inputString.split(/\r\n|\r|\n/),
        i,
        j,
        xNow = 1,
        yNow = 1,
        direction = 0,
        maxLength = 0,
        cellMatrix = [],
        me;

    function drawBound(y) {
        var j;

        cellMatrix[y] = [];
        for(j = 0; j < maxLength; j++) {
            cellMatrix[y][j] = { ch: BOUND };
        }
        cellMatrix[y][j + 1] = { ch: BOUND };
    }

    for(i = 0; i < input.length; i++) {
        maxLength = maxLength < input[i].length ? input[i].length : maxLength;
    }
    maxLength += 2;

    for(i = 0; i < input.length; i++) {
        cellMatrix[i + 1] = [];
        cellMatrix[i + 1][0] = { ch: BOUND };
        for(j = 0; j < maxLength - 2; j++) {
            cellMatrix[i + 1][j + 1] = {
                ch: j < input[i].length ? input[i].charAt(j) : ' '
            };
        }
        cellMatrix[i + 1][j + 1] = { ch: BOUND };
    }
    drawBound(0);
    drawBound(i + 1);

    me = {
        getChar: function(xoffset, yoffset) {
            return me.get(xoffset, yoffset).ch;
        },

        isBound: function(xoffset, yoffset) {
            var ch = me.getChar(xoffset, yoffset);

            return ch === BOUND;
        },

        isWhitespace: function(xoffset, yoffset) {
            var ch = me.getChar(xoffset, yoffset);

            return ch === BOUND || /[ ]/.test(ch);
        },

        get: function(xoffset, yoffset) {
            if(xoffset === undef || yoffset === undef) {
                return cellMatrix[yNow][xNow];
            } else if(xNow + xoffset < 0 || xNow + xoffset >= maxLength || yNow + yoffset < 0 || yNow + yoffset >= cellMatrix.length) {
                return { ch: BOUND };
            } else {
                return cellMatrix[yNow + yoffset][xNow + xoffset];
            }
        },

        getForward: function(offset) {
            return me.get(TURN[direction].x * offset, TURN[direction].y * offset);
        },

        move: function(direction) {
            xNow += direction.x;
            yNow += direction.y;
            if(xNow < 0) {
                xNow = 0;
            } else if(xNow >= maxLength) {
                xNow = maxLength - 1;
            }
            if(yNow < 0) {
                yNow = 0;
            } else if(yNow >= cellMatrix.length) {
                yNow = cellMatrix.length - 1;
            }
            return me;
        },

        moveForward: function() {
            return me.move(TURN[direction]);
        },

        moveBackward: function() {
            return me.move(TURN[(direction + 2) % 4]);
        },

        moveCrLf: function() {
            xNow = 1;
            return me.move(DOWN);
        },

        moveInit: function() {
            xNow = yNow = 1;
            return me;
        },

        direction: function(dir) {
            var i = 0;

            for(i = 0; i < TURN.length; i++) {
                if(TURN[i] === dir) {
                    direction = i;
                    return me;
                }
            }
            throw new Error("invaild direction");
        },

        getDirection: function() {
            return TURN[direction];
        },

        isDirectionHorizontal: function() {
            return me.getDirection() === LEFT || me.getDirection() === RIGHT;
        },

        isDirectionVertical: function() {
            return me.getDirection() === UP || me.getDirection() === DOWN;
        },

        turnRight: function() {
            direction++;
            if(direction >= 4) {
                direction = 0;
            }
            return me;
        },

        turnLeft: function() {
            direction--;
            if(direction < 0) {
                direction = 3;
            }
            return me;
        },

        getPosition: function() {
            return {
                x: xNow,
                y: yNow,
                direction: direction
            };
        },

        setPosition: function(position) {
            xNow = position.x;
            yNow = position.y;
            direction = position.direction;
            return me;
        }
    };
    return me;
}

function CallMachine(machine, next, reject) {
    if(next === null) {
        throw new Error("Null pointer Exception");
    }
    this.machine = machine;
    this.next = next;
    this.reject = reject;
}

function ReturnMachine() {}
var returnMachine = new ReturnMachine();

function RejectMachine() {}
var rejectMachine = new RejectMachine();

function engine(quadro, initMachine) {
    var state = [],
        machineResult,
        popState,
        i;

    if(initMachine.init === null) {
        throw new Error("Null pointer Exception");
    }
    state.push({
        state: initMachine,
    });
    for(i = 0; state.length > 0; i++) {
        if(i > 100000) {
            throw new Error("Maybe Infinite Loop");
        } else if(typeof state[state.length - 1].state !== "function") {
            throw new Error("Invaild state : " + JSON.stringify(state[state.length - 1].state));
        }

        machineResult = state[state.length - 1].state(quadro);
        if(machineResult === null) {
            throw new Error("Null pointer Exception");
        } else if(machineResult instanceof CallMachine) {
            state.push({
                state: machineResult.machine,
                next: machineResult.next,
                reject: machineResult.reject,
                position: quadro.getPosition()
            });
            log("entering " + state[state.length - 1].state);
        } else if(machineResult instanceof ReturnMachine) {
            log("leaving " + state[state.length - 1].state);
            popState = state.pop();
            if(state.length > 0) {
                state[state.length - 1].state = popState.next;
            }
            if(popState.position !== undef) {
                quadro.setPosition(popState.position);
            }
        } else if(machineResult instanceof RejectMachine) {
            log("leaving " + state[state.length - 1].state);
            popState = state.pop();
            if(!popState.reject) {
                throw new Error("Internal Error: Reject State Not Found");
            }
            if(state.length > 0) {
                state[state.length - 1].state = popState.reject;
            }
            if(popState.position !== undef) {
                quadro.setPosition(popState.position);
            }
        } else {
            state[state.length - 1].state = machineResult;
        }
    }
}

function net1(input) {
    var title = [],
        lines = [],
        titleString,
        startXPosition,
        startYPosition,
        labelString;

    function searchTitleIndex(xPos) {
        var i;

        for(i = 0; i < title.length; i++) {
            if(xPos >= title[i].positionStart && xPos <= title[i].positionEnd) {
                return i;
            }
        }
        throw new Error("Point Out Of Bounds");
    }

    function drawLine(endXPos, yPos) {
        var startTitle = searchTitleIndex(startXPosition),
            endTitle = searchTitleIndex(endXPos);

        lines.push({
            startX: startTitle,
            endX: endTitle,
            startYPos: startYPosition * 2,
            endYPos: yPos * 2 + 1,
            label: labelString
        });
    }

    var machineInit = (function() {
        var me = {
            name: "machineInit",
            init: function(quadro) {
                if(quadro.isBound()) {
                    return me.next;
                } else if(!quadro.isWhitespace()) {
                    title.push({
                        positionStart: quadro.getPosition().x
                    });
                    titleString = quadro.getChar();
                    quadro.move(RIGHT);
                    return me.title;
                } else {
                    quadro.move(RIGHT);
                    return me.init;
                }
            },

            title: function(quadro) {
                if(quadro.isBound()) {
                    title[title.length - 1].title = titleString;
                    title[title.length - 1].positionEnd = quadro.getPosition().x - 1;
                    return me.next;
                } else if(quadro.isWhitespace()) {
                    quadro.move(RIGHT);
                    return me.space;
                } else {
                    titleString += quadro.getChar();
                    quadro.move(RIGHT);
                    return me.title;
                }
            },

            space: function(quadro) {
                if(quadro.isBound()) {
                    title[title.length - 1].title = titleString;
                    title[title.length - 1].positionEnd = quadro.getPosition().x - 2;
                    return me.next;
                } else if(quadro.isWhitespace()) {
                    title[title.length - 1].title = titleString;
                    title[title.length - 1].positionEnd = quadro.getPosition().x - 2;
                    quadro.move(RIGHT);
                    return me.init;
                } else {
                    titleString += " " + quadro.getChar();
                    return me.title;
                }
            },

            next: function(quadro) {
                quadro.moveCrLf();
                return title.length > 0 ? machineArrow.init : me.init;
            }
        };
        return me;
    })();

    var machineArrow = (function() {
        function isArrow(quadro) {
            var ch1 = quadro.getChar(),
                ch2 = quadro.getChar(1, 0);
                ch0 = quadro.getChar(-1, 0);

            return ch1 === "-" || (ch1 === "\\" && ch0 === "-") || (ch1 === "/" && ch2 === "-");
        }

        var me = {
            name: "machineArrow",
            init: function(quadro) {
                var now = quadro.get();

                if(isArrow(quadro) && !now.marked) {
                    return new CallMachine(machineArrowLeftToRight.init, me.next);
                } else if(quadro.isBound()) {
                    quadro.moveCrLf();
                    if(quadro.isBound()) {
                        return me.endScan;
                    }
                    return me.init;
                } else {
                    quadro.move(RIGHT);
                    return me.init;
                }
            },

            next: function(quadro) {
                quadro.move(RIGHT);
                return me.init;
            },

            endScan: function() {
                // halt
                return returnMachine;
            }
        };
        return me;
    })();

    var machineArrowLeftToRight = (function() {
        var me = {
            name: "machineArrow",

            init: function(quadro) {
                return new CallMachine(me.scan, me.next, machineArrowRightToLeft.init);
            },

            scan: function(quadro) {
                if(quadro.getChar() === ">") {
                    return returnMachine;
                } else if(quadro.getChar() === "-") {
                    quadro.move(RIGHT);
                    return me.scan;
                } else if(quadro.getChar() === "\\") {
                    quadro.move(RIGHT);
                    quadro.move(DOWN);
                    return me.scan;
                } else {
                    return rejectMachine;
                }
            },

            next: function(quadro) {
                return new CallMachine(me.markBack, me.nextMarkBack);
            },

            markBack: function(quadro) {
                if(quadro.getChar() === "-") {
                    quadro.get().marked = true;
                    quadro.move(LEFT);
                    return me.markBack;
                } else {
                    startXPosition = quadro.getPosition().x + 1;
                    startYPosition = quadro.getPosition().y;
                    return me.readLabel;
                }
            },

            readLabel: function(quadro) {
                labelString = "";
                quadro.move(RIGHT);
                quadro.move(UP);
                if(quadro.isWhitespace()) {
                    return returnMachine;
                }
                return me.readLabelScan;
            },

            readLabelScan: function(quadro) {
                if(quadro.isBound()) {
                    return returnMachine;
                } else if(quadro.isWhitespace()) {
                    quadro.move(RIGHT);
                    return me.readLabelScanSpace;
                } else {
                    labelString += quadro.getChar();
                    quadro.move(RIGHT);
                    return me.readLabelScan;
                }
            },

            readLabelScanSpace: function(quadro) {
                if(quadro.isWhitespace()) {
                    return returnMachine;
                } else {
                    labelString += " ";
                    return me.readLabelScan;
                }
            },

            nextMarkBack: function(quadro) {
                return new CallMachine(me.markForward, me.nextMarkForward);
            },

            markForward: function(quadro) {
                if(quadro.getChar() === "-") {
                    quadro.get().marked = true;
                    quadro.move(RIGHT);
                    return me.markForward;
                } else if(quadro.getChar() === "\\") {
                    quadro.get().marked = true;
                    quadro.move(RIGHT);
                    quadro.move(DOWN);
                    return me.markForward;
                } else if(quadro.getChar() === ">") {
                    drawLine(quadro.getPosition().x, quadro.getPosition().y);
                    return returnMachine;
                }
            },

            nextMarkForward: function(quadro) {
                return returnMachine;
            }
        };
        return me;
    })();

    var machineArrowRightToLeft = (function() {
        var me = {
            name: "machineArrowRightToLeft",
            init: function(quadro) {
                return new CallMachine(me.scan, me.next, me.ignore);
            },

            scan: function(quadro) {
                if(quadro.getChar() === "-") {
                    quadro.move(LEFT);
                    return me.scan;
                } else if(quadro.getChar() === "/") {
                    quadro.move(LEFT);
                    quadro.move(DOWN);
                    return me.scan;
                } else if(quadro.getChar() === "<") {
                    return returnMachine;
                } else {
                    return rejectMachine;
                }
            },

            next: function(quadro) {
                return new CallMachine(me.markBack, me.nextMarkBack);
            },

            markBack: function(quadro) {
                if(quadro.getChar() === "-" || quadro.getChar() === "/") {
                    quadro.get().marked = true;
                    quadro.move(RIGHT);
                    return me.markBack;
                } else {
                    startXPosition = quadro.getPosition().x - 1;
                    startYPosition = quadro.getPosition().y;
                    return me.readLabel;
                }
            },

            readLabel: function(quadro) {
                labelString = "";
                quadro.move(LEFT);
                quadro.move(UP);
                if(quadro.isWhitespace()) {
                    return returnMachine;
                }
                return me.readLabelScan;
            },

            readLabelScan: function(quadro) {
                if(quadro.isBound()) {
                    return returnMachine;
                } else if(quadro.isWhitespace()) {
                    quadro.move(LEFT);
                    return me.readLabelScanSpace;
                } else {
                    labelString = quadro.getChar() + labelString;
                    quadro.move(LEFT);
                    return me.readLabelScan;
                }
            },

            readLabelScanSpace: function(quadro) {
                if(quadro.isWhitespace()) {
                    return returnMachine;
                } else {
                    labelString = " " + labelString;
                    return me.readLabelScan;
                }
            },

            nextMarkBack: function(quadro) {
                return new CallMachine(me.markForward, me.nextMarkForward);
            },

            markForward: function(quadro) {
                if(quadro.getChar() === "-") {
                    quadro.get().marked = true;
                    quadro.move(LEFT);
                    return me.markForward;
                } else if(quadro.getChar() === "/") {
                    quadro.get().marked = true;
                    quadro.move(LEFT);
                    quadro.move(DOWN);
                    return me.markForward;
                } else if(quadro.getChar() === "<") {
                    drawLine(quadro.getPosition().x, quadro.getPosition().y);
                    return returnMachine;
                } else {
                    return me.ignore;
                }
            },

            nextMarkForward: function(quadro) {
                return returnMachine;
            },

            ignore: function(quadro) {
                return returnMachine;
            }
        }
        return me;
    })();

    function relocateY(lines) {
        var i, sort = [];

        function insert(val) {
            var j;

            for(j = 0; j < sort.length; j++) {
                if(sort[j] === val) {
                    return;
                } else if(sort[j] > val) {
                    sort.splice(j, 0, val);
                    return;
                }
            }
            sort.push(val);
        }

        for(i = 0; i < lines.length; i++) {
            insert(lines[i].startYPos);
            insert(lines[i].endYPos);
        }
        for(i = 0; i < lines.length; i++) {
            lines[i].startY = sort.indexOf(lines[i].startYPos);
            lines[i].endY = sort.indexOf(lines[i].endYPos);
        }
    }

    var quadroObject = quadro(input);
    engine(quadroObject, machineInit.init);
    relocateY(lines);
    return {
        title: title,
        lines: lines
    };
}

module.exports = net1;

