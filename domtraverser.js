(function(root) {
    var ELEMENT_NODE = 1,
        TEXT_NODE = 3,
        CDATA_SECTION_NODE = 4,
        COMMENT_NODE = 8,
        defaultOption = { skipComment: true, skipBlank: true },
        undef = void 0;

    function DomT(option) {
        var me,
            opt = option ? option : defaultOption,
            skipComment = opt.skipComment === undef ? true : opt.skipComment,
            skipBlank = opt.skipBlank === undef ? true : opt.skipBlank;

        function isSkipNode(node) {
            return node !== null &&
                   ((skipComment && node.nodeType === COMMENT_NODE) ||
                    (skipBlank && node.nodeType === TEXT_NODE && /[ \t\n]+/.test(node.nodeValue)));
        }

        me = {
            nextSibling: function() {
                return function(valid, node, attr) {
                    var sibling = node;

                    do {
                        sibling = sibling.nextSibling;
                    } while(isSkipNode(sibling));
                    if(!valid || sibling === null) {
                        return null;
                    } else {
                        return {
                            valid: true,
                            node: sibling,
                            attr: attr
                        };
                    }
                };
            },

            firstChild: function() {
                return function(valid, node, attr) {
                    var child = node.firstChild;

                    while(isSkipNode(child)) {
                        child = child.nextSibling;
                    }
                    if(!valid || child === null) {
                        return null;
                    } else {
                        return {
                            valid: true,
                            node: child,
                            attr: attr
                        };
                    }
                };
            },

            element: function(name, caseSensitive) {
                var nameCase = caseSensitive ? name.toUpperCase() : name;

                return function(valid, node, attr) {
                    var nodeNameCase;

                    if(!valid || node === null || node.nodeType !== ELEMENT_NODE) {
                        return null;
                    } else {
                        nodeNameCase = caseSensitive ? node.nodeName.toUpperCase() : node.nodeName;
                        if(nodeNameCase === nameCase) {
                            return {
                                valid: true,
                                node: node,
                                attr: attr
                            };
                        } else {
                            return null;
                        }
                    }
                };
            },

            text: function() {
                return function(valid, node, attr) {
                    if(!valid) {
                        return null;
                    } else if(node.nodeType === TEXT_NODE || node.nodeType === CDATA_SECTION_NODE) {
                        return {
                            valid: false,
                            node: null,
                            attr: attr
                        };
                    } else {
                        return null;
                    }
                }
            },

            attribute: function(name, action) {
                return function(valid, node, attr) {
                    var domAttr;

                    if(!valid || node.nodeType !== ELEMENT_NODE) {
                        return null;
                    } else {
                        domAttr = node.attributes.getNamedItem(name);
                        if(domAttr === null) {
                            return null;
                        } else {
                            return {
                                valid: true,
                                node: node,
                                attr: action(domAttr.value, attr)
                            }
                        }
                    }
                };
            },

            letrec: function(/* args */) {
                var l = Array.prototype.slice.call(arguments),
                    delays = [],
                    memo = [],
                    i;

                for(i = 0; i < l.length; i++) {
                    (function(i) {
                        delays.push(function(valid, node, attr) {
                            if(!memo[i]) {
                                memo[i] = l[i].apply(null, delays);
                            }
                            return memo[i](valid, node, attr);
                        });
                    })(i);
                }
                return delays[0];
            },

            eachChild: function(exp) {
                return function(valid, node, attr) {
                    var validNew = valid,
                        nodeNew = node.firstChild,
                        attrNew = attr,
                        result;

                    while(isSkipNode(nodeNew)) {
                        nodeNew = nodeNew.nextSibling;
                    }
                    while(nodeNew !== null) {
                        if((result = exp(validNew, nodeNew, attrNew)) !== null) {
                            validNew = result.valid;
                            nodeNew = result.node.nextSibling;
                            attrNew = result.attr;
                            while(isSkipNode(nodeNew)) {
                                nodeNew = nodeNew.nextSibling;
                            }
                        } else {
                            return null;
                        }
                    }
                    return {
                        valid: valid,
                        node: node,
                        attr: attrNew
                    };
                };
            },

            preserve: function(exp) {
                return me.and(exp);
            },

            next: function(/* args */) {
                var exps = Array.prototype.slice.call(arguments);

                return function(valid, node, attr) {
                    var result,
                        validNew = valid,
                        nodeNew = node,
                        attrNew = attr,
                        i;

                    for(i = 0; i < exps.length; i++) {
                        if((result = exps[i](validNew, nodeNew, attrNew)) !== null) {
                            validNew = result.valid;
                            nodeNew = result.node;
                            attrNew = result.attr;
                        } else {
                            return null;
                        }
                    }
                    return {
                        valid: validNew,
                        node: nodeNew,
                        attr: attrNew
                    };
                };
            },

            and: function(/* args */) {
                var exps = Array.prototype.slice.call(arguments);

                return function(valid, node, attr) {
                    var result,
                        attrNew = attr,
                        i;

                    for(i = 0; i < exps.length; i++) {
                        if((result = exps[i](valid, node, attrNew)) !== null) {
                            attrNew = result.attr;
                        } else {
                            return null;
                        }
                    }
                    return {
                        valid: valid,
                        node: node,
                        attr: attrNew
                    };
                };
            },

            choice: function(/* args */) {
                var exps = Array.prototype.slice.call(arguments);

                return function(valid, node, attr) {
                    var result,
                        i;

                    for(i = 0; i < exps.length; i++) {
                        if((result = exps[i](valid, node, attr)) !== null) {
                            return result;
                        }
                    }
                    return null;
                };
            },

            action: function(exp, action) {
                return function(valid, node, attr) {
                    var result;

                    if((result = exp(valid, node, attr)) !== null) {
                        return {
                            valid: result.valid,
                            node: result.node,
                            attr: action(node, result.attr, attr)
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
        module.exports = DomT;
    } else {
        root["DomT"] = DomT;
    }
})(this);

