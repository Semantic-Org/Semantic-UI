(function () {

function runningInNode () {
    return(
        (typeof require) == "function"
        &&
        (typeof exports) == "object"
        &&
        (typeof module) == "object"
        &&
        (typeof __filename) == "string"
        &&
        (typeof __dirname) == "string"
        );
}

if (!runningInNode()) {
    if (!this.Tautologistics)
        this.Tautologistics = {};
    else if (this.Tautologistics.NodeHtmlParser)
        return; //NodeHtmlParser already defined!
    this.Tautologistics.NodeHtmlParser = {};
    exports = this.Tautologistics.NodeHtmlParser;
}

var Mode = {
    Text: 'text',
    Tag: 'tag',
    Attr: 'attr',
    CData: 'cdata',
    Comment: 'comment'
};

var re_parseText_scriptClose = /<\s*\/\s*script/ig;
function parseText (state) {
    var foundPos;
    if (state.isScript) {
        re_parseText_scriptClose.lastIndex = state.pos;
        foundPos = re_parseText_scriptClose.exec(state.data);
        foundPos = (foundPos) ?
            foundPos.index
            :
            -1
            ;
    } else {
        foundPos = state.data.indexOf('<', state.pos);
    }
    var text = (foundPos === -1) ? state.data.substring(state.pos, state.data.length) : state.data.substring(state.pos, foundPos);
    if (foundPos < 0 && state.done) {
        foundPos = state.data.length;
    }
    if (foundPos < 0) {
        if (state.isScript) {
            state.needData = true;
            return;
        }
        if (!state.pendingText) {
            state.pendingText = [];
        }
        state.pendingText.push(state.data.substring(state.pos, state.data.length));
        state.pos = state.data.length;
    } else {
        if (state.pendingText) {
            state.pendingText.push(state.data.substring(state.pos, foundPos));
            text = state.pendingText.join('');
            state.pendingText = null;
        } else {
            text = state.data.substring(state.pos, foundPos);
        }
        if (text !== '') {
            state.output.push({ type: Mode.Text, data: text });
        }
        state.pos = foundPos + 1;
        state.mode = Mode.Tag;
    }
}

var re_parseTag = /\s*(\/?)\s*([^\s>\/]+)(\s*)(>?)/g;
function parseTag (state) {
    re_parseTag.lastIndex = state.pos;
    var match = re_parseTag.exec(state.data);
    if (match) {
        if (!match[1] && match[2].substr(0, 3) === '!--') {
            state.mode = Mode.Comment;
            state.pos += 3;
            return;
        }
        if (!match[1] && match[2].substr(0, 8) === '![CDATA[') {
            state.mode = Mode.CData;
            state.pos += 8;
            return;
        }
        if (!state.done && (state.pos + match[0].length) === state.data.length) {
            //We're at the and of the data, might be incomplete
            state.needData = true;
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
        var tag = { type: Mode.Tag, name: match[1] + match[2], raw: raw };
        if (state.mode === Mode.Attr) {
            state.lastTag = tag;
        }
        if (tag.name.toLowerCase() === 'script') {
            state.isScript = true;
        } else if (tag.name.toLowerCase() === '/script') {
            state.isScript = false;
        }
        state.output.push(tag);
    } else {
        //TODO: end of tag?
        //TODO: push to pending?
        state.needData = true;
    }
}

var re_parseAttr_findName = /\s*([^=<>\s'"\/]+)\s*/g;
function parseAttr_findName (state) {
    re_parseAttr_findName.lastIndex = state.pos;
    var match = re_parseAttr_findName.exec(state.data);
    if (!match) {
        return null;
    }
    if (state.pos + match[0].length !== re_parseAttr_findName.lastIndex) {
        return null;
    }
    return {
          match: match[0]
        , name: match[1]
        };
}
var re_parseAttr_findValue = /\s*=\s*(?:'([^']*)'|"([^"]*)"|([^'"\s\/>]+))\s*/g;
var re_parseAttr_findValue_last = /\s*=\s*['"]?(.*)$/g;
function parseAttr_findValue (state) {
    re_parseAttr_findValue.lastIndex = state.pos;
    var match = re_parseAttr_findValue.exec(state.data);
    if (!match) {
        if (!state.done) {
            return null;
        }
        re_parseAttr_findValue_last.lastIndex = state.pos;
        match = re_parseAttr_findValue_last.exec(state.data);
        if (!match) {
            return null;
        }
        return {
              match: match[0]
            , value: (match[1] !== '') ? match[1] : null
            };
    }
    if (state.pos + match[0].length !== re_parseAttr_findValue.lastIndex) {
        return null;
    }
    return {
          match: match[0]
        , value: match[1] || match[2] || match[3]
        };
}
var re_parseAttr_splitValue = /\s*=\s*['"]?/g;
var re_parseAttr_selfClose = /(\s*\/\s*)(>?)/g;
function parseAttr (state) {
    var name_data = parseAttr_findName(state);
    if (!name_data) {
        re_parseAttr_selfClose.lastIndex = state.pos;
        var matchTrailingSlash = re_parseAttr_selfClose.exec(state.data);
        if (matchTrailingSlash && matchTrailingSlash.index === state.pos) {
            if (!state.done && !matchTrailingSlash[2] && state.pos + matchTrailingSlash[0].length === state.data.length) {
                state.needData = true;
                return;
            }
            state.lastTag.raw += matchTrailingSlash[1];
            state.output.push({ type: Mode.Tag, name: '/' + state.lastTag.name, raw: null });
            state.pos += matchTrailingSlash[1].length;
        }
        var foundPos = state.data.indexOf('>', state.pos);
        if (foundPos < 0) {
            if (state.done) { //TODO: is this needed?
                state.lastTag.raw += state.data.substr(state.pos);
                state.pos = state.data.length;
                return;
            }
            state.needData = true;
        } else {
            // state.lastTag = null;
            state.pos = foundPos + 1;
            state.mode = Mode.Text;
        }
        return;
    }
    if (!state.done && state.pos + name_data.match.length === state.data.length) {
        state.needData = true;
        return null;
    }
    state.pos += name_data.match.length;
    var value_data = parseAttr_findValue(state);
    if (value_data) {
        if (!state.done && state.pos + value_data.match.length === state.data.length) {
            state.needData = true;
            state.pos -= name_data.match.length;
            return;
        }
        state.pos += value_data.match.length;
    } else {
        re_parseAttr_splitValue.lastIndex = state.pos;
        if (re_parseAttr_splitValue.exec(state.data)) {
            state.needData = true;
            state.pos -= name_data.match.length;
            return;
        }
        value_data = {
              match: ''
            , value: null
            };
    }
    state.lastTag.raw += name_data.match + value_data.match;

    state.output.push({ type: Mode.Attr, name: name_data.name, data: value_data.value });
}

var re_parseCData_findEnding = /\]{1,2}$/;
function parseCData (state) {
    var foundPos = state.data.indexOf(']]>', state.pos);
    if (foundPos < 0 && state.done) {
        foundPos = state.data.length;
    }
    if (foundPos < 0) {
        re_parseCData_findEnding.lastIndex = state.pos;
        var matchPartialCDataEnd = re_parseCData_findEnding.exec(state.data);
        if (matchPartialCDataEnd) {
            state.needData = true;
            return;
        }
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

var re_parseComment_findEnding = /\-{1,2}$/;
function parseComment (state) {
    var foundPos = state.data.indexOf('-->', state.pos);
    if (foundPos < 0 && state.done) {
        foundPos = state.data.length;
    }
    if (foundPos < 0) {
        re_parseComment_findEnding.lastIndex = state.pos;
        var matchPartialCommentEnd = re_parseComment_findEnding.exec(state.data);
        if (matchPartialCommentEnd) {
            state.needData = true;
            return;
        }
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

function Parser (handler, options) {
    this._options = options ? options : { };
    if (this._options.includeLocation == undefined) {
        this._options.includeLocation = false; //Do not track element position in document by default
    }

    this.validateHandler(handler);
    var self = this;
    this._handler = handler;
    this.reset();
}

    Parser.prototype.reset = function Parser$reset () {
        this.state = {
            mode: Mode.Text,
            pos: 0,
            data: null,
            pendingText: null,
            lastTag: null,
            isScript: false,
            needData: false,
            // output: [],
            done: false
        };
    };

    Parser.prototype.parseChunk = function Parser$parseChunk (chunk) {
        this.state.needData = false;
        this.state.data = (this.state.data !== null) ?
             this.state.data.substr(this.pos) + chunk
             :
            chunk
            ;
        while (this.state.pos < this.state.data.length && !this.state.needData) {
            parse(this.state);
        }
    };

    Parser.prototype.parseComplete = function Parser$parseComplete (data) {
        this.reset();
        this.parseChunk(data);
        this.done();
    }

    Parser.prototype.done = function Parser$done () {
        this.state.done = true;
        parse(this.state);

    };

    Parser.prototype.validateHandler = function Parser$validateHandler (handler) {
        if ((typeof handler) != "object") {
            throw new Error("Handler is not an object");
        }
        if ((typeof handler.reset) != "function") {
            throw new Error("Handler method 'reset' is invalid");
        }
        if ((typeof handler.done) != "function") {
            throw new Error("Handler method 'done' is invalid");
        }
        if ((typeof handler.write) != "function") {
            throw new Error("Handler method 'write' is invalid");
        }
        if ((typeof handler.error) != "function") {
            throw new Error("Handler method 'error' is invalid");
        }
    }

// Parser.prototype.done_old = function Parser$done_old () {
//     if (this.state.pendingText) {
//         this.state.output.push({ type: this.state.mode, data: this.state.pendingText.join('') });
//         this.state.pendingText = null;
//     }
//     console.log(this.state);

//     var buffer = [];
//     var lastType;
//     for (var i = 0, len = this.state.output.length; i < len; i++) {
//         var node = this.state.output[i];
//         if ((lastType === Mode.Attr && node.type !== Mode.Attr) || (lastType === Mode.Tag && node.type !== Mode.Attr)) {
//             buffer.push('>');
//         }
//         switch (node.type) {

//             case Mode.Text:
//                 buffer.push(node.data);
//                 break;

//             case Mode.Comment:
//                 buffer.push('<!--', node.data, '-->');
//                 break;

//             case Mode.CData:
//                 buffer.push('<![CDATA[', node.data, ']]>');
//                 break;

//             case Mode.Tag:
//                 buffer.push('<', node.name);
//                 break;

//             case Mode.Attr:
//                 var quoteChar = (node.value.indexOf('\'') < 0) ? '\'' : '"';
//                 buffer.push(' ', node.name, '=', quoteChar, node.value, quoteChar);
//                 break;

//         }
//         lastType = node.type;
//     }
//     if (lastType === Mode.Tag || lastType === Mode.Attr) {
//         buffer.push('>');
//     }
//     console.log(buffer.join(''));
// };

function HtmlHandler (options, callback) {
    this.reset();
    this._options = options ? options : { };
    if (this._options.ignoreWhitespace == undefined) {
        this._options.ignoreWhitespace = false; //Keep whitespace-only text nodes
    }
    if (this._options.trackPosition == undefined) {
        this._options.trackPosition = false; //Include position of element (row, col) on nodes
    }
    if (this._options.verbose == undefined) {
        this._options.verbose = true; //Keep data property for tags and raw property for all
    }
    if (this._options.enforceEmptyTags == undefined) {
        this._options.enforceEmptyTags = true; //Don't allow children for HTML tags defined as empty in spec
    }
    if (this._options.caseSensitiveTags == undefined) {
        this._options.caseSensitiveTags = false; //Lowercase all tag names
    }
    if (this._options.caseSensitiveAttr == undefined) {
        this._options.caseSensitiveAttr = false; //Lowercase all attribute names
    }
    if ((typeof callback) == "function") {
        this._callback = callback;
    }
}

    //**"Static"**//
    //HTML Tags that shouldn't contain child nodes
    HtmlHandler._emptyTags = {
          area: 1
        , base: 1
        , basefont: 1
        , br: 1
        , col: 1
        , frame: 1
        , hr: 1
        , img: 1
        , input: 1
        , isindex: 1
        , link: 1
        , meta: 1
        , param: 1
        , embed: 1
    }
    //Regex to detect whitespace only text nodes
    HtmlHandler.reWhitespace = /^\s*$/;

    //**Public**//
    //Properties//
    HtmlHandler.prototype.dom = null; //The hierarchical object containing the parsed HTML
    //Methods//
    //Resets the handler back to starting state
    HtmlHandler.prototype.reset = function HtmlHandler$reset() {
        this.dom = [];
        this._done = false;
        this._tagStack = [];
        this._tagStack.last = function HtmlHandler$_tagStack$last () {
            return(this.length ? this[this.length - 1] : null);
        }
    }
    //Signals the handler that parsing is done
    HtmlHandler.prototype.done = function HtmlHandler$done () {
        this._done = true;
        this.handleCallback(null);
    }

    HtmlHandler.prototype.error = function HtmlHandler$error (error) {
        this.handleCallback(error);
    }

    HtmlHandler.prototype.handleCallback = function HtmlHandler$handleCallback (error) {
            if ((typeof this._callback) != "function")
                if (error)
                    throw error;
                else
                    return;
            this._callback(error, this.dom);
    }
    
    HtmlHandler.prototype.isEmptyTag = function HtmlHandler$isEmptyTag (element) {
        var name = element.name.toLowerCase();
        if (name.charAt(0) == '/') {
            name = name.substring(1);
        }
        return this._options.enforceEmptyTags && !!HtmlHandler._emptyTags[name];
    };

    HtmlHandler.prototype._copyElement = function HtmlHandler$_copyElement (element) {
        var newElement = { type: element.type };

        if (this._options.verbose && element['raw'] !== undefined) {
            newElement.raw = element.raw;
        }
        if (element['name'] !== undefined) {
            switch (element.type) {

                case Mode.Tag:
                    newElement.name = this._options.caseSensitiveTags ?
                        element.name
                        :
                        element.name.toLowerCase()
                        ;
                    break;

                case Mode.Attr:
                    newElement.name = this._options.caseSensitiveAttr ?
                        element.name
                        :
                        element.name.toLowerCase()
                        ;
                    break;

                default:
                    newElement.name = this._options.caseSensitiveTags ?
                        element.name
                        :
                        element.name.toLowerCase()
                        ;
                    break;

            }
        }
        if (element['data'] !== undefined) {
            newElement.data = element.name;
        }

        return newElement;
    }

    HtmlHandler.prototype.write = function HtmlHandler$write (element) {
        if (this._done) {
            this.handleCallback(new Error("Writing to the handler after done() called is not allowed without a reset()"));
        }
        if (element.type === Mode.Text && this._options.ignoreWhitespace) {
            if (HtmlHandler.reWhitespace.test(element.data)) {
                return;
            }
        }
        var node;
        if (!this._options.verbose) {
//          element.raw = null; //FIXME: Not clean
            //FIXME: Serious performance problem using delete
            delete element.raw;
            if (element.type == "tag" || element.type == "script" || element.type == "style") {
                delete element.data;
            }
        }
        if (!this._tagStack.last()) { //There are no parent elements
            //If the element can be a container, add it to the tag stack and the top level list
            if (element.type != Mode.Text && element.type != Mode.Comment && element.type != Mode.CData) {
                if (element.name.charAt(0) != "/") { //Ignore closing tags that obviously don't have an opening tag
                    node = this._copyElement(element);
                    this.dom.push(node);
                    if (!this.isEmptyTag(node)) { //Don't add tags to the tag stack that can't have children
                        this._tagStack.push(node);
                    }
                }
            }
            else //Otherwise just add to the top level list
                this.dom.push(this._copyElement(element));
        }
        else { //There are parent elements
            //If the element can be a container, add it as a child of the element
            //on top of the tag stack and then add it to the tag stack
            if (element.type != Mode.Text && element.type != Mode.Comment && element.type != Mode.CData) {
                if (element.name.charAt(0) == "/") {
                    //This is a closing tag, scan the tagStack to find the matching opening tag
                    //and pop the stack up to the opening tag's parent
                    var baseName = this._options.caseSensitiveTags ?
                        element.name.substring(1)
                        :
                        element.name.substring(1).toLowerCase()
                        ;
                    if (!this.isEmptyTag(element)) {
                        var pos = this._tagStack.length - 1;
                        while (pos > -1 && this._tagStack[pos--].name != baseName) { }
                        if (pos > -1 || this._tagStack[0].name == baseName) {
                            while (pos < this._tagStack.length - 1) {
                                this._tagStack.pop();
                            }
                        }
                    }
                }
                else { //This is not a closing tag
                    if (!this._tagStack.last().children) {
                        this._tagStack.last().children = [];
                    }
                    node = this._copyElement(element);
                    this._tagStack.last().children.push(node);
                    if (!this.isEmptyTag(node)) { //Don't add tags to the tag stack that can't have children
                        this._tagStack.push(node);
                    }
                }
            }
            else { //This is not a container element
                if (!this._tagStack.last().children)
                    this._tagStack.last().children = [];
                this._tagStack.last().children.push(this._copyElement(element));
            }
        }
    }


    //**Private**//
    //Properties//
    HtmlHandler.prototype._options = null; //Handler options for how to behave
    HtmlHandler.prototype._callback = null; //Callback to respond to when parsing done
    HtmlHandler.prototype._done = false; //Flag indicating whether handler has been notified of parsing completed
    HtmlHandler.prototype._tagStack = null; //List of parents to the currently element being processed
    //Methods//

exports.Parser = Parser;

exports.HtmlHandler = HtmlHandler;

// exports.RssHandler = RssHandler;

exports.ElementType = Mode;

// exports.DomUtils = DomUtils;

})();
