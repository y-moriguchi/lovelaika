(function(root) {
    function NFA() {
        function genState() {
            return {};
        }

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

        function containsSet(aSet, element) {
            return aSet.indexOf(element) >= 0;
        }

        function isEmptySet(aSet) {
            return aSet.length === 0;
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

        function singleCharNFA(ch) {
            var me,
                start = genState(),
                end = genState(),
                chFn = typeof ch === "string" ? function(testCh) { return testCh === ch; } : ch;

            me = {
                init: start,
                accept: makeSet(end),

                containsState: function(state) {
                    return state === start || state === end;
                },

                transit: function(state, transCh) {
                    if(state === start && chFn(transCh)) {
                        return makeSet(end);
                    } else {
                        return makeSet();
                    }
                }
            };
            return me;
        }

        function concatNFA(/* args */) {
            var args = Array.prototype.slice.call(arguments),
                me;

            if(args.length === 0) {
                throw new Error("At least one NFA required");
            } else if(args.length === 1) {
                return args[0];
            }
            me = {
                init: args[0].init,
                accept: args[args.length - 1].accept,

                containsState: function(state) {
                    var i;

                    for(i = 0; i < args.length; i++) {
                        if(args[i].containsState(state)) {
                            return true;
                        }
                    }
                    return false;
                },

                transit: function(state, transCh) {
                    var i,
                        result;

                    for(i = 0; i < args.length; i++) {
                        if(args[i].containsState(state)) {
                            result = args[i].transit(state, transCh);
                            if(isIntersect(args[i].accept, result) && i < args.length - 1) {
                                result = addElement(result, args[i + 1].init);
                            }
                            return result;
                        }
                    }
                    return makeSet();
                }
            };
            return me;
        }

        function alterNFA(/* args */) {
            var args = Array.prototype.slice.call(arguments),
                start = genState(),
                accept = makeSet(),
                i,
                me;

            if(args.length === 0) {
                throw new Error("At least one NFA requried");
            } else if(args.length === 1) {
                return args[0];
            }

            for(i = 0; i < args.length; i++) {
                accept = union(accept, args[i].accept);
            }
            me = {
                init: start,
                accept: accept,

                containsState: function(state) {
                    var i;

                    if(state === start) {
                        return true;
                    }
                    for(i = 0; i < args.length; i++) {
                        if(args[i].containsState(state)) {
                            return true;
                        }
                    }
                    return false;
                },

                transit: function(state, transCh) {
                    var i,
                        result = makeSet();

                    if(state === start) {
                        for(i = 0; i < args.length; i++) {
                            result = union(result, args[i].transit(args[i].init, transCh));
                        }
                        return result;
                    } else {
                        for(i = 0; i < args.length; i++) {
                            if(args[i].containsState(state)) {
                                return args[i].transit(state, transCh);
                            }
                        }
                        return makeSet();
                    }
                }
            };
            return me;
        }

        function repeatNFA(nfa, nullable, repeatable) {
            var me;

            me = {
                init: nfa.init,
                accept: nullable ? union(makeSet(nfa.init), nfa.accept) : nfa.accept,

                containsState: function(state) {
                    return nfa.containsState(state);
                },

                transit: function(state, transCh) {
                    var result,
                        i;

                    if(state === nfa.init) {
                        result = nfa.transit(nfa.init, transCh);
                        if(nullable) {
                            result = union(result, flatMapSet(nfa.accept, function(state) {
                                return nfa.transit(state, transCh);
                            }));
                        }
                    } else if(nfa.containsState(state)) {
                        result = nfa.transit(state, transCh);
                    } else {
                        return makeSet();
                    }
                    if(isIntersect(nfa.accept, result)) {
                        result = addElement(result, nfa.init);
                        if(repeatable) {
                            result = union(result, nfa.transit(nfa.init, transCh));
                        }
                    }
                    return result;
                }
            };
            return me;
        }

        function parallelNFA(/* args */) {
            var args = Array.prototype.slice.call(arguments),
                start = genState(),
                accept = makeSet(),
                i,
                me;

            for(i = 0; i < args.length; i++) {
                accept = union(accept, args[i].accept);
            }
            me = {
                init: start,
                accept: accept,

                containsState: function(state) {
                    var i;

                    if(state === start) {
                        return true;
                    }
                    for(i = 0; i < args.length; i++) {
                        if(args[i].containsState(state)) {
                            return true;
                        }
                    }
                    return false;
                },

                transit: function(state, transCh) {
                    var i,
                        result = makeSet();

                    if(state === start) {
                        for(i = 0; i < args.length; i++) {
                            result = union(result, args[i].transit(args[i].init, transCh));
                        }
                        return result;
                    } else {
                        for(i = 0; i < args.length; i++) {
                            if(args[i].containsState(state)) {
                                return args[i].transit(state, transCh);
                            }
                        }
                        return makeSet();
                    }
                }
            };
            return me;
        }

        function parseRegex(regex) {
            function parseAlter(index) {
                var concat = parseConcat(index),
                    result;

                if(regex.charAt(concat.index) === "|") {
                    result = parseAlter(concat.index + 1);
                    return {
                        index: result.index,
                        attr: alterNFA(concat.attr, result.attr)
                    };
                } else {
                    return concat;
                }
            }

            function parseConcat(index) {
                var star = parseStar(index),
                    result;

                if(/^[^\|\(\)]$/.test(regex.charAt(star.index))) {
                    result = parseConcat(star.index);
                    return {
                        index: result.index,
                        attr: concatNFA(star.attr, result.attr)
                    };
                } else {
                    return star;
                }
            }

            function parseStar(index) {
                var element = parseElement(index),
                    ch = regex.charAt(element.index);

                if(ch === "*") {
                    return {
                        index: element.index + 1,
                        attr: repeatNFA(element.attr, true, true)
                    };
                } else if(ch === "+") {
                    return {
                        index: element.index + 1,
                        attr: repeatNFA(element.attr, false, true)
                    };
                } else if(ch === "?") {
                    return {
                        index: element.index + 1,
                        attr: repeatNFA(element.attr, true, false)
                    };
                } else {
                    return element;
                }
            }

            function parseElement(index) {
                var ch = regex.charAt(index),
                    result;

                if(ch === "(") {
                    result = parseAlter(index + 1);
                    if(regex.charAt(result.index) !== ")") {
                        throw new Error("Invalid regex");
                    }
                    return {
                        index: result.index + 1,
                        attr: result.attr
                    };
                } else if(ch === ".") {
                    return {
                        index: result.index + 1,
                        attr: singleCharNFA(function(ch) { return ch !== "\n" || ch !== "\r"; })
                    };
                } else if(ch === "[") {
                    result = parseCharSetList(index + 1);
                    return {
                        index: result.index,
                        attr: singleCharNFA(result.attr)
                    };
                } else if(!!(result = parsePredefinedSet(index))) {
                    return result;
                } else {
                    result = parseOneChar(index);
                    return {
                        index: result.index,
                        attr: singleCharNFA(result.attr)
                    };
                }
            }

            function parseCharSet(index) {
                var result;

                if(regex.charAt(index) === "^") {
                    result = parseCharSetList(index + 1);
                    return {
                        index: result.index,
                        attr: function(ch) { return !result.attr(ch); }
                    };
                } else {
                    return parseCharSetList(index);
                }
            }

            function parseCharSetList(index) {
                var charSet,
                    result;

                if(regex.charAt(index) === "]") {
                    return {
                        index: index + 1,
                        attr: function(x) { return false; }
                    };
                } else {
                    charSet = parseCharSet1(index);
                    result = parseCharSetList(charSet.index);
                    return {
                        index: result.index,
                        attr: function(ch) {
                            return charSet.attr(ch) || result.attr(ch);
                        }
                    };
                }
            }

            function parseCharSet1(index) {
                var char1,
                    char2,
                    chcode1,
                    chcode2;

                char1 = parseOneChar(index);
                if(regex.charAt(char1.index) === "-") {
                    char2 = parseOneChar(char1.index + 1);
                    chcode1 = char1.attr.charCodeAt(0);
                    chcode2 = char2.attr.charCodeAt(0);
                    return {
                        index: char2.index,
                        attr: function(ch) {
                            var chcode = ch.charCodeAt(0);

                            return chcode >= chcode1 && chcode <= chcode2;
                        }
                    };
                } else {
                    return {
                        index: char1.index,
                        attr: function(ch) {
                            return chcode === char1.attr;
                        }
                    };
                }
            }

            function parsePredefinedSet(index) {
                var ch2;

                function ret1(fn) {
                    return {
                        index: index + 2,
                        attr: singleCharNFA(fn)
                    };
                }

                if(regex.charAt(index) === "\\") {
                    if(index + 1 >= regex.length) {
                        throw new Error("Invalid regex");
                    }
                    ch2 = regex.charAt(index + 1);
                    if(ch2 === "d") {
                        return ret1(function(ch) { return /\d/.test(ch); });
                    } else if(ch2 === "D") {
                        return ret1(function(ch) { return /\D/.test(ch); });
                    } else if(ch2 === "w") {
                        return ret1(function(ch) { return /\w/.test(ch); });
                    } else if(ch2 === "W") {
                        return ret1(function(ch) { return /\W/.test(ch); });
                    } else if(ch2 === "s") {
                        return ret1(function(ch) { return /\s/.test(ch); });
                    } else if(ch2 === "S") {
                        return ret1(function(ch) { return /\S/.test(ch); });
                    } else {
                        return null;
                    }
                } else {
                    return null;
                }
            }

            function parseOneChar(index) {
                var ch = regex.charAt(index),
                    ch2,
                    result;

                function ret1(ch) {
                    return {
                        index: index + 2,
                        attr: ch
                    };
                }

                if(ch === "\\") {
                    if(index + 1 >= regex.length) {
                        throw new Error("Invalid regex");
                    }
                    ch2 = regex.charAt(index + 1);
                    if(ch2 === "n") {
                        return ret1("\n");
                    } else if(ch2 === "r") {
                        return ret1("\r");
                    } else if(ch2 === "t") {
                        return ret1("\t");
                    } else if(ch2 === "f") {
                        return ret1("\f");
                    } else if(ch2 === "b") {
                        return ret1("\b");
                    } else if(ch2 === "v") {
                        return ret1("\v");
                    } else if(ch2 === "u") {
                        if(index + 5 >= regex.length) {
                            throw new Error("Invalid regex");
                        }
                        return {
                            index: index + 5,
                            attr: String.fromCharCode(parseInt(string.substring(index + 1, index + 5)))
                        };
                    } else {
                        return ret1(ch2);
                    }
                } else {
                    return {
                        index: index + 1,
                        attr: ch
                    };
                }
            }
            return parseAlter(0).attr;
        }

        function makeRule(pattern, action) {
            return {
                pattern: parseRegex(pattern),
                action: action
            };
        }

        function Push(cond) {
            this.cond = cond;
        }

        function Pop() {}

        function makeEngine(schema, initCond) {
            var nfas = [],
                parallels = {},
                states,
                cond = initCond,
                condStack = [initCond],
                resultString = "",
                rules,
                i,
                j;

            function isAccept(nfa, states) {
                return foldSet(states, function(state, acc) { return acc || containsSet(nfa.accept, state); }, false);
            }

            function transitStates(nfa, states, ch) {
                return flatMapSet(states, function(state) {
                    return nfa.transit(state, ch);
                });
            }

            function resetState(cond) {
                resultString = "";
                states = makeSet(parallels[cond].init);
            }

            function step(ch) {
                var statesNew,
                    i,
                    condNew;

                if(resultString === "\u0000") {
                    throw new Error("Already reached EOF");
                } else if(condStack.length === 0) {
                    throw new Error("Condition stack has already been empty");
                }

                statesNew = transitStates(parallels[cond], states, ch);
                if(isEmptySet(statesNew)) {
                    if(resultString === "") {
                        throw new Error("Syntax Error");
                    }

                    for(i = 0; i < rules[cond].rules.length; i++) {
                        if(isAccept(rules[cond].rules[i].pattern, states)) {
                            condNew = rules[cond].rules[i].action(resultString);
                            if(condNew instanceof Push) {
                                condStack.push(condNew.cond);
                            } else if(condNew instanceof Pop) {
                                condStack.pop();
                            } else if(condNew !== void 0) {
                                condStack.pop();
                                condStack.push(condNew);
                            }

                            if(condStack.length === 0) {
                                return;
                            } else if(cond !== condStack[condStack.length - 1]) {
                                cond = condStack[condStack.length - 1];
                                if(rules[cond].trigger) {
                                    rules[cond].trigger();
                                }
                            }

                            resetState(cond);
                            if(ch !== "\u0000") {
                                return step(ch);
                            } else {
                                return;
                            }
                        }
                    }
                    throw new Error("Internal Error");
                } else if(isAccept(parallels[cond], statesNew)) {
                    resultString += ch;
                    states = statesNew;
                } else {
                    throw new Error("Syntax Error");
                }
            }

            rules = {};
            for(i in schema) {
                if(schema.hasOwnProperty(i)) {
                    rules[i] = {};
                    rules[i].rules = flatArray(schema[i].rules);
                    rules[i].trigger = schema[i].trigger;
                }
            }

            for(i in rules) {
                if(rules.hasOwnProperty(i)) {
                    for(j = 0; j < rules[i].rules.length; j++) {
                        nfas = nfas.concat(rules[i].rules[j].pattern);
                    }
                    parallels[i] = parallelNFA.apply(null, nfas);
                }
            }
            resetState(initCond);
            return step;
        }

        return {
            rule: makeRule,
            create: makeEngine,
            EOF: "\u0000",
            push: function(cond) { return new Push(cond); },
            pop: function() { return new Pop(); }
        };
    }

    if(typeof module !== "undefined" && module.exports) {
        module.exports = NFA();
    } else {
        root["NFA"] = NFA();
    }
})(this);
