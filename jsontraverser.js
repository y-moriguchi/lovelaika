(function(root) {
    function Traverser() {
        var me;

        me = {
            key: function(key) {
                return function(valid, pointer, attr) {
                    if(!valid || pointer === null || typeof pointer !== "object") {
                        return null;
                    } else if(pointer.hasOwnProperty(key)) {
                        return {
                            valid: true,
                            pointer: pointer[key],
                            attr: attr
                        };
                    } else {
                        return null;
                    }
                };
            },

            eachArray: function(exp) {
                return function(valid, pointer, attr) {
                    var i,
                        attrNew = attr,
                        result;

                    if(!valid || pointer === null || typeof pointer !== "object") {
                        return null;
                    } else if(typeof pointer.length !== "number") {
                        return null;
                    } else {
                        for(i = 0; i < pointer.length; i++) {
                            result = exp(valid, pointer[i], attrNew);
                            if(result === null) {
                                return null;
                            } else {
                                attrNew = result.attr;
                            }
                        }
                        return {
                            valid: true,
                            pointer: pointer,
                            attr: attrNew
                        };
                    }
                };
            },

            atom: function(pred) {
                return function(valid, pointer, attr) {
                    if(!valid || (typeof pointer === "object" && pointer !== null)) {
                        return null;
                    } else if(pred(pointer)) {
                        return {
                            valid: false,
                            pointer: null,
                            attr: attr,
                        };
                    } else {
                        return null;
                    }
                };
            },

            typeString: function() {
                return me.atom(function(x) { return typeof x === "string"; });
            },

            typeFunction: function() {
                return me.atom(function(x) { return typeof x === "function"; });
            },

            typeNumber: function() {
                return me.atom(function(x) { return typeof x === "number"; });
            },

            typeBoolean: function() {
                return me.atom(function(x) { return x === true || x === false; });
            },

            eqv: function(value) {
                return me.atom(function(x) { return x === value; });
            },

            letrec: function(/* args */) {
                var l = Array.prototype.slice.call(arguments),
                    delays = [],
                    memo = [],
                    i;

                for(i = 0; i < l.length; i++) {
                    (function(i) {
                        delays.push(function(valid, pointer, attr) {
                            if(!memo[i]) {
                                memo[i] = l[i].apply(null, delays);
                            }
                            return memo[i](valid, pointer, attr);
                        });
                    })(i);
                }
                return delays[0];
            },

            preserve: function(exp) {
                return me.and(exp);
            },

            next: function(/* args */) {
                var exps = Array.prototype.slice.call(arguments);

                return function(valid, pointer, attr) {
                    var result,
                        validNew = valid,
                        pointerNew = pointer,
                        attrNew = attrNew,
                        i;

                    for(i = 0; i < exps.length; i++) {
                        if((result = exps[i](validNew, pointerNew, attrNew)) !== null) {
                            validNew = result.valid;
                            pointerNew = result.pointer;
                            attrNew = result.attr;
                        } else {
                            return null;
                        }
                    }
                    return {
                        valid: validNew,
                        pointer: pointerNew,
                        attr: attrNew
                    };
                };
            },

            and: function(/* args */) {
                var exps = Array.prototype.slice.call(arguments);

                return function(valid, pointer, attr) {
                    var result,
                        attrNew = attr,
                        i;

                    for(i = 0; i < exps.length; i++) {
                        if((result = exps[i](valid, pointer, attrNew)) !== null) {
                            attrNew = result.attr;
                        } else {
                            return null;
                        }
                    }
                    return {
                        valid: valid,
                        pointer: pointer,
                        attr: attrNew
                    };
                };
            },

            choice: function(/* args */) {
                var exps = Array.prototype.slice.call(arguments);

                return function(valid, pointer, attr) {
                    var result,
                        i;

                    for(i = 0; i < exps.length; i++) {
                        if((result = exps[i](valid, pointer, attr)) !== null) {
                            return result;
                        }
                    }
                    return null;
                };
            },

            action: function(exp, action) {
                return function(valid, pointer, attr) {
                    var result;

                    if((result = exp(valid, pointer, attr)) !== null) {
                        return {
                            valid: result.valid,
                            pointer: result.pointer,
                            attr: action(pointer, result.attr, attr)
                        };
                    } else {
                        return null;
                    }
                };
            }
        };
        return me;
    }

    if(typeof module !== "undefined" && module.exports) {
        module.exports = Traverser;
    } else {
        root["Traverser"] = Traverser;
    }
})(this);

