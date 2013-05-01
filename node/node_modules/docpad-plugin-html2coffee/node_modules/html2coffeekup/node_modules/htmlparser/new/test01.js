var data = "\
starting text\n\
aaa<!--xxx-->bbb\n\
<![CDATA[This is the CData content]]>\n\
< htmL >\n\
    <body>\n\
        <div style=\"width:100%\"></div>\n\
        <div name='\"foo\"'>xxx</div>\n\
        <div bar=baz>yyyyyyyyyyyy</div>\n\
        <div wrong='<foo>'> zzzz zzz </div>\n\
        <div a='b' c=d e=\"f\">aaaa</div>\n\
    </BODY>\n\
</html>\n\
ending text\
<unclosed tag='foo' xxx='\
";

var Mode = {
    Text: 'text',
    Tag: 'tag',
    Attr: 'attr',
    CData: 'cdata',
    Comment: 'comment',
};

var state = {
    mode: Mode.Text,
    pos: 0,
    data: data,
    pendingText: null,
    lastTag: null,
    needData: false,
    output: [],
};

function parse (state) {
    switch (state.mode) {
        case Mode.Text:
            return parseText(state);
        case Mode.Tag:
            return parseTag(state);
        case Mode.Attr:
            return parseAttr(state);
        case Mode.CData:
            return parseCData(state);
        case Mode.Comment:
            return parseComment(state);
    }
}

function parseText (state) {
    // console.log('parseText', state);
    // console.log('parseText');
    var foundPos = state.data.indexOf('<', state.pos);
    var text = (foundPos === -1) ? state.data.substring(state.pos, state.data.length) : state.data.substring(state.pos, foundPos);
    if (foundPos === -1) {
        if (!state.pendingText) {
            state.pendingText = [];
        }
        state.pendingText.push(state.data.substring(state.pos, state.data.length));
        state.pos = state.data.length;
    } else {
        var text;
        if (state.pendingText) {
            state.pendingText.push(state.data.substring(state.pos, foundPos));
            text = state.pendingText.join('');
            state.pendingText = null;
        } else {
            text = state.data.substring(state.pos, foundPos)
        }
        state.output.push({ type: Mode.Text, data: text });
        state.pos = foundPos + 1;
        state.mode = Mode.Tag;
    }
}

var re_parseTag = /(\s*)([^\s>]+)(\s*)(>?)/g;
function parseTag (state) {
    // console.log('parseTag', state);
    // console.log('parseTag');
    re_parseTag.lastIndex = state.pos;
    var match = re_parseTag.exec(state.data);
    if (match) {
        if (match[2].substr(0, 3) === '!--') {
            state.mode = Mode.Comment;
            state.pos += 3;
            return;
        }
        if (match[2].substr(0, 8) === '![CDATA[') {
            state.mode = Mode.CData;
            state.pos += 8;
            return;
        }
        var raw;
        if (match[4] === '>') {
            state.mode = Mode.Text;
            raw = match[0].substr(0, match[0].length - 1);
        } else {
            state.mode = Mode.Attr;
            raw = match[0];
        }
        state.pos += match[0].length;
        var tag = { type: Mode.Tag, name: match[2].toLowerCase(), name_raw: match[2], raw: raw };
        if (state.mode === Mode.Attr) {
            state.lastTag = tag;
        }
        state.output.push(tag);
    } else {
        //TODO: end of tag?
        //TODO: push to pending?
        state.needData = true;
    }
}

var re_parseAttr_findName = /\s*([^=<>\s'"]+)\s*/g;
function parseAttr_findName (state) {
    re_parseAttr_findName.lastIndex = state.pos;
    var match = re_parseAttr_findName.exec(state.data);
    if (!match) {
        return null;
    }
    if (state.pos + match[0].length !== re_parseAttr_findName.lastIndex) {
        return null;
    }
    state.pos += match[0].length;
    state.lastTag.raw += match[0];
    return match[1];
}
var re_parseAttr_findValue = /\s*=\s*(?:'([^']*)'|"([^"]*)"|([^'"\s>]*))/g;
function parseAttr_findValue (state) {
    re_parseAttr_findValue.lastIndex = state.pos;
    var match = re_parseAttr_findValue.exec(state.data);
    if (!match) {
        return null;
    }
    if (state.pos + match[0].length !== re_parseAttr_findValue.lastIndex) {
        return null;
    }
    state.pos += match[0].length;
    state.lastTag.raw += match[0];
    return match[1] || match[2] || match[3];
};
function parseAttr (state) {
    // console.log('parseAttr', state);
    // console.log('parseAttr');
    var name = parseAttr_findName(state);
    if (!name) {
        var foundPos = state.data.indexOf('>', state.pos);
        if (foundPos < 0) {
            state.needData = true;
        } else {
            state.lastTag = null;
            state.pos = foundPos + 1;
            state.mode = Mode.Text;
        }
        return;
    }
    state.output.push({ type: Mode.Attr, name: name, name_raw: name.toLowerCase(), value: parseAttr_findValue(state) });
}

function parseCData (state) {
    // console.log('parseCData', state);
    // console.log('parseCData');
    var foundPos = state.data.indexOf(']]>', state.pos);
    if (foundPos < 0) {
        if (!state.pendingText) {
            state.pendingText = [];
        }
        state.pendingText.push(state.data.substr(state.pos, state.data.length));
        state.pos = state.data.length;
        state.needData = true;
    } else {
        var text;
        if (state.pendingText) {
            state.pendingText.push(state.data.substring(state.pos, foundPos));
            text = state.pendingText.join('');
            state.pendingText = null;
        } else {
            text = state.data.substring(state.pos, foundPos);
        }
        state.output.push({ type: Mode.CData, data: text });
        state.mode = Mode.Text;
        state.pos = foundPos + 3;
    }
}

function parseComment (state) {
    // console.log('parseComment', state);
    // console.log('parseComment');
    var foundPos = state.data.indexOf('-->', state.pos);
    if (foundPos < 0) {
        if (!state.pendingText) {
            state.pendingText = [];
        }
        state.pendingText.push(state.data.substr(state.pos, state.data.length));
        state.pos = state.data.length;
        state.needData = true;
    } else {
        var text;
        if (state.pendingText) {
            state.pendingText.push(state.data.substring(state.pos, foundPos));
            text = state.pendingText.join('');
            state.pendingText = null;
        } else {
            text = state.data.substring(state.pos, foundPos);
        }
        state.output.push({ type: Mode.Comment, data: text });
        state.mode = Mode.Text;
        state.pos = foundPos + 3;
    }
}

while (state.pos < state.data.length && !state.needData) {
    parse(state);
}
if (state.pendingText) {
    state.output.push({ type: state.mode, data: state.pendingText });
    state.pendingText = null;
}
console.log(state);

var buffer = [];
var lastType;
for (var i = 0, len = state.output.length; i < len; i++) {
    var node = state.output[i];
    if ((lastType === Mode.Attr && node.type !== Mode.Attr) || (lastType === Mode.Tag && node.type !== Mode.Attr)) {
        buffer.push('>');
    }
    switch (node.type) {

        case Mode.Text:
            buffer.push(node.data);
            break;

        case Mode.Comment:
            buffer.push('<!--', node.data, '-->');
            break;

        case Mode.CData:
            buffer.push('<![CDATA[', node.data, ']]>');
            break;

        case Mode.Tag:
            buffer.push('<', node.name);
            break;

        case Mode.Attr:
            var quoteChar = (node.value.indexOf('\'') < 0) ? '\'' : '"';
            buffer.push(' ', node.name, '=', quoteChar, node.value, quoteChar);
            break;

    }
    lastType = node.type;
}
if (lastType === Mode.Tag || lastType === Mode.Attr) {
    buffer.push('>');
}
console.log(buffer.join(''));
