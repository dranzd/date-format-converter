(function () { 'use strict';

var Util = {};
Util.array = {
    first: function (array, callback) {
        if (!callback) {
            return array.length ? array[0] : null;
        }

        for (var i = 0; i < array.length; i++) {
            var item = array[i];
            if (callback(item)) {
                return item;
            }
        }

        return null;
    }
};
Util.string = {
    replaceAll: function (string, pattern, replacement) {
        return string.split(pattern).join(replacement);
    },
    contains: function (string, part) {
        return string.indexOf(part) >= 0;
    }
};

function DateFormatConverter () {
    return DateFormatConverter;
}

DateFormatConverter.convert = function (format, srcRules, destRules) {
    if (srcRules === destRules) {
        return format;
    }

    var result     = '';
    var index      = 0;
    var destTokens = this.getTokens(destRules);
    var srcMap     = this.getTokenMap(this.getTokens(srcRules));

    while (index < format.length) {
        var part = this.locateNextToken(srcRules, format, index);

        if (part.literal.length > 0) {
            result += destRules.makeLiteneral(part.literal);
        }
        if (part.token.length > 0) {
            result += destTokens[srcMap[part.token]];
        }
        index = part.nextBegin;
    }

    return result;
};

DateFormatConverter.locateNextToken = function (rules, format, begin) {
    var literal  = '';
    var index    = begin;
    var sequence = this.getTokenSequence(this.getTokenMap(this.getTokens(rules)));

    while (index < format.length) {
        var escaped = rules.readEscapedPart(format, index);

        if (escaped.length > 0) {
            literal += escaped.value;
            index   += escaped.length;
            continue;
        }

        var token = Util.array.first(sequence, function (x) {
            return format.indexOf(x, index) == index;
        });

        if (!token) {
            literal += format.charAt(index);
            index++;
            continue;
        }

        return {
            token:     token,
            literal:   literal,
            nextBegin: index + token.length
        };
    }

    return {
        token:     '',
        literal:   literal,
        nextBegin: index
    };
};

DateFormatConverter.getTokens = function (rules) {
    return [
        rules.DayOfMonthShort,
        rules.DayOfMonthLong,
        rules.DayOfWeekShort,
        rules.DayOfWeekLong,
        rules.DayOfYearShort,
        rules.DayOfYearLong,
        rules.MonthOfYearShort,
        rules.MonthOfYearLong,
        rules.MonthNameShort,
        rules.MonthNameLong,
        rules.YearShort,
        rules.YearLong,
        rules.AmPm,
        rules.Hour24Short,
        rules.Hour24Long,
        rules.Hour12Short,
        rules.Hour12Long,
        rules.MinuteShort,
        rules.MinuteLong,
        rules.SecondShort,
        rules.SecondLong,
        rules.FractionalSecond1,
        rules.FractionalSecond2,
        rules.FractionalSecond3,
        rules.TimeZone,
        rules.UnixTimestamp
    ].map(function (x) {
        return x || '';
    });
};

DateFormatConverter.getTokenMap = function (tokens) {
    var map = {};
    for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        if (token) {
            map[token] = i;
        }
    }
    return map;
};

DateFormatConverter.getTokenSequence = function (map) {
    var tokens = Object.keys(map);
    tokens.sort(function (a, b) {
        return b.length - a.length;
    });
    return tokens;
};

// DateFormatConverter.indexOfAny = function (s, chars) {
//     for (var i = 0; i < s.length; i++) {
//         var c = s.charAt(i);
//         for (var j = 0; j < chars.length; j++) {
//             if (c === chars.charAt(j))
//                 return i;
//         }
//     }
//     return -1;
// };

DateFormatConverter.prototype = {
    canvas: function () {
        console.log('wow');
        return 'test';
    }
};

window.DateFormatConverter = DateFormatConverter;

function DateFormat () {

}

DateFormat.indexOfAny = function (s, chars) {
    for (var i = 0; i < s.length; i++) {
        var c = s.charAt(i);
        for (var j = 0; j < chars.length; j++) {
            if (c === chars.charAt(j))
                return i;
        }
    }
    return -1;
};

DateFormat.STANDARD = {
    DayOfMonthShort:   'd',
    DayOfMonthLong:    'dd',
    DayOfWeekShort:    'ddd',
    DayOfWeekLong:     'dddd',
    DayOfYearShort:    'D',
    DayOfYearLong:     'DD',
    MonthOfYearShort:  'M',
    MonthOfYearLong:   'MM',
    MonthNameShort:    'MMM',
    MonthNameLong:     'MMMM',
    YearShort:         'yy',
    YearLong:          'yyyy',
    AmPm:              'tt',
    Hour24Short:       'H',
    Hour24Long:        'HH',
    Hour12Short:       'h',
    Hour12Long:        'hh',
    MinuteShort:       'm',
    MinuteLong:        'mm',
    SecondShort:       's',
    SecondLong:        'ss',
    FractionalSecond1: 'f',
    FractionalSecond2: 'ff',
    FractionalSecond3: 'fff',
    TimeZone:          'Z',
    UnixTimestamp:     'X',

    makeLiteneral: function (literal) {
        var reserved = 'dDMytHhmsfZX';
        if (DateFormat.indexOfAny(literal, reserved) < 0) {
            return literal;
        }

        var result = '';
        for (var i = 0; i < literal.length; i++) {
            var c = literal.charAt(i);
            if (Util.string.contains(reserved, c)) {
                result += '\\';
            }
            result += c;
        }

        return result;
    },

    readEscapedPart: function (format, startIndex) {
        var result = '';
        var index  = startIndex;
        while (index < format.length) {
            var c = format.charAt(index);

            if (c == '\\') {
                result += index == format.length - 1 ? '\\' : format[++index];
                index++;
                continue;
            }

            break;
        }

        return {
            value:  result,
            length: index - startIndex
        };
    }
};

DateFormat.MOMENTJS = {
    DayOfMonthShort:   'D',
    DayOfMonthLong:    'DD',
    DayOfWeekShort:    'ddd',
    DayOfWeekLong:     'dddd',
    DayOfYearShort:    'DDD',
    DayOfYearLong:     'DDDD',
    MonthOfYearShort:  'M',
    MonthOfYearLong:   'MM',
    MonthNameShort:    'MMM',
    MonthNameLong:     'MMMM',
    YearShort:         'YY',
    YearLong:          'YYYY',
    AmPm:              'A',
    Hour24Short:       'H',
    Hour24Long:        'HH',
    Hour12Short:       'h',
    Hour12Long:        'hh',
    MinuteShort:       'm',
    MinuteLong:        'mm',
    SecondShort:       's',
    SecondLong:        'ss',
    FractionalSecond1: 'S',
    FractionalSecond2: 'SS',
    FractionalSecond3: 'SSS',
    TimeZone:          'Z',
    UnixTimestamp:     'X',

    makeLiteneral: function (literal) {
        var reserved = 'MoDdeEwWYgGAaHhmsSzZX';

        literal = Util.string.replaceAll(literal, "[", "(");
        literal = Util.string.replaceAll(literal, "]", ")");
        if (DateFormat.indexOfAny(literal, reserved) < 0) {
            return literal;
        }

        return '[' + literal + ']';
    },

    readEscapedPart: function (format, startIndex) {
        if (format.charAt(startIndex) != '[') {
            return { value: '', length: 0 };
        }

        var result = '';
        var index  = startIndex;
        while (index < format.length) {
            var c = format.charAt(index);

            if (c == ']') {
                break;
            }

            result += c;
        }

        return {
            value:  result,
            length: index - startIndex
        };
    }
};

DateFormat.DATEPICKER = {
    DayOfMonthShort:   'd',
    DayOfMonthLong:    'dd',
    DayOfWeekShort:    'D',
    DayOfWeekLong:     'DD',
    DayOfYearShort:    'o',
    DayOfYearLong:     'oo',
    MonthOfYearShort:  'm',
    MonthOfYearLong:   'mm',
    MonthNameShort:    'M',
    MonthNameLong:     'MM',
    YearShort:         'y',
    YearLong:          'yy',
    AmPm:              null,
    Hour24Short:       null,
    Hour24Long:        null,
    Hour12Short:       null,
    Hour12Long:        null,
    MinuteShort:       null,
    MinuteLong:        null,
    SecondShort:       null,
    SecondLong:        null,
    FractionalSecond1: null,
    FractionalSecond2: null,
    FractionalSecond3: null,
    TimeZone:          null,
    UnixTimestamp:     '@',

    makeLiteneral: function (literal) {
        var reserved = "dDomMy@'";
        if (DateFormat.indexOfAny(literal, reserved) < 0) {
            return literal;
        }

        return "'" + Util.string.replaceAll(literal, "'", "''") + "'";
    },

    readEscapedPart: function (format, startIndex) {
        if (format.charAt(startIndex) != "'") {
            return { value: '', length: 0 };
        }

        var result = '';
        var index  = startIndex;
        while (++index < format.length) {
            var c = format.charAt(index);

            if (c == "'") {
                index++;
                if (index == format.length)
                    break;

                if (format[index] == "'") {
                    result += c;
                } else {
                    break;
                }
            } else {
                result += c;
            }
        }

        return {
            value:  result,
            length: index - startIndex
        };
    }
};

DateFormat.TIMEPICKER = {
    DayOfMonthShort:   null,
    DayOfMonthLong:    null,
    DayOfWeekShort:    null,
    DayOfWeekLong:     null,
    DayOfYearShort:    null,
    DayOfYearLong:     null,
    MonthOfYearShort:  null,
    MonthOfYearLong:   null,
    MonthNameShort:    null,
    MonthNameLong:     null,
    YearShort:         null,
    YearLong:          null,
    AmPm:              'TT',
    Hour24Short:       'H',
    Hour24Long:        'HH',
    Hour12Short:       'h',
    Hour12Long:        'hh',
    MinuteShort:       'm',
    MinuteLong:        'mm',
    SecondShort:       's',
    SecondLong:        'ss',
    FractionalSecond1: null,
    FractionalSecond2: null,
    FractionalSecond3: 'l',
    TimeZone:          'Z',
    UnixTimestamp:     null,

    makeLiteneral: function (literal) {
        var reserved = "HhmslctTzZ'";
        if (indexOfAny(literal, reserved) < 0) {
            return literal;
        }

        return "'" + literal.replaceAll("'", '"') + "'";
    },

    readEscapedPart: function (format, startIndex) {
        if (format.charAt(startIndex) != "'") {
            return { value: '', length: 0 };
        }

        var result = '';
        var index  = startIndex;
        while (++index < format.length) {
            var c = format.charAt(index);

            if (c == "'") {
                index++;
                if (index == format.length)
                    break;

                if (format.charAt(index) == "'")
                    result += c;
                else
                    break;
            } else {
                result += c;
            }
        }

        return {
            value:  result,
            length: index - startIndex
        };
    }
};

DateFormat.DOTNET = {
    DayOfMonthShort:   'd',
    DayOfMonthLong:    'dd',
    DayOfWeekShort:    'ddd',
    DayOfWeekLong:     'dddd',
    DayOfYearShort:    null,
    DayOfYearLong:     null,
    MonthOfYearShort:  'M',
    MonthOfYearLong:   'MM',
    MonthNameShort:    'MMM',
    MonthNameLong:     'MMMM',
    YearShort:         'yy',
    YearLong:          'yyyy',
    AmPm:              'tt',
    Hour24Short:       'H',
    Hour24Long:        'HH',
    Hour12Short:       'h',
    Hour12Long:        'hh',
    MinuteShort:       'm',
    MinuteLong:        'mm',
    SecondShort:       's',
    SecondLong:        'ss',
    FractionalSecond1: 'f',
    FractionalSecond2: 'ff',
    FractionalSecond3: 'fff',
    TimeZone:          'zzz',
    UnixTimestamp:     null,

    makeLiteneral: function (literal) {
        var reserved = 'dfFghHKmMstyz\'"';
        if (DateFormat.indexOfAny(literal, reserved) < 0) {
            return literal;
        }

        var result = '';
        for (var i = 0; i < literal.length; i++) {
            var c = literal.charAt(i);
            if (Util.string.contains(reserved, c)) {
                result += '\\';
            }
            result += c;
        }

        return result;
    },

    readEscapedPart: function (format, startIndex) {
        var result = '';
        var index  = startIndex;
        while (index < format.length) {
            var c = format.charAt(index);

            if (c == '\\') {
                result += index == format.length - 1 ? '\\' : format[++index];
                index++;
                continue;
            }

            if (c == '"') {
                while (++index < format.length) {
                    var cc = format.charAt(index);
                    if (cc == '"')
                        break;

                    if (cc == '\\') {
                        result += index == format.length - 1 ? '\\' : format[++index];
                    } else {
                        result += cc;
                    }
                }
                index++;
                continue;
            }

            if (c == "'") {
                while (++index < format.length) {
                    var cc = format.charAt(index);
                    if (cc == "'")
                        break;

                    if (cc == '\\') {
                        result += index == format.length - 1 ? '\\' : format[++index];
                    } else {
                        result += cc;
                    }
                }
                index++;
                continue;
            }

            break;
        }

        return {
            value:  result,
            length: index - startIndex
        };
    }
};

window.DateFormat = DateFormat;

})();
