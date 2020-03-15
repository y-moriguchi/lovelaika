(function(root) {
    var END = "$";

    function isArray(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }

    function flatArray(anArray) {
        var result = [],
            i;

        for(i = 0; i < anArray.length; i++) {
            if(isArray(anArray[i])) {
                result = result.concat(flatArray(anArray[i]));
            } else {
                result.push(anArray[i]);
            }
        }
        return result;
    }

    function makeSet(/* args */) {
        var i,
            result = [];

        for(i = 0; i < arguments.length; i++) {
            result = addElement(result, arguments[i]);
        }
        return result;
    }

    function addElement(aSet, element) {
        var i;

        for(i = 0; i < aSet.length; i++) {
            if(aSet[i] === element) {
                return aSet;
            }
        }
        return aSet.concat([element]);
    }

    function removeElement(aSet, element) {
        var i,
            result = [];

        for(i = 0; i < aSet.length; i++) {
            if(aSet[i] !== element) {
                result.push(aSet[i]);
            }
        }
        return result;
    }

    function containsSet(aSet, element) {
        return aSet.indexOf(element) >= 0;
    }

    function isEmptySet(aSet) {
        return aSet.length === 0;
    }

    function isEqualSet(set1, set2) {
        var i;

        if(set1.length !== set2.length) {
            return false;
        }
        for(i = 0; i < set1.length; i++) {
            if(!containsSet(set2, set1[i])) {
                return false;
            }
        }
        return true;
    }

    function isIntersect(aSet, setToTest) {
        var i;

        for(i = 0; i < setToTest.length; i++) {
            if(containsSet(aSet, setToTest[i])) {
                return true;
            }
        }
        return false;
    }

    function union(/* args */) {
        var i,
            j,
            result = [];

        for(i = 0; i < arguments.length; i++) {
            for(j = 0; j < arguments[i].length; j++) {
                result = addElement(result, arguments[i][j]);
            }
        }
        return result;
    }

    function eachSet(aSet, each) {
        var i;

        for(i = 0; i < aSet.length; i++) {
            each(aSet[i]);
        }
    }

    function flatMapSet(aSet, map) {
        var i,
            result = [];

        for(i = 0; i < aSet.length; i++) {
            result = union(result, map(aSet[i]));
        }
        return result;
    }

    function foldSet(aSet, fold, init) {
        var i,
            result = init;

        for(i = 0; i < aSet.length; i++) {
            result = fold(aSet[i], result);
        }
        return result;
    }

    function copySet(aSet) {
        return aSet.slice();
    }

    function LR0Item(grammar) {
        var EPSILON = "#",
            first = {},
            follow = {},
            itemPool = {},
            closurePool = [],
            lr0,
            lrAction = [],
            lrInit;

        function isNonterminal(symbol) {
            return grammar.nonterminals.indexOf(symbol) >= 0;
        }

        function isTerminal(symbol) {
            return grammar.terminals.indexOf(symbol) >= 0;
        }

        function getFirst(symbol) {
            var result;

            if(isTerminal(symbol)) {
                return makeSet(symbol);
            } else if(isNonterminal(symbol)) {
                result = first[symbol];
                return result ? result : makeSet();
            } else {
                throw new Error("Internal Error");
            }
        }

        function getFirstList(symbolList, start) {
            var result = makeSet(),
                i;

            start = start ? start : 0;
            for(i = start; i < symbolList.length; i++) {
                result = union(result, getFirst(symbolList[i]));
                if(!isFirstNullable(symbolList[i])) {
                    return result;
                }
            }
            result = addElement(result, EPSILON);
            return result;
        }

        function isFirstNullable(symbol) {
            if(isTerminal(symbol)) {
                return false;
            } else if(isNonterminal(symbol)) {
                return first[symbol] && containsSet(first[symbol], EPSILON);
            } else {
                throw new Error("Internal Error");
            }
        }

        function isFirstNullableList(symbolList, start) {
            var i;

            start = start ? start : 0;
            for(i = start; i < symbolList.length; i++) {
                if(!isFirstNullable(symbolList[i])) {
                    return false;
                }
            }
            return true;
        }

        function addFirst(symbol, symbolSetToAdd) {
            var aSet = first[symbol];

            if(!aSet) {
                aSet = makeSet();
            }
            first[symbol] = union(aSet, symbolSetToAdd);
        }

        function copyFirstFollow(dest) {
            var i,
                result = {};

            for(i in dest) {
                if(dest.hasOwnProperty(i)) {
                    result[i] = dest[i].slice();
                }
            }
            return result;
        }

        function isEqualFirstFollow(dest, copied) {
            var i,
                j;

            for(i in dest) {
                if(!copied[i] || copied[i].length !== dest[i].length) {
                    return false;
                } else {
                    for(j = 0; j < copied[i].length; j++) {
                        if(copied[i][j] !== dest[i][j]) {
                            return false;
                        }
                    }
                }
            }
            return true;
        }

        function copyFirst() {
            return copyFirstFollow(first);
        }

        function isEqualFirst(copied) {
            return isEqualFirstFollow(first, copied);
        }

        function initFirst() {
            var beforeFirst,
                i,
                j;

            for(i = 0; i < grammar.rules.length; i++) {
                if(grammar.rules[i][1].length === 0) {
                    addFirst(grammar.rules[i][0], makeSet(EPSILON));
                }
            }
            do {
                beforeFirst = copyFirst();
                for(i = 0; i < grammar.rules.length; i++) {
                    for(j = 0; j < grammar.rules[i][1].length; j++) {
                        addFirst(grammar.rules[i][0], getFirst(grammar.rules[i][1][j]));
                        if(!isFirstNullable(grammar.rules[i][1][j])) {
                            break;
                        }
                    }
                }
            } while(!isEqualFirst(beforeFirst));
        }

        function getFollow(symbol) {
            var result;

            if(isNonterminal(symbol)) {
                result = follow[symbol];
                return result ? result : makeSet();
            } else {
                throw new Error("Internal Error");
            }
        }

        function addFollow(symbol, symbolSetToAdd) {
            var aSet = follow[symbol];

            if(!aSet) {
                aSet = makeSet();
            }
            follow[symbol] = union(aSet, symbolSetToAdd);
        }

        function copyFollow() {
            return copyFirstFollow(follow);
        }

        function isEqualFollow(copied) {
            return isEqualFirstFollow(follow, copied);
        }

        function initFollow() {
            var beforeFollow,
                firstList,
                i,
                j;

            addFollow(grammar.rules[0][0], makeSet(END));
            do {
                beforeFollow = copyFollow();
                for(i = 0; i < grammar.rules.length; i++) {
                    for(j = 0; j < grammar.rules[i][1].length; j++) {
                        if(isNonterminal(grammar.rules[i][1][j])) {
                            firstList = getFirstList(grammar.rules[i][1], j + 1);
                            firstList = removeElement(firstList, EPSILON);
                            addFollow(grammar.rules[i][1][j], firstList);
                            if(j + 1 >= grammar.rules[i][1].length || isFirstNullableList(grammar.rules[i][1], j + 1)) {
                                addFollow(grammar.rules[i][1][j], getFollow(grammar.rules[i][0]));
                            }
                        }
                    }
                }
            } while(!isEqualFollow(beforeFollow));
        }

        function makeItem(ruleIndex, mark) {
            var ruleId = ruleIndex + ":" + mark,
                result;

            result = itemPool[ruleId];
            if(!itemPool[ruleId]) {
                result = {
                    ruleIndex: ruleIndex,
                    rule: grammar.rules[ruleIndex],
                    mark: mark
                };
                itemPool[ruleId] = result;
            }
            return result;
        }

        function getItemSymbol(item) {
            if(item.mark < item.rule[1].length) {
                return item.rule[1][item.mark];
            } else {
                return null;
            }
        }

        function searchNonterminal(symbol) {
            var i,
                result = makeSet();

            for(i = 0; i < grammar.rules.length; i++) {
                if(grammar.rules[i][0] === symbol) {
                    result = addElement(result, makeItem(i, 0));
                }
            }
            return result;
        }

        function computeClosure1(itemSet) {
            var result;

            result = union(itemSet, flatMapSet(itemSet, function(item) {
                var symbol = getItemSymbol(item);

                if(isNonterminal(symbol)) {
                    return searchNonterminal(symbol);
                } else {
                    return makeSet();
                }
            }));
            return result;
        }

        function getClosureId(itemSet) {
            var i;

            if(isEmptySet(itemSet)) {
                return -1;
            }
            for(i = 0; i < closurePool.length; i++) {
                if(isEqualSet(itemSet, closurePool[i])) {
                    return i;
                }
            }
            closurePool.push(itemSet);
            return i;
        }

        function getClosureById(id) {
            return closurePool[id];
        }

        function getClosureNumber() {
            return closurePool.length;
        }

        function forEachClosures(fn) {
            var poolCopy = closurePool.slice(),
                i;

            for(i = 0; i < poolCopy.length; i++) {
                fn(i, poolCopy[i])
            }
        }

        function computeClosure(itemSet) {
            var beforeItemSet,
                afterItemSet = itemSet;

            do {
                beforeItemSet = afterItemSet;
                afterItemSet = computeClosure1(beforeItemSet);
            } while(!isEqualSet(beforeItemSet, afterItemSet));
            return getClosureId(afterItemSet);
        }

        function computeGoto(itemSet, symbol) {
            var result;

            result = flatMapSet(itemSet, function(item) {
                var itemSymbol = getItemSymbol(item);

                if(itemSymbol === symbol) {
                    return makeSet(makeItem(item.ruleIndex, item.mark + 1));
                } else {
                    return makeSet();
                }
            });
            return result;
        }

        function computeItem(beginItem) {
            var startId,
                fa = {},
                beforeClosureNum,
                afterClosureNum;

            function addGoto(closureId, symbol, gotoId) {
                var edge = fa[closureId];

                if(gotoId < 0) {
                    return;
                }
                if(!edge) {
                    edge = {};
                    fa[closureId] = edge;
                }
                edge[symbol] = gotoId;
            }

            startId = computeClosure(makeSet(beginItem));
            afterClosureNum = getClosureNumber();
            do {
                beforeClosureNum = afterClosureNum;
                forEachClosures(function(closureId, closure) {
                    var gotoSet,
                        i;

                    function loopSymbols(symbols) {
                        for(i = 0; i < symbols.length; i++) {
                            gotoSet = computeGoto(closure, symbols[i]);
                            if(!isEmptySet(gotoSet)) {
                                addGoto(closureId, symbols[i], computeClosure(gotoSet));
                            }
                        }
                    }
                    loopSymbols(grammar.nonterminals);
                    loopSymbols(grammar.terminals);
                });
                afterClosureNum = getClosureNumber();
            } while(beforeClosureNum !== afterClosureNum);

            return {
                startId: startId,
                fa: fa
            };
        }

        function getAction(state, symbol) {
            var action1 = lrAction[state];

            if(!action1) {
                return null;
            } else if(!action1[symbol]) {
                return null;
            } else {
                return action1[symbol];
            }
        }

        function addActionShift(state, symbol, stateTo) {
            var action1 = lrAction[state];

            if(!action1) {
                action1 = {};
                lrAction[state] = action1;
            } else if(action1[symbol]) {
                throw new Error("conflict");
            }
            action1[symbol] = ["shift", stateTo];
        }

        function addActionReduce(state, symbol, ruleIndex) {
            var action1 = lrAction[state];

            if(!action1) {
                action1 = {};
                lrAction[state] = action1;
            } else if(action1[symbol]) {
                throw new Error("conflict");
            }
            action1[symbol] = ["reduce", ruleIndex];
        }

        function addActionAccept(state, symbol) {
            var action1 = lrAction[state];

            if(!action1) {
                action1 = {};
                lrAction[state] = action1;
            } else if(action1[symbol]) {
                throw new Error("conflict");
            }
            action1[symbol] = ["accept"];
        }

        function constructSLR() {
            var closure,
                i;

            for(i = 0; i < getClosureNumber(); i++) {
                closure = getClosureById(i);
                eachSet(closure, function(item) {
                    var itemSymbol,
                        follow1;

                    if(item.mark < item.rule[1].length) {
                        itemSymbol = getItemSymbol(item);
                        if(isTerminal(itemSymbol)) {
                            addActionShift(i, itemSymbol, lr0.fa[i][itemSymbol]);
                        }
                    } else if(item.ruleIndex !== 0) {
                        follow1 = getFollow(item.rule[0]);
                        eachSet(follow1, function(aSymbol) {
                            addActionReduce(i, aSymbol, item.ruleIndex);
                        });
                    } else if(item.ruleIndex === 0) {
                        addActionAccept(i, END);
                    } else {
                        throw new Error("Internal Error");
                    }
                });
            }
            lrInit = lr0.startId;
        }

        function createLRParser() {
            var stack = [lrInit],
                semanticsStack = [],
                ended = false;

            function step(token, attr) {
                var stackTop,
                    anAction,
                    rule,
                    gotoNew,
                    argsToPass;

                if(ended) {
                    throw new Error("Parsing has already ended");
                }
                stackTop = stack[stack.length - 1];
                anAction = getAction(stackTop, token);
                if(!anAction) {
                    throw new Error("Syntax error");
                } else if(anAction[0] === "shift") {
                    stack.push(token);
                    stack.push(anAction[1]);
                    semanticsStack.push(attr);
                } else if(anAction[0] === "reduce") {
                    rule = grammar.rules[anAction[1]];
                    stack.splice(stack.length - rule[1].length * 2, rule[1].length * 2);
                    gotoNew = lr0.fa[stack[stack.length - 1]][rule[0]];
                    stack.push(rule[0]);
                    stack.push(gotoNew);
                    argsToPass = semanticsStack.splice(semanticsStack.length - rule[1].length, rule[1].length);
                    if(rule[2]) {
                        semanticsStack.push(rule[2].apply(null, argsToPass));
                    } else {
                        semanticsStack.push(argsToPass.length > 0 ? argsToPass[0] : null);
                    }
                    return step(token, attr);
                } else if(anAction[0] === "accept") {
                    ended = true;
                    return semanticsStack[0];
                }
                return null;
            };
            return step;
        }

        initFirst();
        initFollow();
        lr0 = computeItem(makeItem(0, 0));
        constructSLR();
        //return {
        //    items: lr0,
        //    first: first,
        //    follow: follow,
        //    action: lrAction,
        //    init: lrInit
        //};
        return createLRParser();
    }

    if(typeof module !== "undefined" && module.exports) {
        module.exports = {
            parser: LR0Item,
            END: END
        };
    } else {
        root["LR"] = {
            parser: LR0Item,
            END: END
        };
    }
})(this);
