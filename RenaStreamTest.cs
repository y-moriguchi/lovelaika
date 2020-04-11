using NUnit.Framework;
using System;

namespace Morilib
{
    public class RenaStreamTest
    {
        private void Match(Func<RenaStream<int>.Buffer, int, RenaStream<int>.Result> exp, string toMatch, long index)
        {
            var buffer = new RenaStream<int>.Buffer(toMatch);
            var result = exp(buffer, default(int));
            Assert.IsNotNull(result);
            Assert.AreEqual(result.Index, index);
        }

        private void MatchAttr(Func<RenaStream<int>.Buffer, int, RenaStream<int>.Result> exp, string toMatch, long index, int initAttr, int attr)
        {
            var buffer = new RenaStream<int>.Buffer(toMatch);
            var result = exp(buffer, initAttr);
            Assert.IsNotNull(result);
            Assert.AreEqual(result.Index, index);
            Assert.AreEqual(attr, result.Attr);
        }

        private void NoMatch(Func<RenaStream<int>.Buffer, int, RenaStream<int>.Result> exp, string toMatch)
        {
            var buffer = new RenaStream<int>.Buffer(toMatch);
            var result = exp(buffer, default(int));
            Assert.IsNull(result);
        }

        [SetUp]
        public void Setup()
        {
        }

        [Test]
        public void TestStr()
        {
            RenaStream<int> r = RenaStream<int>.GetInstance();
            var matcher = r.Str("abcd");

            Match(matcher, "abcde", 4);
            NoMatch(matcher, "abcx");
            NoMatch(matcher, "abc");
            NoMatch(matcher, "");
        }

        [Test]
        public void TestRESimple()
        {
            RenaStream<int> r = RenaStream<int>.GetInstance();

            Match(r.RE("a"), "a", 1);
            Match(r.RE("\\n"), "\n", 1);
            Match(r.RE("\\r"), "\r", 1);
            Match(r.RE("\\t"), "\t", 1);
            Match(r.RE("\\f"), "\f", 1);
            Match(r.RE("\\b"), "\b", 1);
            Match(r.RE("\\v"), "\v", 1);
            Match(r.RE("\\\\"), "\\", 1);
            NoMatch(r.RE("a"), "b");
            NoMatch(r.RE("a"), "");
        }

        [Test]
        public void TestRESimplePrdefined()
        {
            RenaStream<int> r = RenaStream<int>.GetInstance();

            Match(r.RE("\\d"), "0", 1);
            Match(r.RE("\\d"), "9", 1);
            Match(r.RE("\\D"), "a", 1);
            Match(r.RE("\\D"), "+", 1);
            Match(r.RE("\\s"), " ", 1);
            Match(r.RE("\\s"), "\n", 1);
            Match(r.RE("\\S"), "0", 1);
            Match(r.RE("\\S"), "+", 1);
            Match(r.RE("\\w"), "a", 1);
            Match(r.RE("\\w"), "Y", 1);
            Match(r.RE("\\W"), " ", 1);
            Match(r.RE("\\W"), "+", 1);
            NoMatch(r.RE("\\s"), "0");
            NoMatch(r.RE("\\s"), "+");
            NoMatch(r.RE("\\d"), "a");
            NoMatch(r.RE("\\d"), "+");
            NoMatch(r.RE("\\D"), "0");
            NoMatch(r.RE("\\D"), "9");
            NoMatch(r.RE("\\S"), " ");
            NoMatch(r.RE("\\S"), "\n");
            NoMatch(r.RE("\\w"), " ");
            NoMatch(r.RE("\\w"), "+");
            NoMatch(r.RE("\\W"), "a");
            NoMatch(r.RE("\\W"), "Y");
        }

        [Test]
        public void TestRESimpleCharSet()
        {
            RenaStream<int> r = RenaStream<int>.GetInstance();

            Match(r.RE("[a]"), "a", 1);
            Match(r.RE("[b-x]"), "b", 1);
            Match(r.RE("[b-x]"), "i", 1);
            Match(r.RE("[b-x]"), "x", 1);
            Match(r.RE("[bdf]"), "b", 1);
            Match(r.RE("[bdf]"), "d", 1);
            Match(r.RE("[bdf]"), "f", 1);
            Match(r.RE("[b-x1-8]"), "b", 1);
            Match(r.RE("[b-x1-8]"), "i", 1);
            Match(r.RE("[b-x1-8]"), "x", 1);
            Match(r.RE("[b-x1-8]"), "1", 1);
            Match(r.RE("[b-x1-8]"), "4", 1);
            Match(r.RE("[b-x1-8]"), "8", 1);
            Match(r.RE("[ \\t]"), " ", 1);
            Match(r.RE("[ \\t]"), "\t", 1);
            Match(r.RE("[\\d\\s]"), "1", 1);
            Match(r.RE("[\\d\\s]"), " ", 1);
            NoMatch(r.RE("[b]"), "a");
            NoMatch(r.RE("[b]"), "c");
            NoMatch(r.RE("[b-x]"), "a");
            NoMatch(r.RE("[b-x]"), "z");
            NoMatch(r.RE("[bdf]"), "a");
            NoMatch(r.RE("[bdf]"), "c");
            NoMatch(r.RE("[bdf]"), "e");
            NoMatch(r.RE("[bdf]"), "g");
            NoMatch(r.RE("[b-x1-8]"), "a");
            NoMatch(r.RE("[b-x1-8]"), "z");
            NoMatch(r.RE("[b-x1-8]"), "0");
            NoMatch(r.RE("[b-x1-8]"), "9");
            NoMatch(r.RE("[ \\t]"), "\n");
            NoMatch(r.RE("[\\d\\s]"), "a");
            NoMatch(r.RE("[\\d\\s]"), "+");
        }

        [Test]
        public void TestREConcat()
        {
            RenaStream<int> r = RenaStream<int>.GetInstance();
            var matcher = r.RE("abcd");

            Match(matcher, "abcde", 4);
            NoMatch(matcher, "abcx");
            NoMatch(matcher, "abc");
            NoMatch(matcher, "");
        }

        [Test]
        public void TestREAlter()
        {
            RenaStream<int> r = RenaStream<int>.GetInstance();
            var matcher = r.RE("765|346|283");

            Match(matcher, "765", 3);
            Match(matcher, "346", 3);
            Match(matcher, "283", 3);
            NoMatch(matcher, "961");
            NoMatch(matcher, "766");
            NoMatch(matcher, "9");
        }

        [Test]
        public void TestREZeroOrMore()
        {
            RenaStream<int> r = RenaStream<int>.GetInstance();
            var matcher = r.RE("a*");

            Match(matcher, "aaaab", 4);
            Match(matcher, "b", 0);
            Match(matcher, "", 0);
        }

        [Test]
        public void TestREOneOrMore()
        {
            RenaStream<int> r = RenaStream<int>.GetInstance();
            var matcher = r.RE("a+");

            Match(matcher, "aaaab", 4);
            Match(matcher, "aaaa", 4);
            Match(matcher, "ab", 1);
            NoMatch(matcher, "b");
            NoMatch(matcher, "");
        }

        [Test]
        public void TestREOptional()
        {
            RenaStream<int> r = RenaStream<int>.GetInstance();
            var matcher = r.RE("a?");

            Match(matcher, "aaaab", 1);
            Match(matcher, "b", 0);
            Match(matcher, "", 0);
        }

        [Test]
        public void TestREGroup()
        {
            RenaStream<int> r = RenaStream<int>.GetInstance();
            var matcher = r.RE("(765|346|283)+");

            Match(matcher, "765346283", 9);
            NoMatch(matcher, "961");
            NoMatch(matcher, "763462835");
            NoMatch(matcher, "");
        }

        [Test]
        public void TestIsEnd()
        {
            RenaStream<int> r = RenaStream<int>.GetInstance();
            var matcher = r.IsEnd();

            Match(matcher, "", 0);
            NoMatch(matcher, "a");
        }

        [Test]
        public void TestAction()
        {
            RenaStream<int> r = RenaStream<int>.GetInstance();
            var matcher = r.Action(r.RE("a+", (str, attr) => str.Length), (syn, inh) => syn - inh);

            MatchAttr(matcher, "aaaaaa", 6, 2, 4);
        }

        [Test]
        public void TestConcat()
        {
            RenaStream<int> r = RenaStream<int>.GetInstance();
            var matcher = r.Concat(r.Str("765"), r.Str("346"));

            Match(matcher, "765346", 6);
            NoMatch(matcher, "765961");
            NoMatch(matcher, "961346");
            NoMatch(matcher, "");
        }

        [Test]
        public void TestConcatRE()
        {
            RenaStream<int> r = RenaStream<int>.GetInstance();
            var matcher = r.Concat(r.RE("765"), r.RE("346"));

            Match(matcher, "765346", 6);
            NoMatch(matcher, "765961");
            NoMatch(matcher, "961346");
            NoMatch(matcher, "");
        }

        [Test]
        public void TestChoice()
        {
            RenaStream<int> r = RenaStream<int>.GetInstance();
            var matcher = r.Choice(r.Str("765"), r.Str("346"), r.Str("283"));

            Match(matcher, "765", 3);
            Match(matcher, "346", 3);
            Match(matcher, "283", 3);
            NoMatch(matcher, "961");
            NoMatch(matcher, "766");
            NoMatch(matcher, "9");
        }

        [Test]
        public void TestLookaheadNot()
        {
            RenaStream<int> r = RenaStream<int>.GetInstance();
            var matcher = r.Concat(r.LookaheadNot(r.Str("765aaa")), r.Str("765"));

            Match(matcher, "765pro", 3);
            Match(matcher, "765", 3);
            NoMatch(matcher, "765aaa");
            NoMatch(matcher, "961");
        }

        [Test]
        public void TestLookahead()
        {
            RenaStream<int> r = RenaStream<int>.GetInstance();
            var matcher = r.Concat(r.Lookahead(r.Str("765pro")), r.Str("765"));

            Match(matcher, "765pro", 3);
            NoMatch(matcher, "765aaa");
            NoMatch(matcher, "765");
            NoMatch(matcher, "961");
        }

        [Test]
        public void TestZeroOrMore()
        {
            RenaStream<int> r = RenaStream<int>.GetInstance();
            var matcher = r.ZeroOrMore(r.Str("ab"));

            Match(matcher, "abababab", 8);
            Match(matcher, "ababababa", 8);
            Match(matcher, "a", 0);
            Match(matcher, "", 0);
        }

        [Test]
        public void TestCut()
        {
            RenaStream<int> r = RenaStream<int>.GetInstance();
            var matcher = r.Choice(r.Str("a"), r.Concat(r.Str("b"), r.Cut(), r.Str("c")), r.Str("be"));

            Match(matcher, "a", 1);
            Match(matcher, "bc", 2);
            NoMatch(matcher, "be");
            NoMatch(matcher, "bf");
            NoMatch(matcher, "cf");
        }

        [Test]
        public void TestLetrec1()
        {
            var r = RenaStream<int>.GetInstance();
            var matcher = r.Letrec1(x => r.Choice(r.Concat(r.Str("("), x, r.Str(")")), r.Str("")));

            Match(matcher, "((()))", 6);
            Match(matcher, "((())))", 6);
            Match(matcher, "((())", 0);
        }

        [Test]
        public void TestLetrec2()
        {
            var r = RenaStream<int>.GetInstance();
            var matcher = r.Letrec2(
                (x, y) => r.Choice(r.Concat(r.Str("("), y, r.Str(")")), r.Str("")),
                (x, y) => r.Concat(r.Str("["), x, r.Str("]")));

            Match(matcher, "([([])])", 8);
            Match(matcher, "([([])]", 0);
        }

        [Test]
        public void TestLetrec3()
        {
            var r = RenaStream<int>.GetInstance();
            var matcher = r.Letrec3(
                (x, y, z) => r.Choice(r.Concat(r.Str("("), y, r.Str(")")), r.Str("")),
                (x, y, z) => r.Concat(r.Str("["), z, r.Str("]")),
                (x, y, z) => r.Concat(r.Str("{"), x, r.Str("}")));

            Match(matcher, "([{([{}])}])", 12);
            Match(matcher, "([{([{}])}]", 0);
        }

        [Test]
        public void TestLetrecn()
        {
            var r = RenaStream<int>.GetInstance();
            var matcher = r.Letrecn(new RenaStream<int>.LetrecnType[]
            {
                (x) => r.Choice(r.Concat(r.Str("("), x[1], r.Str(")")), r.Str("")),
                (x) => r.Concat(r.Str("["), x[0], r.Str("]"))
            });

            Match(matcher, "([([])])", 8);
            Match(matcher, "([([])]", 0);
        }

        [Test]
        public void TestOneOrMore()
        {
            RenaStream<int> r = RenaStream<int>.GetInstance();
            var matcher = r.OneOrMore(r.Str("ab"));

            Match(matcher, "abababab", 8);
            Match(matcher, "ababababa", 8);
            Match(matcher, "aba", 2);
            Match(matcher, "ab", 2);
            NoMatch(matcher, "a");
            NoMatch(matcher, "");
        }

        [Test]
        public void TestOpt()
        {
            RenaStream<int> r = RenaStream<int>.GetInstance();
            var matcher = r.Opt(r.Str("ab"));

            Match(matcher, "abababab", 2);
            Match(matcher, "ababababa", 2);
            Match(matcher, "aba", 2);
            Match(matcher, "ab", 2);
            Match(matcher, "a", 0);
            Match(matcher, "", 0);
        }

        [Test]
        public void TestAttr()
        {
            RenaStream<int> r = RenaStream<int>.GetInstance();
            var matcher = r.Attr(27);

            MatchAttr(matcher, "", 0, 0, 27);
        }

        [Test]
        public void TestIgnoreConcat()
        {
            RenaStream<int> r = RenaStream<int>.Ignore(" +");
            var matcher = r.Concat(r.Str("a"), r.Str("f"));

            Match(matcher, "af", 2);
            Match(matcher, "a  f", 4);
            Match(matcher, "  a  f", 6);
            Match(matcher, "  a  f  ", 8);
            NoMatch(matcher, "a  a");
        }

        [Test]
        public void TestKey()
        {
            RenaStream<int> r = RenaStream<int>.Keys("+", "++", "--");
            var matcher = r.Key("+");

            Match(matcher, "+", 1);
            Match(matcher, "+1", 1);
            NoMatch(matcher, "++");
        }

        [Test]
        public void TestNotKey()
        {
            RenaStream<int> r = RenaStream<int>.Keys("+", "++", "--");
            var matcher = r.NotKey();

            Match(matcher, "-", 0);
            NoMatch(matcher, "++");
            NoMatch(matcher, "--");
            NoMatch(matcher, "+");
        }

        [Test]
        public void TestEqualsId1()
        {
            RenaStream<int> r = RenaStream<int>.GetInstance();
            var matcher = r.EqualsId("key");

            Match(matcher, "key", 3);
            Match(matcher, "key+", 3);
            Match(matcher, "key ", 3);
            Match(matcher, "keys", 3);
            NoMatch(matcher, "not");
        }

        [Test]
        public void TestEqualsId2()
        {
            RenaStream<int> r = RenaStream<int>.Keys("+", "++", "--");
            var matcher = r.EqualsId("key");

            Match(matcher, "key", 3);
            Match(matcher, "key+", 3);
            NoMatch(matcher, "key ");
            NoMatch(matcher, "keys");
            NoMatch(matcher, "not");
        }

        [Test]
        public void TestEqualsId3()
        {
            RenaStream<int> r = RenaStream<int>.Ignore(" +");
            var matcher = r.EqualsId("key");

            Match(matcher, "key", 3);
            NoMatch(matcher, "key+");
            Match(matcher, "key ", 3);
            NoMatch(matcher, "keys");
            NoMatch(matcher, "not");
        }

        [Test]
        public void TestEqualsId4()
        {
            RenaStream<int> r = RenaStream<int>.IgnoreAndKeys(" +", "+", "++", "--");
            var matcher = r.EqualsId("key");

            Match(matcher, "key", 3);
            Match(matcher, "key+", 3);
            Match(matcher, "key ", 3);
            NoMatch(matcher, "keys");
            NoMatch(matcher, "not");
        }
    }
}