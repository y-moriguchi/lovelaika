(function(root) {
    function Rena4(option) {
        var me;

        function memorize(fn) {
            var memo = {};

            return function(match, index) {
                if(!memo[match] || !memo[match][index]) {
                    if(!memo[match]) {
                        memo[match] = {};
                    }
                    memo[match][index] = fn(match, index);
                }
                return memo[match][index];
            };
        }

        function wrap(anObject) {
            var regex,
                reSource,
                reFlags = "g";
 
            if(typeof anObject === "string") {
                return memorize(function(match, index) {
                    if(anObject === match.substring(index, index + anObject.length)) {
                        return {
                            match: anObject,
                            lastIndex: index + anObject.length,
                            attr: anObject
                        };
                    } else {
                        return null;
                    }
                });
            } else if(anObject instanceof RegExp) {
                reSource = anObject.source;
                reFlags += anObject.ignoreCase ? "i" : "";
                reFlags += anObject.multiline ? "m" : "";
                regex = new RegExp(reSource, reFlags);
                return memorize(function(match, index) {
                    var match;

                    regex.lastIndex = 0;
                    if(!!(match = regex.exec(match.substring(index))) && match.index === 0) {
                        return {
                            match: match[0],
                            lastIndex: index + regex.lastIndex,
                            attr: match[0]
                        };
                    } else {
                        return null;
                    }
                });
            } else {
                return anObject;
            }
        }

        function wrapObjects(objects) {
            var result = [], i;

            for(i = 0; i < objects.length; i++) {
                result.push(wrap(objects[i]));
            }
            return result;
        }

        function zeroOrMore() {
            return function(exp, action) {
                var wrapped = wrap(exp),
                    wrappedAction = action ? action : function(x) { return x; };

                return memorize(function(match, index) {
                    var indexNew = index,
                        attrs = [],
                        result,
                        i;

                    while(true) {
                        result = exp(match, indexNew);
                        if(result) {
                            indexNew = result.lastIndex;
                            attrs.push(result.attr);
                        } else {
                            return {
                                match: match.substring(index, indexNew),
                                lastIndex: indexNew,
                                attr: wrappedAction.call(null, attrs)
                            };
                        }
                    }
                });
            };
        }

        function rule() {
            return function(/* args */) {
                var exps = wrapObjects(Array.prototype.slice.call(arguments, 0, -1)),
                    action = arguments[arguments.length - 1];

                return memorize(function(match, index) {
                    var indexNew = index,
                        attrs = [],
                        result,
                        i;

                    for(i = 0; i < exps.length; i++) {
                        result = exps[i](match, indexNew);
                        if(result) {
                            indexNew = result.lastIndex;
                            attrs.push(result.attr);
                        } else {
                            return null;
                        }
                    }
                    return {
                        match: match.substring(index, indexNew),
                        lastIndex: indexNew,
                        attr: action.apply(null, attrs)
                    };
                });
            };
        }

        function chainOperatorRest(first, op, operand, applier) {
            return me.choice(
                me.then(op, function(opvalue) {
                    return me.then(operand, function(operandValue) {
                        return chainOperatorRest(applier(opvalue, first, operandValue), op, operand, applier);
                    });
                }),
                me.rule("", function(x) { return first; }));
        }

        me = {
            rule: rule(),

            zeroOrMore: zeroOrMore(),

            choice: function(/* args */) {
                var args = wrapObjects(Array.prototype.slice.call(arguments));

                return memorize(function(match, index) {
                    var result, i;

                    for(i = 0; i < args.length; i++) {
                        result = args[i](match, index);
                        if(result) {
                            return result;
                        }
                    }
                    return null;
                });
            },

            then: function(first, /* args */) {
                var wrappedFirst = wrap(first),
                    rest = wrapObjects(Array.prototype.slice.call(arguments, 1));

                return memorize(function(match, index) {
                    var result,
                        indexNew,
                        i;

                    result = wrappedFirst(match, index);
                    if(result) {
                        indexNew = result.lastIndex;
                        for(i = 0; i < rest.length; i++) {
                            result = rest[i](result.attr)(match, indexNew);
                            if(result) {
                                indexNew = result.lastIndex;
                            } else {
                                return null;
                            }
                        }
                        return {
                            match: match.substring(index, indexNew),
                            lastIndex: indexNew,
                            attr: result.attr
                        };
                    } else {
                        return null;
                    }
                });
            },

            chainOperator: function(op, operand, applier) {
                return me.then(operand, function(first) {
                    return chainOperatorRest(first, op, operand, applier);
                })
            },

            letrec: function(/* args */) {
                var l = Array.prototype.slice.call(arguments),
                    delays = [],
                    memo = [],
                    i;

                for(i = 0; i < l.length; i++) {
                    (function(i) {
                        delays.push(memorize(function(match, index) {
                            if(!memo[i]) {
                                memo[i] = l[i].apply(null, delays);
                            }
                            return memo[i](match, index);
                        }));
                    })(i);
                }
                return delays[0];
            }
        };
        return me;
    }

    if(typeof module !== "undefined" && module.exports) {
        module.exports = Rena4;
    } else {
        root["Rena4"] = Rena4;
    }
})(this);

