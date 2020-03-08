/*
 * This test case is described for Jasmine.
 */
describe("NFA", function () {
    function inputString(engine, aString) {
        var i;

        for(i = 0; i < aString.length; i++) {
            engine.put(aString.charAt(i));
        }
        engine.put(NFA.EOF);
    }

    function regexMatch(pattern, aString) {
        var rules,
            engine,
            ok = false;

        rules = {
            "init": {
                "rules": [NFA.rule(pattern, function(str) { ok = str; }), NFA.ruleEOF()]
            }
        };
        engine = NFA.create(rules, "init");
        inputString(engine, aString);
        expect(ok).toBe(aString);
    }

    function regexNomatch(pattern, aString) {
        var rules,
            engine,
            ok = false,
            i;

        try {
            rules = {
                "init": {
                    "rules": [NFA.rule(pattern, function(str) { ok = str; }), NFA.ruleEOF()]
                }
            };
            engine = NFA.create(rules, "init");
            inputString(engine, aString);
            fail();
        } catch(e) {
            expect(e.message).toBe("Syntax Error");
        }
    }

    function regexRealMatch(aString) {
        var rules,
            engine,
            ok = false,
            i;

        rules = {
            "init": {
                "rules": [NFA.ruleReal(function(str) { ok = str; }), NFA.ruleEOF()]
            }
        };
        engine = NFA.create(rules, "init");
        inputString(engine, aString);
        expect(ok).toBe(aString);
    }

    function regexRealNomatch(aString) {
        var rules,
            engine,
            ok = false,
            i;

        try {
            rules = {
                "init": {
                    "rules": [NFA.ruleReal(function(str) { ok = str; }), NFA.ruleEOF()]
                }
            };
            engine = NFA.create(rules, "init");
            inputString(engine, aString);
            fail();
        } catch(e) {
            expect(e.message).toBe("Syntax Error");
        }
    }

    beforeEach(function() {
    });

    describe("testing regex", function() {
        it("one char", function() {
            regexMatch("a", "a");
            regexMatch("\\n", "\n");
            regexMatch("\\r", "\r");
            regexMatch("\\t", "\t");
            regexMatch("\\b", "\b");
            regexMatch("\\f", "\f");
            regexMatch("\\v", "\v");
            regexMatch("\\u0020", " ");
        });

        it("charcter set", function() {
            regexMatch("[bcd]", "b");
            regexMatch("[bcd]", "c");
            regexMatch("[bcd]", "d");
            regexNomatch("[bcd]", "a");
            regexNomatch("[bcd]", "e");
            regexMatch("[b-x]", "b");
            regexMatch("[b-x]", "h");
            regexMatch("[b-x]", "x");
            regexNomatch("[b-x]", "a");
            regexNomatch("[b-x]", "z");
            regexMatch("[b-x1-8]", "b");
            regexMatch("[b-x1-8]", "h");
            regexMatch("[b-x1-8]", "x");
            regexMatch("[b-x1-8]", "1");
            regexMatch("[b-x1-8]", "4");
            regexMatch("[b-x1-8]", "8");
            regexNomatch("[b-x1-8]", "a");
            regexNomatch("[b-x1-8]", "z");
            regexMatch("[^b-x1-8]", "a");
            regexMatch("[^b-x1-8]", "z");
            regexNomatch("[^b-x1-8]", "b");
            regexMatch("[\\n\\r]", "\n");
            regexMatch("[\\n\\r]", "\r");
        });

        it("predefined set", function() {
            regexMatch("\\d", "0");
            regexNomatch("\\d", "a");
            regexNomatch("\\D", "0");
            regexMatch("\\D", "a");
            regexMatch("\\w", "a");
            regexNomatch("\\w", "+");
            regexNomatch("\\W", "a");
            regexMatch("\\W", "+");
            regexMatch("\\s", " ");
            regexNomatch("\\s", "a");
            regexNomatch("\\S", " ");
            regexMatch("\\S", "a");
        });

        it("sequence", function() {
            regexMatch("765", "765");
            regexNomatch("765", "961");
            regexNomatch("765", "766");
        });

        it("alter", function() {
            regexMatch("765|346|283", "765");
            regexMatch("765|346|283", "346");
            regexMatch("765|346|283", "283");
            regexNomatch("765|346|283", "961");
        });

        it("repeat", function() {
            regexMatch("ba*", "ba");
            regexMatch("ba*", "baaaaa");
            regexMatch("ba*", "b");
            regexMatch("a+", "a");
            regexMatch("a+", "aaaaa");
            regexNomatch("ba+", "b");
            regexMatch("ba?", "ba");
            regexMatch("ba?", "b");
            regexNomatch("ba?", "baa");
        });

        it("parenthesis", function() {
            regexMatch("(ab)+", "ab");
            regexMatch("(ab)+", "ababab");
            regexNomatch("(ab)+", "aba");
        });

        it("real", function() {
            regexRealMatch("765");
            regexRealMatch("76.5");
            regexRealMatch("0.765");
            regexRealMatch(".765");
            regexRealMatch("765e2");
            regexRealMatch("765E2");
            regexRealMatch("765e+2");
            regexRealMatch("765e-2");
            regexRealMatch("765e+346");
            regexRealMatch("765e-346");
            regexRealMatch("+765");
            regexRealMatch("+76.5");
            regexRealMatch("+0.765");
            regexRealMatch("+.765");
            regexRealMatch("+765e2");
            regexRealMatch("+765E2");
            regexRealMatch("+765e+2");
            regexRealMatch("+765e-2");
            regexRealMatch("+765e+346");
            regexRealMatch("+765e-346");
            regexRealMatch("-765");
            regexRealMatch("-76.5");
            regexRealMatch("-0.765");
            regexRealMatch("-.765");
            regexRealMatch("-765e2");
            regexRealMatch("-765E2");
            regexRealMatch("-765e+2");
            regexRealMatch("-765e-2");
            regexRealMatch("-765e+346");
            regexRealMatch("-765e-346");
            regexRealNomatch("a961");
            regexRealNomatch("+a961");
            regexRealNomatch("-a961");
        });
    });

    describe("testing rules", function() {
        it("JSON", function() {
            var rules,
                engine,
                src,
                i;

            function createBase(next) {
                return [
                    NFA.rule("{", NFA.pushAction("object")),
                    NFA.rule("\\[", NFA.pushAction("array")),
                    NFA.rule("\\s+"),
                    NFA.ruleReal(NFA.transitAction(next)),
                    NFA.rule("\"[^\"]*\"", NFA.transitAction(next)),
                    NFA.rule("true", NFA.transitAction(next)),
                    NFA.rule("false", NFA.transitAction(next)),
                    NFA.rule("null", NFA.transitAction(next))
                ];
            }

            rules = {
                "init": {
                    "rules": [
                        createBase("init"),
                        NFA.ruleEOF()
                    ]
                },

                "object": {
                    "rules": [
                        NFA.rule("\"[^\"]*\"", NFA.transitAction("object2")),
                        NFA.rule("}", NFA.popAction),
                        NFA.rule("\\s+")
                    ]
                },

                "object2": {
                    "rules": [
                        NFA.rule(":", NFA.transitAction("object3")),
                        NFA.rule("\\s+")
                    ]
                },

                "object3": {
                    "rules": createBase("object4"),
                    "popped": NFA.transitAction("object4")
                },

                "object4": {
                    "rules": [
                        NFA.rule(",", NFA.transitAction("object")),
                        NFA.rule("}", NFA.popAction),
                        NFA.rule("\\s+")
                    ]
                },

                "array": {
                    "rules": [
                        createBase("array2"),
                        NFA.rule("\\]", NFA.popAction),
                    ],
                    "popped": NFA.transitAction("array2")
                },

                "array2": {
                    "rules": [
                        NFA.rule(",", NFA.transitAction("array")),
                        NFA.rule("]", NFA.popAction),
                        NFA.rule("\\s+")
                    ]
                }
            };
            engine = NFA.create(rules, "init");
            src = '{\n' +
                '"aaaa": 1.23e23,\n' +
                '"bbbb": [2.23, "aaa"],\n' +
                '"cccc": [true, false, { "aaa": null }]\n' +
                '}';

            inputString(engine, "[1, 2, 3]");
            engine.reset();
            inputString(engine, src);
            engine.reset();
            try {
                inputString(engine, "[1, 2, 3");
                fail();
            } catch(e) { /* ok */ }
            expect("ok").toBe("ok");
        });
    });
});

