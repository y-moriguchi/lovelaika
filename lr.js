(function(root) {
    var END = "#$";
    var REGEX_UPPER_STRING = 
        "^[\\u0041-\\u005A\\u00C0-\\u00D6\\u00D8-\\u00DE\\u0100\\u0102\\u0104" +
        "\\u0106\\u0108\\u010A\\u010C\\u010E\\u0110\\u0112\\u0114\\u0116\\u0118" +
        "\\u011A\\u011C\\u011E\\u0120\\u0122\\u0124\\u0126\\u0128\\u012A\\u012C" +
        "\\u012E\\u0130\\u0132\\u0134\\u0136\\u0139\\u013B\\u013D\\u013F\\u0141" +
        "\\u0143\\u0145\\u0147\\u014A\\u014C\\u014E\\u0150\\u0152\\u0154\\u0156" +
        "\\u0158\\u015A\\u015C\\u015E\\u0160\\u0162\\u0164\\u0166\\u0168\\u016A" +
        "\\u016C\\u016E\\u0170\\u0172\\u0174\\u0176\\u0178-\\u0179\\u017B\\u017D" +
        "\\u0181-\\u0182\\u0184\\u0186-\\u0187\\u0189-\\u018B\\u018E-\\u0191" +
        "\\u0193-\\u0194\\u0196-\\u0198\\u019C-\\u019D\\u019F-\\u01A0\\u01A2" +
        "\\u01A4\\u01A6-\\u01A7\\u01A9\\u01AC\\u01AE-\\u01AF\\u01B1-\\u01B3" +
        "\\u01B5\\u01B7-\\u01B8\\u01BC\\u01C4\\u01C7\\u01CA\\u01CD\\u01CF\\u01D1" +
        "\\u01D3\\u01D5\\u01D7\\u01D9\\u01DB\\u01DE\\u01E0\\u01E2\\u01E4\\u01E6" +
        "\\u01E8\\u01EA\\u01EC\\u01EE\\u01F1\\u01F4\\u01F6-\\u01F8\\u01FA\\u01FC" +
        "\\u01FE\\u0200\\u0202\\u0204\\u0206\\u0208\\u020A\\u020C\\u020E\\u0210" +
        "\\u0212\\u0214\\u0216\\u0218\\u021A\\u021C\\u021E\\u0220\\u0222\\u0224" +
        "\\u0226\\u0228\\u022A\\u022C\\u022E\\u0230\\u0232\\u023A-\\u023B" +
        "\\u023D-\\u023E\\u0241\\u0243-\\u0246\\u0248\\u024A\\u024C\\u024E\\u0370" +
        "\\u0372\\u0376\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u038F" +
        "\\u0391-\\u03A1\\u03A3-\\u03AB\\u03CF\\u03D2-\\u03D4\\u03D8\\u03DA" +
        "\\u03DC\\u03DE\\u03E0\\u03E2\\u03E4\\u03E6\\u03E8\\u03EA\\u03EC\\u03EE" +
        "\\u03F4\\u03F7\\u03F9-\\u03FA\\u03FD-\\u042F\\u0460\\u0462\\u0464\\u0466" +
        "\\u0468\\u046A\\u046C\\u046E\\u0470\\u0472\\u0474\\u0476\\u0478\\u047A" +
        "\\u047C\\u047E\\u0480\\u048A\\u048C\\u048E\\u0490\\u0492\\u0494\\u0496" +
        "\\u0498\\u049A\\u049C\\u049E\\u04A0\\u04A2\\u04A4\\u04A6\\u04A8\\u04AA" +
        "\\u04AC\\u04AE\\u04B0\\u04B2\\u04B4\\u04B6\\u04B8\\u04BA\\u04BC\\u04BE" +
        "\\u04C0-\\u04C1\\u04C3\\u04C5\\u04C7\\u04C9\\u04CB\\u04CD\\u04D0\\u04D2" +
        "\\u04D4\\u04D6\\u04D8\\u04DA\\u04DC\\u04DE\\u04E0\\u04E2\\u04E4\\u04E6" +
        "\\u04E8\\u04EA\\u04EC\\u04EE\\u04F0\\u04F2\\u04F4\\u04F6\\u04F8\\u04FA" +
        "\\u04FC\\u04FE\\u0500\\u0502\\u0504\\u0506\\u0508\\u050A\\u050C\\u050E" +
        "\\u0510\\u0512\\u0514\\u0516\\u0518\\u051A\\u051C\\u051E\\u0520\\u0522" +
        "\\u0524\\u0526\\u0531-\\u0556\\u10A0-\\u10C5\\u10C7\\u10CD\\u1E00\\u1E02" +
        "\\u1E04\\u1E06\\u1E08\\u1E0A\\u1E0C\\u1E0E\\u1E10\\u1E12\\u1E14\\u1E16" +
        "\\u1E18\\u1E1A\\u1E1C\\u1E1E\\u1E20\\u1E22\\u1E24\\u1E26\\u1E28\\u1E2A" +
        "\\u1E2C\\u1E2E\\u1E30\\u1E32\\u1E34\\u1E36\\u1E38\\u1E3A\\u1E3C\\u1E3E" +
        "\\u1E40\\u1E42\\u1E44\\u1E46\\u1E48\\u1E4A\\u1E4C\\u1E4E\\u1E50\\u1E52" +
        "\\u1E54\\u1E56\\u1E58\\u1E5A\\u1E5C\\u1E5E\\u1E60\\u1E62\\u1E64\\u1E66" +
        "\\u1E68\\u1E6A\\u1E6C\\u1E6E\\u1E70\\u1E72\\u1E74\\u1E76\\u1E78\\u1E7A" +
        "\\u1E7C\\u1E7E\\u1E80\\u1E82\\u1E84\\u1E86\\u1E88\\u1E8A\\u1E8C\\u1E8E" +
        "\\u1E90\\u1E92\\u1E94\\u1E9E\\u1EA0\\u1EA2\\u1EA4\\u1EA6\\u1EA8\\u1EAA" +
        "\\u1EAC\\u1EAE\\u1EB0\\u1EB2\\u1EB4\\u1EB6\\u1EB8\\u1EBA\\u1EBC\\u1EBE" +
        "\\u1EC0\\u1EC2\\u1EC4\\u1EC6\\u1EC8\\u1ECA\\u1ECC\\u1ECE\\u1ED0\\u1ED2" +
        "\\u1ED4\\u1ED6\\u1ED8\\u1EDA\\u1EDC\\u1EDE\\u1EE0\\u1EE2\\u1EE4\\u1EE6" +
        "\\u1EE8\\u1EEA\\u1EEC\\u1EEE\\u1EF0\\u1EF2\\u1EF4\\u1EF6\\u1EF8\\u1EFA" +
        "\\u1EFC\\u1EFE\\u1F08-\\u1F0F\\u1F18-\\u1F1D\\u1F28-\\u1F2F" +
        "\\u1F38-\\u1F3F\\u1F48-\\u1F4D\\u1F59\\u1F5B\\u1F5D\\u1F5F" +
        "\\u1F68-\\u1F6F\\u1FB8-\\u1FBB\\u1FC8-\\u1FCB\\u1FD8-\\u1FDB" +
        "\\u1FE8-\\u1FEC\\u1FF8-\\u1FFB\\u2102\\u2107\\u210B-\\u210D" +
        "\\u2110-\\u2112\\u2115\\u2119-\\u211D\\u2124\\u2126\\u2128" +
        "\\u212A-\\u212D\\u2130-\\u2133\\u213E-\\u213F\\u2145\\u2183" +
        "\\u2C00-\\u2C2E\\u2C60\\u2C62-\\u2C64\\u2C67\\u2C69\\u2C6B" +
        "\\u2C6D-\\u2C70\\u2C72\\u2C75\\u2C7E-\\u2C80\\u2C82\\u2C84\\u2C86\\u2C88" +
        "\\u2C8A\\u2C8C\\u2C8E\\u2C90\\u2C92\\u2C94\\u2C96\\u2C98\\u2C9A\\u2C9C" +
        "\\u2C9E\\u2CA0\\u2CA2\\u2CA4\\u2CA6\\u2CA8\\u2CAA\\u2CAC\\u2CAE\\u2CB0" +
        "\\u2CB2\\u2CB4\\u2CB6\\u2CB8\\u2CBA\\u2CBC\\u2CBE\\u2CC0\\u2CC2\\u2CC4" +
        "\\u2CC6\\u2CC8\\u2CCA\\u2CCC\\u2CCE\\u2CD0\\u2CD2\\u2CD4\\u2CD6\\u2CD8" +
        "\\u2CDA\\u2CDC\\u2CDE\\u2CE0\\u2CE2\\u2CEB\\u2CED\\u2CF2\\uA640\\uA642" +
        "\\uA644\\uA646\\uA648\\uA64A\\uA64C\\uA64E\\uA650\\uA652\\uA654\\uA656" +
        "\\uA658\\uA65A\\uA65C\\uA65E\\uA660\\uA662\\uA664\\uA666\\uA668\\uA66A" +
        "\\uA66C\\uA680\\uA682\\uA684\\uA686\\uA688\\uA68A\\uA68C\\uA68E\\uA690" +
        "\\uA692\\uA694\\uA696\\uA722\\uA724\\uA726\\uA728\\uA72A\\uA72C\\uA72E" +
        "\\uA732\\uA734\\uA736\\uA738\\uA73A\\uA73C\\uA73E\\uA740\\uA742\\uA744" +
        "\\uA746\\uA748\\uA74A\\uA74C\\uA74E\\uA750\\uA752\\uA754\\uA756\\uA758" +
        "\\uA75A\\uA75C\\uA75E\\uA760\\uA762\\uA764\\uA766\\uA768\\uA76A\\uA76C" +
        "\\uA76E\\uA779\\uA77B\\uA77D-\\uA77E\\uA780\\uA782\\uA784\\uA786\\uA78B" +
        "\\uA78D\\uA790\\uA792\\uA7A0\\uA7A2\\uA7A4\\uA7A6\\uA7A8\\uA7AA" +
        "\\uFF21-\\uFF3A]";
    var REGEX_UPPER = new RegExp(REGEX_UPPER_STRING);

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

    function deepCopy(obj) {
        var i,
            res;

        if(isArray(obj)) {
            res = [];
            for(i = 0; i < obj.length; i++) {
                res[i] = deepCopy(obj[i]);
            }
        } else if(isObject(obj)) {
            res = {};
            for(i in obj) {
                if(obj.hasOwnProperty(i)) {
                    res[i] = deepCopy(obj[i]);
                }
            }
        } else {
            res = obj;
        }
        return res;
    }

    function makeSet(/* args */) {
        var i,
            result = [];

        for(i = 0; i < arguments.length; i++) {
            result = addElement(result, arguments[i]);
        }
        return result;
    }

    function setToArray(aSet) {
        return aSet.slice();
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

    function GenerateParser(inputGrammar) {
        var EPSILON = "#e",
            DUMMY = "#d",
            START = "#S'",
            DEFAULT_TOKEN = "#default",
            grammar,
            first = {},
            follow = {},
            itemPool = {},
            closurePool = [],
            lr0,
            lrAction = [],
            lrInit,
            conflicts = [],
            parser;

        function isNonterminal(symbol) {
            return grammar.nonterminals.indexOf(symbol) >= 0;
        }

        function isTerminal(symbol) {
            return grammar.terminals.indexOf(symbol) >= 0;
        }

        function getOperator(ruleIndex) {
            var rule = grammar.rules[ruleIndex];

            function prec(op) {
                return grammar.precedence && grammar.precedence[ruleIndex] ? grammar.precedence[ruleIndex] : op;
            }

            if(rule[1].length < 2 || rule[1].length > 3) {
                return null;
            } else if(rule[1].length === 2) {
                if(isTerminal(rule[1][0]) && isNonterminal(rule[1][1])) {
                    return prec(rule[1][0]);
                } else if(isTerminal(rule[1][1]) && isNonterminal(rule[1][0])) {
                    return prec(rule[1][1]);
                }
            } else if(rule[1].length === 3) {
                if(isNonterminal(rule[1][0]) && isTerminal(rule[1][1]) && isNonterminal(rule[1][2])) {
                    return prec(rule[1][1]);
                } else {
                    return null;
                }
            }
        }

        function getFirst(symbol) {
            var result;

            if(isTerminal(symbol) || symbol === DUMMY) {
                return makeSet(symbol);
            } else if(isNonterminal(symbol)) {
                result = first[symbol];
                return result ? result : makeSet();
            } else {
                throw new Error("Symbol " + symbol + " not defined");
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
                throw new Error("Symbol " + symbol + " not defined");
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
                throw new Error(symbol + " is not nonterminal");
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

        function reconstructClosurePool() {
            closurePool = deepCopy(closurePool);
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
                    lr0item;

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

            function eachClosure(fn, propagate) {
                eachSet(closure, function(item0) {
                    var closure1;

                    if(isKernelItem(item0)) {
                        closure1 = computeClosureLR1(makeSet(makeItemLookahead(item0.ruleIndex, item0.mark, DUMMY)));
                        eachSet(closure1, function(item) {
                            if(propagate) {
                                eachSet(closure, function(itemPropagate) {
                                    var lr0item;

                                    if(!isKernelItem(itemPropagate) && itemPropagate.rule[0] === getItemSymbol(item)) {
                                        lr0item = searchItemFromClosurePool(itemId, item);
                                        itemPropagate.lookaheads = union(itemPropagate.lookaheads, lr0item.lookaheads);
                                    }
                                });
                            }
                            eachItemPropagate(item, fn);
                        });
                    }
                });
            }

            eachClosure(function(toId, lr1item, item1, item2) {
                var nextItem;

                if(lr1item.lookahead !== DUMMY && item2.ruleIndex === lr1item.ruleIndex && getItemSymbol(lr1item) === getBackItemSymbol(item2)) {
                    item2.lookaheads = addElement(item2.lookaheads, lr1item.lookahead);
                }
            });
            return function() {
                var dirty = false;

                eachClosure(function(toId, lr1item, item1, item2) {
                    var count;

                    if(lr1item.lookahead === DUMMY && item2.ruleIndex === lr1item.ruleIndex && getItemSymbol(lr1item) === getBackItemSymbol(item2)) {
                        count = countSet(item2.lookaheads);
                        item2.lookaheads = union(item2.lookaheads, item1.lookaheads);
                        dirty = count < countSet(item2.lookaheads);
                    }
                }, true);
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

        function getOperatorPrecedence(op) {
            var i;

            if(!grammar.operators) {
                return null;
            }
            for(i = 0; i < grammar.operators.length; i++) {
                if(grammar.operators[i].operators.indexOf(op) >= 0) {
                    return i;
                }
            }
            return null;
        }

        function compareOperator(op1, op2) {
            var prec1 = getOperatorPrecedence(op1),
                prec2 = getOperatorPrecedence(op2);

            if(prec1 === null || prec2 === null) {
                return null;
            } else if(prec1 < prec2) {
                return -1;
            } else if(prec1 > prec2) {
                return 1;
            } else if(grammar.operators[prec1].assoc === "left") {
                return -1;
            } else if(grammar.operators[prec1].assoc === "right") {
                return 1;
            } else {
                return null;
            }
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

        function addActionShift(state, symbol, stateTo, ruleIndex) {
            var rule = grammar.rules[ruleIndex],
                action1 = lrAction[state],
                op1,
                op2,
                prec;

            if(!action1) {
                action1 = {};
                lrAction[state] = action1;
            } else if(action1[symbol]) {
                if(action1[symbol][0] === "reduce") {
                    op1 = getOperator(action1[symbol][2]);
                    op2 = getOperator(ruleIndex);
                    prec = compareOperator(op1, op2);
                    if(prec === null) {
                        conflicts.push({
                            type: "shift-reduce",
                            shiftState: stateTo,
                            reduceRule: action1[symbol][2]
                        });
                    } else if(prec < 0) {
                        return;
                    }
                } else {
                    return;
                }
            }
            action1[symbol] = ["shift", stateTo, ruleIndex];
        }

        function addActionReduce(state, symbol, ruleIndex) {
            var rule = grammar.rules[ruleIndex],
                action1 = lrAction[state];

            if(!action1) {
                action1 = {};
                lrAction[state] = action1;
            } else if(action1[symbol]) {
                if(action1[symbol][0] === "shift") {
                    op1 = getOperator(ruleIndex);
                    op2 = getOperator(action1[symbol][2]);
                    prec = compareOperator(op1, op2);
                    if(prec === null) {
                        conflicts.push({
                            type: "shift-reduce",
                            shiftState: state,
                            reduceRule: ruleIndex
                        });
                        return;  // shift
                    } else if(prec < 0) {
                        return;
                    }
                } else {
                    conflicts.push({
                        type: "reduce-reduce",
                        reduceRule1: action1[symbol][1],
                        reduceRule2: ruleIndex
                    });
                }
            }
            action1[symbol] = ["reduce", ruleIndex, ruleIndex];
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
                            addActionShift(i, itemSymbol, lr0.fa[i][itemSymbol], item.ruleIndex);
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

        function modifyLALR() {
            var i,
                reduceRuleIndex;

            function getSameReduce(ruleNo) {
                var i,
                    reduceRuleIndex = null;

                for(i in lrAction[ruleNo]) {
                    if(lrAction[ruleNo].hasOwnProperty(i)) {
                        if(lrAction[ruleNo][i][0] === "reduce") {
                            if(reduceRuleIndex === null) {
                                reduceRuleIndex = lrAction[ruleNo][i][1];
                            } else if(reduceRuleIndex !== lrAction[ruleNo][i][1]) {
                                return null;
                            }
                        } else {
                            return null;
                        }
                    }
                }
                return reduceRuleIndex;
            }

            for(i = 0; i < lrAction.length; i++) {
                reduceRuleIndex = getSameReduce(i);
                if(reduceRuleIndex !== null) {
                    lrAction[i][DEFAULT_TOKEN] = [
                        "reduce",
                        reduceRuleIndex,
                        reduceRuleIndex
                    ];
                }
            }
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

                function reduceAction() {
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
                }

                function reduceDefaultAction() {
                    stackTop = stack[stack.length - 1];
                    anAction = getAction(stackTop, DEFAULT_TOKEN);
                    if(anAction && anAction[0] === "reduce") {
                        reduceAction();
                        reduceDefaultAction();
                    }
                }

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
                    reduceDefaultAction();
                } else if(anAction[0] === "reduce") {
                    reduceAction();
                    return step(token, attr);
                } else if(anAction[0] === "accept") {
                    ended = true;
                    return semanticsStack[0];
                }
                return null;
            };
            return step;
        }

        function formatGrammar(inputGrammar) {
            var result = {},
                i;

            function isNonterminal(symbol) {
                return symbol === START || REGEX_UPPER.test(symbol);
            }

            function checkValidSymbol(symbol) {
                if(symbol !== START && /^#[\s\S]/.test(symbol)) {
                    throw new Error("Invalid symbol: " + symbol);
                }
            }

            function scanSymbol(rules) {
                var terminals = makeSet(),
                    nonterminals = makeSet(),
                    i,
                    j;

                for(i = 0; i < rules.length; i++) {
                    if(!isNonterminal(rules[i][0])) {
                        throw new Error("Left value of rule must be nonterminal: " + rules[i][0]);
                    }
                    nonterminals = addElement(nonterminals, rules[i][0]);
                    for(j = 0; j < rules[i][1].length; j++) {
                        if(isNonterminal(rules[i][1][j])) {
                            nonterminals = addElement(nonterminals, rules[i][1][j]);
                        } else {
                            terminals = addElement(terminals, rules[i][1][j]);
                        }
                    }
                }
                eachSet(terminals, checkValidSymbol);
                eachSet(nonterminals, checkValidSymbol);
                result.terminals = setToArray(terminals);
                result.nonterminals = setToArray(nonterminals);
            }

            if(!isNonterminal(inputGrammar.start)) {
                throw new Error("Start symbol must be nonterminal: " + rules[i][0]);
            }
            result.rules = [[START, [inputGrammar.start]]];
            result.precedence = [];
            for(i = 0; i < inputGrammar.rules.length; i++) {
                if(isArray(inputGrammar.rules[i])) {
                    result.rules[i + 1] = inputGrammar.rules[i];
                } else if(isObject(inputGrammar.rules[i])) {
                    result.rules[i + 1] = inputGrammar.rules[i].rule.concat([inputGrammar.rules[i].action]);
                    if(inputGrammar.rules[i].precedence) {
                        result.precedence[i + 1] = inputGrammar.rules[i].precedence;
                    }
                } else {
                    throw new Error("Invalid rule: " + inputGrammar.rules[i]);
                }
            }
            result.operators = inputGrammar.operators;
            scanSymbol(result.rules);
            return result;
        }

        grammar = formatGrammar(inputGrammar);
        initFirst();
        initFollow();
        lr0 = computeItem(makeItem(0, 0));
        reconstructClosurePool();
        propagateLookahead();
        constructLALR();
        modifyLALR();
        //return {
        //    items: lr0,
        //    first: first,
        //    follow: follow,
        //    action: lrAction,
        //    init: lrInit,
        //    closure: closurePool
        //};
        parser = createLRParser();
        return {
            parser: parser,
            conflicts: conflicts
        };
    }

    if(typeof module !== "undefined" && module.exports) {
        module.exports = {
            parser: GenerateParser,
            END: END
        };
    } else {
        root["LR"] = {
            parser: GenerateParser,
            END: END
        };
    }
})(this);
