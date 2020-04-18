using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace Morilib
{
    public class RenaStream<T>
    {
        public class Buffer
        {
            private class StringEnumerator : IEnumerator<char>
            {
                private string aString;
                private int index = -1;

                internal StringEnumerator(string aString)
                {
                    this.aString = aString;
                }

                public char Current
                {
                    get
                    {
                        if (index >= 0 && index < aString.Length)
                        {
                            return aString[index];
                        }
                        else
                        {
                            throw new ArgumentOutOfRangeException("index");
                        }
                    }
                }

                object IEnumerator.Current => Current;

                public void Dispose()
                {
                }

                public bool MoveNext()
                {
                    if(index >= aString.Length)
                    {
                        return false;
                    }
                    return ++index < aString.Length;
                }

                public void Reset()
                {
                }
            }

            private long markId = 0;
            private long markIdBottom = -1;
            private List<long> mark = new List<long>();
            private long bufferBottom;
            private List<char> buffer = new List<char>();
            private IEnumerator<char> enumerator;
            private bool isEnd;

            public Buffer(IEnumerator<char> enumerator)
            {
                this.enumerator = enumerator;
                Position = 0;
                isEnd = !enumerator.MoveNext();
            }

            public Buffer(string aString)
            {
                enumerator = new StringEnumerator(aString);
                Position = 0;
                isEnd = !enumerator.MoveNext();
            }

            public int ReadChar()
            {
                if (buffer.Count + bufferBottom > Position)
                {
                    char ch = buffer[(int)(Position++ - bufferBottom)];

                    if (!Marked && buffer.Count + bufferBottom <= Position)
                    {
                        buffer.Clear();
                        bufferBottom = Position;
                    }
                    return ch;
                }
                else if(isEnd)
                {
                    return -1;
                }
                else 
                {
                    char ch = enumerator.Current;

                    Position++;
                    isEnd = !enumerator.MoveNext();
                    if (Marked)
                    {
                        buffer.Add(ch);
                    }
                    else
                    {
                        bufferBottom++;
                    }
                    return ch;
                }
            }

            public long Position { get; private set; }

            public bool IsEnd
            {
                get
                {
                    return isEnd && buffer.Count + bufferBottom <= Position;
                }
            }

            internal long Mark()
            {
                long result = markId;

                if(!Marked)
                {
                    markIdBottom = markId;
                }
                mark.Add(Position);
                markId++;
                return result;
            }

            internal void Unmark()
            {
                if(Marked)
                {
                    mark.RemoveAt(mark.Count - 1);
                    if(!Marked)
                    {
                        Cut();
                    }
                }
            }

            internal void Unmark(long position)
            {
                if (Marked)
                {
                    mark.RemoveAt(mark.Count - 1);
                    if (!Marked)
                    {
                        markIdBottom = -1;
                        Position = position;
                    }
                }
            }

            internal void Cut()
            {
                mark.Clear();
                markIdBottom = -1;
                buffer.Clear();
                bufferBottom = Position;
            }

            internal bool Rollback(long id)
            {
                if(!Marked)
                {
                    return false;
                }
                else if(markIdBottom < 0 || id < markIdBottom)
                {
                    return false;
                }
                Position = mark[mark.Count - 1];
                return true;
            }

            internal bool Marked
            {
                get
                {
                    return mark.Count > 0;
                }
            }
        }

        internal abstract class FiniteAutomaton
        {
            internal abstract object InitialState
            {
                get;
            }

            internal abstract bool IsAcceptState(object state);

            internal abstract bool IsState(object state);

            internal abstract HashSet<object> Transit(object state, int ch);

            internal abstract HashSet<object> EpsilonTransit(object state);

            internal bool IsAcceptState(HashSet<object> states)
            {
                return states.Any(s => IsAcceptState(s));
            }

            internal bool IsState(HashSet<object> states)
            {
                return states.Any(s => IsState(s));
            }

            internal HashSet<object> Transit(HashSet<object> states, int ch)
            {
                var result = new HashSet<object>();

                foreach(object state in states)
                {
                    result.UnionWith(Transit(state, ch));
                }
                return result;
            }

            internal HashSet<object> EpsilonTransit(HashSet<object> states)
            {
                HashSet<object> resultOld;
                var result = states;

                do
                {
                    resultOld = new HashSet<object>(result);
                    foreach (object state in resultOld)
                    {
                        result.UnionWith(EpsilonTransit(state));
                    }
                } while (!(resultOld.IsSubsetOf(result) && result.IsSubsetOf(resultOld)));
                return result;
            }
        }

        internal class CharFA : FiniteAutomaton
        {
            private object start = new object();
            private object end = new object();
            private Func<int, bool> charFn;

            internal CharFA(int start, int end)
            {
                charFn = ch => ch >= start && ch <= end;
            }

            internal CharFA(int aChar)
            {
                charFn = ch => ch == aChar;
            }

            internal CharFA(Func<int, bool> fn)
            {
                charFn = fn;
            }

            internal static CharFA EndOfInput()
            {
                return new CharFA(ch => ch < 0);
            }

            internal override object InitialState => start;

            internal override HashSet<object> EpsilonTransit(object state)
            {
                return new HashSet<object>();
            }

            internal override bool IsAcceptState(object state)
            {
                return state == end;
            }

            internal override bool IsState(object state)
            {
                return state == start || state == end;
            }

            internal override HashSet<object> Transit(object state, int ch)
            {
                var result = new HashSet<object>();

                if(state == start && charFn(ch))
                {
                    result.Add(end);
                }
                return result;
            }
        }

        internal class EpsilonFA : FiniteAutomaton
        {
            private object start = new object();
            private object end = new object();

            internal override object InitialState => start;

            internal override HashSet<object> EpsilonTransit(object state)
            {
                var result = new HashSet<object>();

                if (state == start)
                {
                    result.Add(end);
                }
                return result;
            }

            internal override bool IsAcceptState(object state)
            {
                return state == end;
            }

            internal override bool IsState(object state)
            {
                return state == start || state == end;
            }

            internal override HashSet<object> Transit(object state, int ch)
            {
                return new HashSet<object>();
            }
        }

        internal class ConcatFA : FiniteAutomaton
        {
            private List<FiniteAutomaton> sequence;

            internal ConcatFA(List<FiniteAutomaton> sequence)
            {
                this.sequence = new List<FiniteAutomaton>(sequence);
            }

            internal ConcatFA(FiniteAutomaton fa1, FiniteAutomaton fa2)
            {
                sequence = new List<FiniteAutomaton>();
                sequence.Add(fa1);
                sequence.Add(fa2);
            }

            internal override object InitialState => sequence[0].InitialState;

            internal override HashSet<object> EpsilonTransit(object state)
            {
                var result = new HashSet<object>();

                for(int i = 0; i < sequence.Count; i++)
                {
                    if(sequence[i].IsState(state))
                    {
                        result.UnionWith(sequence[i].EpsilonTransit(state));
                        if (i + 1 < sequence.Count && sequence[i].IsAcceptState(state))
                        {
                            result.Add(sequence[i + 1].InitialState);
                        }
                        break;
                    }
                }
                return result;
            }

            internal override bool IsAcceptState(object state)
            {
                return sequence[sequence.Count - 1].IsAcceptState(state);
            }

            internal override bool IsState(object state)
            {
                return sequence.Any(seq => seq.IsState(state));
            }

            internal override HashSet<object> Transit(object state, int ch)
            {
                var result = new HashSet<object>();

                foreach(var seq in sequence)
                {
                    if(seq.IsState(state))
                    {
                        result.UnionWith(seq.Transit(state, ch));
                        break;
                    }
                }
                return result;
            }
        }

        internal class AlterFA : FiniteAutomaton
        {
            private object start = new object();
            private List<FiniteAutomaton> alternations;

            internal AlterFA(List<FiniteAutomaton> alternations)
            {
                this.alternations = new List<FiniteAutomaton>(alternations);
            }

            internal AlterFA(FiniteAutomaton fa1, FiniteAutomaton fa2)
            {
                alternations = new List<FiniteAutomaton>();
                alternations.Add(fa1);
                alternations.Add(fa2);
            }

            internal override object InitialState => start;

            internal override HashSet<object> EpsilonTransit(object state)
            {
                var result = new HashSet<object>();

                if (state == start)
                {
                    foreach(var alt in alternations)
                    {
                        result.Add(alt.InitialState);
                    }
                }
                else
                {
                    foreach(var alt in alternations)
                    {
                        if(alt.IsState(state))
                        {
                            result.UnionWith(alt.EpsilonTransit(state));
                        }
                    }
                }
                return result;
            }

            internal override bool IsAcceptState(object state)
            {
                return alternations.Any(alt => alt.IsAcceptState(state));
            }

            internal override bool IsState(object state)
            {
                return state == start || alternations.Any(alt => alt.IsState(state));
            }

            internal override HashSet<object> Transit(object state, int ch)
            {
                var result = new HashSet<object>();

                foreach (var alt in alternations)
                {
                    if (alt.IsState(state))
                    {
                        result.UnionWith(alt.Transit(state, ch));
                    }
                }
                return result;
            }
        }

        internal class RepeatFA : FiniteAutomaton
        {
            private FiniteAutomaton fa;
            private bool repeatable;
            private bool nullable;
            private object start = new object();
            private object end = new object();

            internal RepeatFA(FiniteAutomaton fa, bool repeatable, bool nullable)
            {
                this.fa = fa;
                this.repeatable = repeatable;
                this.nullable = nullable;
            }

            internal override object InitialState => start;

            internal override HashSet<object> EpsilonTransit(object state)
            {
                var result = new HashSet<object>();

                if(state == start)
                {
                    result.Add(fa.InitialState);
                    if(nullable)
                    {
                        result.Add(end);
                    }
                }
                else if(state == end)
                {
                    if(repeatable)
                    {
                        result.Add(start);
                    }
                }
                else if(fa.IsState(state))
                {
                    result.UnionWith(fa.EpsilonTransit(state));
                    if(fa.IsAcceptState(state))
                    {
                        result.Add(end);
                    }
                }
                return result;
            }

            internal override bool IsAcceptState(object state)
            {
                return state == end;
            }

            internal override bool IsState(object state)
            {
                return state == start || state == end || fa.IsState(state);
            }

            internal override HashSet<object> Transit(object state, int ch)
            {
                var result = new HashSet<object>();

                if(fa.IsState(state))
                {
                    result.UnionWith(fa.Transit(state, ch));
                }
                return result;
            }
        }

        /// <summary>
        /// A regex string which matches real number
        /// </summary>
        public static readonly string PatternReal = @"[\+\-]?(?:[0-9]+(?:\.[0-9]+)?|\.[0-9]+)(?:[eE][\+\-]?[0-9]+)?";

        private static readonly RenaStream<T> instanceRena = new RenaStream<T>();

        private readonly Func<Buffer, T, Result> ignore;
        private readonly List<string> keys;

        /// <summary>
        /// Create expression generator.
        /// </summary>
        /// <param name="ignore">expression to ignore</param>
        /// <param name="keys">keywords (operators)</param>
        public RenaStream(Func<Buffer, T, Result> ignore, string[] keys)
        {
            this.ignore = ignore;
            this.keys = keys == null ? null : new List<string>(keys);
        }

        private RenaStream()
        {
            ignore = null;
            keys = null;
        }

        /// <summary>
        /// Create exression generator.
        /// </summary>
        /// <param name="regex">regex pattern to ignore</param>
        /// <param name="keys">keywords (operators)</param>
        /// <returns>exression generator</returns>
        public static RenaStream<T> IgnoreAndKeys(string regex, params string[] keys)
        {
            return new RenaStream<T>(GetInstance().RE(regex), keys);
        }

        /// <summary>
        /// Create exression generator.
        /// </summary>
        /// <param name="regex">regex pattern to ignore</param>
        /// <returns>exression generator</returns>
        public static RenaStream<T> Ignore(string regex)
        {
            return new RenaStream<T>(GetInstance().RE(regex), null);
        }

        /// <summary>
        /// Create exression generator.
        /// </summary>
        /// <param name="keys">keywords (operators)</param>
        /// <returns>exression generator</returns>
        public static RenaStream<T> Keys(params string[] keys)
        {
            return new RenaStream<T>(null, keys);
        }

        /// <summary>
        /// Get expression generator without ignoring and keywords.
        /// </summary>
        /// <returns>exression generator</returns>
        public static RenaStream<T> GetInstance()
        {
            return instanceRena;
        }

        private void Ignore(Buffer buffer, long index)
        {
            ignore?.Invoke(buffer, default(T));
        }

        /// <summary>
        /// A class which has a matching result.
        /// </summary>
        public class Result
        {
            internal Result(T attr, long index)
            {
                Attr = attr;
                Index = index;
            }

            /// <summary>
            /// result attribute
            /// </summary>
            public T Attr { get; private set; }

            /// <summary>
            /// result index
            /// </summary>
            public long Index { get; private set; }
        }

        /// <summary>
        /// generates expression to match a string
        /// </summary>
        /// <param name="toMatch">string to match</param>
        /// <returns>expression</returns>
        public Func<Buffer, T, Result> Str(string toMatch)
        {
            return (match, attr) =>
            {
                long id = match.Mark();
                long startPosition = match.Position;

                for (int i = 0; i < toMatch.Length; i++)
                {
                    if(match.IsEnd)
                    {
                        match.Rollback(id);
                        match.Unmark(startPosition);
                        return null;
                    }

                    int ch = match.ReadChar();
                    if(ch != toMatch[i])
                    {
                        match.Rollback(id);
                        match.Unmark(startPosition);
                        return null;
                    }
                }
                match.Unmark();
                return new Result(attr, match.Position);
            };
        }

        private Tuple<char, int> ParseOneChar(string regex, int index)
        {
            if (index + 1 < regex.Length && regex[index] == '\\')
            {
                string codeString;
                int code;

                switch(regex[index + 1])
                {
                    case 'n': return new Tuple<char, int>('\n', index + 2);
                    case 'r': return new Tuple<char, int>('\r', index + 2);
                    case 't': return new Tuple<char, int>('\t', index + 2);
                    case 'v': return new Tuple<char, int>('\v', index + 2);
                    case 'f': return new Tuple<char, int>('\f', index + 2);
                    case 'b': return new Tuple<char, int>('\b', index + 2);
                    case 'u':
                        if(index + 5 >= regex.Length)
                        {
                            throw new ArgumentException("Invalid Regex");
                        }
                        codeString = regex.Substring(index + 2, 4);
                        if(!Regex.Match(codeString, "[0-9A-Fa-f]{4,4}").Success)
                        {
                            throw new ArgumentException("Invalid Regex");
                        }
                        code = Convert.ToInt32(regex.Substring(index + 2, 4));
                        return new Tuple<char, int>((char)code, index + 6);
                    default:
                        return new Tuple<char, int>(regex[index + 1], index + 2);
                }
            }
            else
            {
                return new Tuple<char, int>(regex[index], index + 1);
            }
        }

        private static readonly Regex RegexPd = new Regex("^\\d$");
        private static readonly Regex RegexPD = new Regex("^\\D$");
        private static readonly Regex RegexPs = new Regex("^\\s$");
        private static readonly Regex RegexPS = new Regex("^\\S$");
        private static readonly Regex RegexPw = new Regex("^\\w$");
        private static readonly Regex RegexPW = new Regex("^\\W$");

        private Tuple<FiniteAutomaton, int> MakeCharSet(Regex regex, int index)
        {
            var fa = new CharFA(ch => ch < 0 ? false : regex.Match(char.ToString((char)ch)).Success);

            return new Tuple<FiniteAutomaton, int>(fa, index + 2);
        }

        private Tuple<FiniteAutomaton, int> ParsePredefinedCharSet(string regex, int index)
        {
            if(index >= regex.Length || regex[index] != '\\')
            {
                return null;
            }
            switch(regex[index + 1])
            {
                case 'd': return MakeCharSet(RegexPd, index);
                case 'D': return MakeCharSet(RegexPD, index);
                case 's': return MakeCharSet(RegexPs, index);
                case 'S': return MakeCharSet(RegexPS, index);
                case 'w': return MakeCharSet(RegexPw, index);
                case 'W': return MakeCharSet(RegexPW, index);
                default: return null;
            }
        }

        private Tuple<FiniteAutomaton, int> ParseCharSet(string regex, int index)
        {
            int indexNow = index;
            var alternations = new List<FiniteAutomaton>();

            while(indexNow < regex.Length && regex[indexNow] != ']')
            {
                var predefined = ParsePredefinedCharSet(regex, indexNow);

                if(predefined != null)
                {
                    alternations.Add(predefined.Item1);
                    indexNow = predefined.Item2;
                }
                else
                {
                    var char1 = ParseOneChar(regex, indexNow);

                    if(char1.Item2 < regex.Length && regex[char1.Item2] == '-')
                    {
                        var char2 = ParseOneChar(regex, char1.Item2 + 1);
                        var fa = new CharFA(char1.Item1, char2.Item2);

                        alternations.Add(new CharFA(char1.Item1, char2.Item1));
                        indexNow = char2.Item2;
                    }
                    else
                    {
                        alternations.Add(new CharFA(char1.Item1));
                        indexNow = char1.Item2;
                    }
                }
            }

            if(indexNow < regex.Length)
            {
                return new Tuple<FiniteAutomaton, int>(new AlterFA(alternations), indexNow + 1);
            }
            else
            {
                throw new ArgumentException("Invalid Regex");
            }
        }

        private Tuple<FiniteAutomaton, int> ParseElement(string regex, int index)
        {
            Tuple<FiniteAutomaton, int> predefined;
            Tuple<char, int> singleChar;

            if(regex[index] == '(')
            {
                var result = ParseRegex(regex, index + 1);

                if(result.Item2 >= regex.Length || regex[result.Item2] != ')')
                {
                    throw new ArgumentException("Invalid Regex");
                }
                return new Tuple<FiniteAutomaton, int>(result.Item1, result.Item2 + 1);
            }
            else if(regex[index] == '[')
            {
                return ParseCharSet(regex, index + 1);
            }
            else if((predefined = ParsePredefinedCharSet(regex, index)) != null)
            {
                return predefined;
            }
            else if((singleChar = ParseOneChar(regex, index)) != null)
            {
                return new Tuple<FiniteAutomaton, int>(new CharFA(singleChar.Item1), singleChar.Item2);
            }
            else
            {
                throw new ArgumentException("Invalid Regex");
            }
        }

        private Tuple<FiniteAutomaton, int> ParseRepeat(string regex, int index)
        {
            var result = ParseElement(regex, index);

            if(result.Item2 >= regex.Length)
            {
                return result;
            }
            else if(regex[result.Item2] == '*')
            {
                return new Tuple<FiniteAutomaton, int>(new RepeatFA(result.Item1, true, true), result.Item2 + 1);
            }
            else if(regex[result.Item2] == '+')
            {
                return new Tuple<FiniteAutomaton, int>(new RepeatFA(result.Item1, true, false), result.Item2 + 1);
            }
            else if(regex[result.Item2] == '?')
            {
                return new Tuple<FiniteAutomaton, int>(new RepeatFA(result.Item1, false, true), result.Item2 + 1);
            }
            else
            {
                return result;
            }
        }

        private Tuple<FiniteAutomaton, int> ParseConcat(string regex, int index)
        {
            if(index >= regex.Length || regex[index] == '|')
            {
                return new Tuple<FiniteAutomaton, int>(new EpsilonFA(), index);
            }

            var result1 = ParseRepeat(regex, index);

            if(result1.Item2 < regex.Length && "|)".IndexOf(regex[result1.Item2]) < 0)
            {
                var result2 = ParseConcat(regex, result1.Item2);

                return new Tuple<FiniteAutomaton, int>(new ConcatFA(result1.Item1, result2.Item1), result2.Item2);
            }
            else
            {
                return result1;
            }
        }

        private Tuple<FiniteAutomaton, int> ParseRegex(string regex, int index)
        {
            var result1 = ParseConcat(regex, index);

            if(result1.Item2 < regex.Length && regex[result1.Item2] == '|')
            {
                var result2 = ParseRegex(regex, result1.Item2 + 1);

                return new Tuple<FiniteAutomaton, int>(new AlterFA(result1.Item1, result2.Item1), result2.Item2);
            }
            else
            {
                return result1;
            }
        }

        /// <summary>
        /// generates expression to match a regex
        /// </summary>
        /// <param name="toMatch">regex to match</param>
        /// <returns>expression</returns>
        public Func<Buffer, T, Result> RE(string toMatch, Func<string, T, T> action = null)
        {
            var fa = ParseRegex(toMatch, 0).Item1;
            var anAction = action ?? ((str, attr) => default(T));

            return (match, attr) =>
            {
                long id = match.Mark();
                var states = new HashSet<object>();
                long position = -1;
                long startPosition = match.Position;
                var buffer = new StringBuilder();

                states.Add(fa.InitialState);
                states = fa.EpsilonTransit(states);
                if (fa.IsAcceptState(states))
                {
                    position = match.Position;
                }
                while (states.Count > 0)
                {
                    int ch = match.ReadChar();
                    
                    if(ch >= 0)
                    {
                        buffer.Append((char)ch);
                    }
                    states = fa.Transit(states, ch);
                    states = fa.EpsilonTransit(states);
                    if (fa.IsAcceptState(states))
                    {
                        position = match.Position;
                    }
                }

                if(position < 0)
                {
                    match.Rollback(id);
                    match.Unmark(startPosition);
                    return null;
                }
                else
                {
                    match.Unmark(position);
                    return new Result(anAction(buffer.ToString().Substring(0, (int)(position - startPosition)), attr), position);
                }
            };
        }

        /// <summary>
        /// generates expression to match end of input
        /// </summary>
        /// <returns>expression</returns>
        public Func<Buffer, T, Result> IsEnd()
        {
            return (match, attr) => match.IsEnd ? new Result(attr, match.Position) : null;
        }

        /// <summary>
        /// generates expression to affect to attribute
        /// </summary>
        /// <param name="exp">enclosed expression</param>
        /// <param name="action">action</param>
        /// <returns>expression</returns>
        public Func<Buffer, T, Result> Action(Func<Buffer, T, Result> exp, Func<T, T, T> action)
        {
            return (match, attr) =>
            {
                Result result = exp(match, attr);

                if(result == null)
                {
                    return null;
                }
                else
                {
                    return new Result(action(result.Attr, attr), result.Index);
                }
            };
        }

        /// <summary>
        /// generates expression to match a sequence of expression
        /// </summary>
        /// <param name="exps">sequence of expression</param>
        /// <returns>expression</returns>
        public Func<Buffer, T, Result> Concat(params Func<Buffer, T, Result>[] exps)
        {
            return (match, attr) =>
            {
                T attrNew = attr;

                Ignore(match, match.Position);
                foreach (Func<Buffer, T, Result> exp in exps)
                {
                    Result result = exp(match, attrNew);

                    if (result == null)
                    {
                        return null;
                    }
                    else
                    {
                        attrNew = result.Attr;
                        Ignore(match, result.Index);
                    }
                }
                return new Result(attrNew, match.Position);
            };
        }

        /// <summary>
        /// generates expression to choice a expression from the arguments.
        /// </summary>
        /// <param name="exps">expressions to choice</param>
        /// <returns>expression</returns>
        public Func<Buffer, T, Result> Choice(params Func<Buffer, T, Result>[] exps)
        {
            return (match, attr) =>
            {
                bool marked = match.Marked;
                long id = match.Mark();

                foreach (Func<Buffer, T, Result> exp in exps)
                {
                    Result result = exp(match, attr);

                    if (result != null)
                    {
                        match.Unmark();
                        return result;
                    }
                    else if(!match.Rollback(id))
                    {
                        return null;
                    }
                }
                match.Unmark();
                return null;
            };
        }

        /// <summary>
        /// generates expression which matches if the given expression is not matched
        /// </summary>
        /// <param name="exp">expression not to match</param>
        /// <returns>expression</returns>
        public Func<Buffer, T, Result> LookaheadNot(Func<Buffer, T, Result> exp)
        {
            return (match, attr) =>
            {
                long id = match.Mark();
                long position = match.Position;
                Result result = exp(match, attr);

                if(!match.Rollback(id) || result != null)
                {
                    match.Unmark(position);
                    return null;
                }
                else
                {
                    match.Unmark(position);
                    return new Result(attr, position);
                }
            };
        }

        /// <summary>
        /// generates expression which matches if the given expression is matched
        /// </summary>
        /// <param name="exp">expression not to match</param>
        /// <returns>expression</returns>
        public Func<Buffer, T, Result> Lookahead(Func<Buffer, T, Result> exp)
        {
            return (match, attr) =>
            {
                long id = match.Mark();
                long position = match.Position;
                Result result = exp(match, attr);

                if (!match.Rollback(id) || result == null)
                {
                    match.Unmark(position);
                    return null;
                }
                else
                {
                    match.Unmark(position);
                    return result;
                }
            };
        }

        /// <summary>
        /// generate expression to match zero or more occurrence
        /// </summary>
        /// <param name="exp">expression to repeat</param>
        /// <returns>expression</returns>
        public Func<Buffer, T, Result> ZeroOrMore(Func<Buffer, T, Result> exp)
        {
            return (match, attr) =>
            {
                Ignore(match, match.Position);

                var result = new Result(attr, match.Position);
                Result resultNew;

                while ((resultNew = exp(match, result.Attr)) != null)
                {
                    result = resultNew;
                    Ignore(match, result.Index);
                }
                return new Result(result.Attr, match.Position);
            };
        }

        public Func<Buffer, T, Result> Cut()
        {
            return (match, attr) =>
            {
                match.Cut();
                return new Result(attr, match.Position);
            };
        }

        public delegate Func<Buffer, T, Result> LetrecnType(Func<Buffer, T, Result>[] funcs);

        /// <summary>
        /// A method which can refer a return values of the function itself.<br>
        /// This method will be used for defining a expression with recursion.
        /// </summary>
        /// <param name="funcs">functions which are return values itself</param>
        /// <returns>matcher function</returns>
        public Func<Buffer, T, Result> Letrecn(params LetrecnType[] funcs)
        {
            var delays = new Func<Buffer, T, Result>[funcs.Length];
            var memo = new Func<Buffer, T, Result>[funcs.Length];
            Action<int> inner = (i) =>
            {
                delays[i] = (match, attr) =>
                {
                    if (memo[i] == null)
                    {
                        memo[i] = funcs[i](delays);
                    }
                    return memo[i](match, attr);
                };
            };

            for(int i = 0; i < funcs.Length; i++)
            {
                inner(i);
            }
            return delays[0];
        }

        /// <summary>
        /// A method which can refer a return values of the function itself.<br>
        /// This method will be used for defining a expression with recursion.
        /// </summary>
        /// <param name="func">a function which is a return value itself</param>
        /// <returns>matcher function</returns>
        public Func<Buffer, T, Result> Letrec1(
            Func<Func<Buffer, T, Result>, Func<Buffer, T, Result>> func)
        {
            Func<Buffer, T, Result> delay = null;
            Func<Buffer, T, Result> memo = null;

            delay = (match, attr) =>
            {
                if(memo == null)
                {
                    memo = func(delay);
                }
                return memo(match, attr);
            };
            return delay;
        }

        /// <summary>
        /// A method which can refer a return values of the function itself.<br>
        /// This method will be used for defining a expression with recursion.
        /// </summary>
        /// <param name="func1">a function whose first argument is a return value itself</param>
        /// <param name="func2">a function whose second argument is a return value itself</param>
        /// <returns>matcher function</returns>
        public Func<Buffer, T, Result> Letrec2(
            Func<Func<Buffer, T, Result>, Func<Buffer, T, Result>, Func<Buffer, T, Result>> func1,
            Func<Func<Buffer, T, Result>, Func<Buffer, T, Result>, Func<Buffer, T, Result>> func2)
        {
            Func<Buffer, T, Result> delay1 = null;
            Func<Buffer, T, Result> memo1 = null;
            Func<Buffer, T, Result> delay2 = null;
            Func<Buffer, T, Result> memo2 = null;

            delay1 = (match, attr) =>
            {
                if (memo1 == null)
                {
                    memo1 = func1(delay1, delay2);
                }
                return memo1(match, attr);
            };
            delay2 = (match, attr) =>
            {
                if (memo2 == null)
                {
                    memo2 = func2(delay1, delay2);
                }
                return memo2(match, attr);
            };
            return delay1;
        }

        /// <summary>
        /// A method which can refer a return values of the function itself.<br>
        /// This method will be used for defining a expression with recursion.
        /// </summary>
        /// <param name="func1">a function whose first argument is a return value itself</param>
        /// <param name="func2">a function whose second argument is a return value itself</param>
        /// <param name="func3">a function whose third argument is a return value itself</param>
        /// <returns>matcher function</returns>
        public Func<Buffer, T, Result> Letrec3(
            Func<Func<Buffer, T, Result>, Func<Buffer, T, Result>, Func<Buffer, T, Result>, Func<Buffer, T, Result>> func1,
            Func<Func<Buffer, T, Result>, Func<Buffer, T, Result>, Func<Buffer, T, Result>, Func<Buffer, T, Result>> func2,
            Func<Func<Buffer, T, Result>, Func<Buffer, T, Result>, Func<Buffer, T, Result>, Func<Buffer, T, Result>> func3)
        {
            Func<Buffer, T, Result> delay1 = null;
            Func<Buffer, T, Result> memo1 = null;
            Func<Buffer, T, Result> delay2 = null;
            Func<Buffer, T, Result> memo2 = null;
            Func<Buffer, T, Result> delay3 = null;
            Func<Buffer, T, Result> memo3 = null;

            delay1 = (match,  attr) =>
            {
                if (memo1 == null)
                {
                    memo1 = func1(delay1, delay2, delay3);
                }
                return memo1(match, attr);
            };
            delay2 = (match, attr) =>
            {
                if (memo2 == null)
                {
                    memo2 = func2(delay1, delay2, delay3);
                }
                return memo2(match, attr);
            };
            delay3 = (match, attr) =>
            {
                if (memo3 == null)
                {
                    memo3 = func3(delay1, delay2, delay3);
                }
                return memo3(match, attr);
            };
            return delay1;
        }

        /// <summary>
        /// generate expression to match one or more occurrence
        /// </summary>
        /// <param name="exp">expression to repeat</param>
        /// <returns>expression</returns>
        public Func<Buffer, T, Result> OneOrMore(Func<Buffer, T, Result> exp)
        {
            return Concat(exp, ZeroOrMore(exp));
        }

        /// <summary>
        /// generate expression to match zero or one occurrence
        /// </summary>
        /// <param name="exp">expression to match optionally</param>
        /// <returns>expression</returns>
        public Func<Buffer, T, Result> Opt(Func<Buffer, T, Result> exp)
        {
            return Choice(exp, Str(""));
        }

        /// <summary>
        /// set the given value as attribute
        /// </summary>
        /// <param name="value">value to set</param>
        /// <returns></returns>
        public Func<Buffer, T, Result> Attr(T value)
        {
            return Action(Str(""), (syn, inh) => value);
        }

        /// <summary>
        /// generates expression which matches keyword (operator)
        /// </summary>
        /// <param name="key">keyword to match</param>
        /// <returns>expression</returns>
        public Func<Buffer, T, Result> Key(string key)
        {
            var skipKeys = new List<Func<Buffer, T, Result>>();
            
            if(keys == null)
            {
                throw new ArgumentException("keys are not set");
            }
            foreach(var skipKey in keys)
            {
                if(skipKey.Length > key.Length)
                {
                    skipKeys.Add(Str(skipKey));
                }
            }
            return Concat(LookaheadNot(Choice(skipKeys.ToArray())), Str(key));
        }

        /// <summary>
        /// generates expression which does not match any keywords (operators)
        /// </summary>
        /// <returns>expression</returns>
        public Func<Buffer, T, Result> NotKey()
        {
            var skipKeys = new List<Func<Buffer, T, Result>>();

            if (keys == null)
            {
                throw new ArgumentException("keys are not set");
            }
            foreach (var skipKey in keys)
            {
                skipKeys.Add(Str(skipKey));
            }
            return LookaheadNot(Choice(skipKeys.ToArray()));
        }

        /// <summary>
        /// generates expression which matches identifier with succeeding the pattern to ignore
        /// or keywords (operators)
        /// </summary>
        /// <param name="key">identifier to match</param>
        /// <returns>expression</returns>
        public Func<Buffer, T, Result> EqualsId(string key)
        {
            var r = GetInstance();

            if (ignore == null && keys == null)
            {
                return r.Str(key);
            }
            else if (ignore == null)
            {
                return r.Concat(r.Str(key), r.Choice(r.IsEnd(), r.LookaheadNot(NotKey())));
            }
            else if (keys == null)
            {
                return r.Concat(r.Str(key), r.Choice(r.IsEnd(), r.Lookahead(ignore)));
            }
            else
            {
                return r.Concat(r.Str(key), r.Choice(IsEnd(), r.Lookahead(ignore), r.LookaheadNot(NotKey())));
            }
        }
    }
}
