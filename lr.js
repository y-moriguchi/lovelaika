(function(root) {
    var END = "$";

    function isArray(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }

    function isObject(obj) {
        return typeof obj === "object" && obj !== null;
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

    function isEqual(obj1, obj2) {
        var i,
            result1,
            result2;

        if(isArray(obj1) && isArray(obj2)) {
            if(obj1.length !== obj2.length) {
                return false;
            } else {
                for(i = 0; i < obj1.length; i++) {
                    if(!isEqual(obj1[i], obj2[i])) {
                        return false;
                    }
                }
                return true;
            }
        } else if(isObject(obj1) && isObject(obj2)) {
            result1 = [];
            result2 = [];
            for(i in obj1) {
                if(obj1.hasOwnProperty(i)) {
                    result1.push(i);
                }
            }
            for(i in obj2) {
                if(obj2.hasOwnProperty(i)) {
                    result2.push(i);
                }
            }
            if(!isEqual(result1, result2)) {
                return false;
            }
            for(i = 0; i < result1.length; i++) {
                if(!isEqual(obj1[result1[i]], obj2[result1[i]])) {
                    return false;
                }
            }
            return true;
        } else {
            return obj1 === obj2;
        }
    }

    function makeSet(/* args */) {
        var i,
            result = [];

        for(i = 0; i < arguments.length; i++) {
            result = addElement(result, arguments[i]);
        }
        return result;
    }

    function countSet(aSet) {
        return aSet.length;
    }

    function addElement(aSet, element) {
        var i;

        for(i = 0; i < aSet.length; i++) {
            if(isEqual(aSet[i], element)) {
                return aSet;
            }
        }
        return aSet.concat([element]);
    }

    function removeElement(aSet, element) {
        var i,
            result = [];

        for(i = 0; i < aSet.length; i++) {
            if(!isEqual(aSet[i], element)) {
                result.push(aSet[i]);
            }
        }
        return result;
    }

    function containsSet(aSet, element) {
        var i;

        for(i = 0; i < aSet.length; i++) {
            if(isEqual(aSet[i], element)) {
                return true;
            }
        }
        return false;
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
            if(each(aSet[i]) === true) {
                return;
            }
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
        var EPSILON = "#e",
            DUMMY = "#",
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

            if(isTerminal(symbol) || symbol === DUMMY) {
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
            if(isTerminal(symbol) || symbol === DUMMY) {
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
                        if(!isEqual(copied[i][j], dest[i][j])) {
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

            result = {
                ruleIndex: ruleIndex,
                rule: grammar.rules[ruleIndex],
                mark: mark,
                lookaheads: makeSet()
            };
            return result;
        }

        function isKernelItem(item) {
            return item.ruleIndex === 0 || item.mark > 0;
        }

        function isEndItem(item) {
            return item.mark >= item.rule[1].length;
        }

        function getItemSymbol(item) {
            if(item.mark < item.rule[1].length) {
                return item.rule[1][item.mark];
            } else {
                return null;
            }
        }

        function getBackItemSymbol(item) {
            return item.rule[1][item.mark - 1]
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

        function searchItemFromClosurePool(itemId, item0) {
            var result = null;

            eachSet(closurePool[itemId], function(item) {
                if(item.ruleIndex === item0.ruleIndex && item.mark === item0.mark) {
                    result = item;
                    return true;
                }
            });
            return result;
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

        function makeItemLookahead(ruleIndex, mark, lookahead) {
            var result;

            result = {
                ruleIndex: ruleIndex,
                rule: grammar.rules[ruleIndex],
                mark: mark,
                lookahead: lookahead
            };
            return result;
        }

        function searchNonterminalLR1(symbol, item) {
            var result = makeSet(),
                firstList,
                first,
                i,
                j;

            for(i = 0; i < grammar.rules.length; i++) {
                if(grammar.rules[i][0] === symbol) {
                    firstList = item.rule[1].slice(item.mark + 1).concat([item.lookahead]);
                    first = getFirstList(firstList);
                    eachSet(first, function(symbol) {
                        result = addElement(result, makeItemLookahead(i, 0, symbol));
                    });
                }
            }
            return result;
        }

        function computeClosure1LR1(itemSet) {
            var result;

            result = union(itemSet, flatMapSet(itemSet, function(item) {
                var symbol = getItemSymbol(item);

                if(isNonterminal(symbol)) {
                    return searchNonterminalLR1(symbol, item);
                } else {
                    return makeSet();
                }
            }));
            return result;
        }

        function computeClosureLR1(itemSet) {
            var beforeItemSet,
                afterItemSet = itemSet;

            do {
                beforeItemSet = afterItemSet;
                afterItemSet = computeClosure1LR1(beforeItemSet);
            } while(!isEqualSet(beforeItemSet, afterItemSet));
            return afterItemSet;
        }

        function getPropagater(itemId) {
            var closure = getClosureById(itemId);

            function eachItemPropagate(item, fn) {
                var toId,
                    symbolItem,
                    lr0item

                if(lr0.fa[itemId]) {
                    for(symbolItem in lr0.fa[itemId]) {
                        if(lr0.fa[itemId].hasOwnProperty(symbolItem)) {
                            toId = lr0.fa[itemId][symbolItem];
                            eachSet(getClosureById(toId), function(item1) {
                                if(isKernelItem(item1)) {
                                    lr0item = searchItemFromClosurePool(itemId, item);
                                    fn(toId, item, lr0item, item1);
                                }
                            });
                        }
                    }
                }
            }

            function eachClosure(fn) {
                eachSet(closure, function(item) {
                    var closure1;

                    if(isKernelItem(item)) {
                        closure1 = computeClosureLR1(makeSet(makeItemLookahead(item.ruleIndex, item.mark, DUMMY)));
                        eachSet(closure1, function(item) {
                            eachItemPropagate(item, fn);
                        });
                    }
                });
            }

            eachClosure(function(toId, lr1item, item1, item2) {
                var nextItem;

                if(lr1item.lookahead !== DUMMY && item2.ruleIndex === lr1item.ruleIndex && !isEndItem(lr1item)) {
                    item2.lookaheads = addElement(item2.lookaheads, lr1item.lookahead);
                }
            });
            return function() {
                var dirty = false;

                eachClosure(function(toId, lr1item, item1, item2) {
                    var count;

                    if(lr1item.lookahead === DUMMY && isKernelItem(lr1item)) {
                        count = countSet(item2.lookaheads);
                        item2.lookaheads = union(item2.lookaheads, item1.lookaheads);
                        dirty = count < countSet(item2.lookaheads);
                    }
                });
                return dirty;
            }
        }

        function propagateLookahead() {
            var closureInit = getClosureById(0),
                propagaters = [],
                dirty,
                i;

            eachSet(closureInit, function(item) {
                if(isKernelItem(item)) {
                    item.lookaheads = makeSet(END);
                }
            });
            for(i = 0; i < getClosureNumber(); i++) {
                propagaters[i] = getPropagater(i);
            }
            do {
                dirty = false;
                for(i = 0; i < getClosureNumber(); i++) {
                    dirty = propagaters[i]() || dirty;
                }
            } while(dirty);
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

        function constructLALR() {
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
                        follow1 = item.lookaheads;
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
        propagateLookahead();
        constructLALR();
        //return {
        //    items: lr0,
        //    first: first,
        //    follow: follow,
        //    action: lrAction,
        //    init: lrInit,
        //    closure: closurePool
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
