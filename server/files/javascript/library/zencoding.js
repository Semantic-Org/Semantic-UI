/**
 * Copyright (c) 2010 Mike Kent
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
(function($) {

  /*
   * Calling conventions:
   *
   * $.zc( ZenCode | ZenObject [, data] )
   *
   * ZenCode: string to be parsed into HTML
   * ZenObject: Collection of ZenCode and ZenObjects.  ZenObject.main must
   * be defined
   */
  $.zc = $.zen = function(ZenCode,data) {
    if(data !== undefined)
      var functions = data.functions;
    var el = createHTMLBlock(ZenCode,data,functions);
    return el;
  };

  var regZenTagDfn =
      /*
       * (
       *   [#\.@]?[\w!-]+         # tag names, ids, classes, and references
       *   |
       *   \[                     # attributes
       *     ([(\w|\-)!?=:"']+    # attribute name
       *       (="([^"]|\\")+")?  # attribute value
       *      {0,})+              # allow spaces, and look for 1+ attributes
       *   \]
       *   |
       *   \~[\w$]+=[\w$]+        # events in form -event=function
       *   |
       *   &[\w$\+(=[\w$]+)?      # data in form &data[=variable]
       *   |
       *   [#\.\@]?               # allow for types to precede dynamic names
       *   !([^!]|\\!)+!){0,}     # contents enclosed by !...!
       *   |
       *   (?:[^\\]|^)            # find either \ or beginning of line
       *   !
       * ){0,}                    # 0 or more of the above
       * (\{                      # contents
       *   (
       *     [^\}]
       *     |
       *     \\\}                 # find all before }, but include \}
       *   )+
       * \})?
       */
            /([#\.\@]?[\w-]+|\[([(\w|\-)!?=:"']+(="([^"]|\\")+")? {0,})+\]|\~[\w$]+=[\w$]+|&[\w$]+(=[\w$]+)?|[#\.\@]?!([^!]|\\!)+!){0,}(\{([^\}]|\\\})+\})?/i,
    regTag = /(\w+)/i,  //finds only the first word, must check for now word
    regId = /#((\-|[\w])+)/i, //finds id name
    regTagNotContent = /((([#\.]?[\w-]+)?(\[([\w!]+(="([^"]|\\")+")? {0,})+\])?)+)/i,
    regClasses = /(\.[\w-]+)/gi,  //finds all classes
    regClass = /\.([\w-]+)/i, //finds the class name of each class

    //finds reference objects
    regReference = /(@[\w$_][\w$_\d]+)/i,

    //finds attributes within '[' and ']' of type name or name="value"
    regAttrDfn = /(\[([(\w|\-)!]+(="([^"]|\\")+")? {0,})+\])/i,
    regAttrs = /([(\w|\-)!]+(="([^"]|\\")+")?)/gi,  //finds each attribute
    regAttr = /([(\w|\-)!]+)(="(([^"]|\\")+)")?/i,  //finds individual attribute and value

    //finds content within '{' and '}' while ignoring '\}'
    regCBrace = /\{(([^\}]|\\\})+)\}/i,
    //finds content within !...! while ignoring '\!' within !...!
    regExclamation = /(?:([^\\]|^))!([^!]|\\!)+!/gim,
    
    //finds events in form of -event=function
    regEvents = /\~[\w$]+(=[\w$]+)?/gi,
    regEvent = /\~([\w$]+)=([\w$]+)/i,
    
    //find data in form &data or &dataname=data
    regDatas = /&[\w$]+(=[\w$]+)?/gi,
    regData = /&([\w$]+)(=([\w$]+))?/i;

  /*
   * The magic happens here.
   *
   * This is the recursive function to break up, parse, and create every
   * element.
   */
  function createHTMLBlock(ZenObject,data,functions,indexes) {
    if($.isPlainObject(ZenObject))
      var ZenCode = ZenObject.main;
    else {
      var ZenCode = ZenObject;
      ZenObject = {
        main: ZenCode
      };
    }
    var origZenCode = ZenCode;
    if(indexes === undefined)
      indexes = {};
    // Take care of !for:...! and !if:...! structure and if $.isArray(data)
    if(ZenCode.charAt(0)=='!' || $.isArray(data)) {
      // If data is simply an array, then handle loop specially.
      // This allows for some shorthand and quick templating.
      if($.isArray(data))
        var forScope = ZenCode;
      // Check to see if an index is specified
      else {
        var obj = parseEnclosure(ZenCode,'!');
        obj = obj.substring(obj.indexOf(':')+1,obj.length-1);
        var forScope = parseVariableScope(ZenCode);
      }
      // Only parse the scope of the !for:! after taking care of references
      while(forScope.charAt(0) == '@')
        forScope = parseVariableScope(
          '!for:!'+parseReferences(forScope, ZenObject));
      // setup a zen object with the forScope as main
      var zo = ZenObject;
      zo.main = forScope;
      // initialize el for consistent use
      var el = $();
      if(ZenCode.substring(0,5)=="!for:" || $.isArray(data)) {  //!for:...!
        // again, data as an array is handled differently
        if(!$.isArray(data) && obj.indexOf(':')>0) {
          var indexName = obj.substring(0,obj.indexOf(':'));
          obj = obj.substr(obj.indexOf(':')+1);
        }
        // setup the array to either be data as a whole or an object
        // within data.  This is the reason for the two special exceptions
        // above to handle data as an aray.
        var arr = $.isArray(data)?data:data[obj];
        var zc = zo.main;
        if($.isArray(arr) || $.isPlainObject(arr)) {
          $.map(arr, function(value, index) {
            zo.main = zc;
            // initialize index if it was specified
            if(indexName!==undefined)
              indexes[indexName] = index;
            // allow for array references as "value" by wrapping the array
            // element.
            if(!$.isPlainObject(value))
              value = {value:value};
            // create the element based on ZenObject previously created
            var next = createHTMLBlock(zo,value,functions,indexes);
            if(el.length == 0)
              el = next;
            // append elements...  TODO: is this "if" necessary?
            else {
              $.each(next, function(index,value) {
                el.push(value);
              });
            }
          });
        }
        // if data is an array, then the whole ZenCode is looped, therefore
        // there is nothing left to do.
        if(!$.isArray(data))
          ZenCode = ZenCode.substr(obj.length+6+forScope.length);
        else
          ZenCode = '';
      } else if(ZenCode.substring(0,4)=="!if:") {  //!if:...!
        // check result of if contents
        var result = parseContents('!'+obj+'!',data,indexes);
        // Only execute ZenCode if the result was positive.
        if(result!='undefined' || result!='false' || result!='')
          el = createHTMLBlock(zo,data,functions,indexes);
        ZenCode = ZenCode.substr(obj.length+5+forScope.length);
      }
      // setup function ZenObject.main to reflect changes in both !for:!
      // and !if:!
      ZenObject.main = ZenCode;
    }
    // Take care of nested groups
    else if(ZenCode.charAt(0)=='(') {
      // get full parenthetical group
      var paren = parseEnclosure(ZenCode,'(',')');
      // exclude beginning and ending parentheses
      var inner = paren.substring(1,paren.length-1);
      // update ZenCode for later
      ZenCode = ZenCode.substr(paren.length);
      var zo = ZenObject;
      zo.main = inner;
      // create Element(s) based on contents of group
      var el = createHTMLBlock(zo,data,functions,indexes);
    }
    // Everything left should be a regular block
    else {
      var blocks = ZenCode.match(regZenTagDfn);
      var block = blocks[0];  // actual block to create
      if(block.length == 0) {
        return '';
      }
      // dereference references if any
      // references can drastically change the code in unexpected ways
      // so it is required to reparse the whole ZenObject.
      if(block.indexOf('@') >= 0) {
        ZenCode = parseReferences(ZenCode,ZenObject);
        var zo = ZenObject;
        zo.main = ZenCode;
        return createHTMLBlock(zo,data,functions,indexes);
      }
      // apply any dynamic content to block ZenCode
      block = parseContents(block,data,indexes);
      // get all classes
      var blockClasses = parseClasses(block);
      // get block id if any
      if(regId.test(block))
        var blockId = regId.exec(block)[1];
      // get block attributes
      var blockAttrs = parseAttributes(block,data);
      // default block tag is div unless block is only {...}, thenspan
      var blockTag = block.charAt(0)=='{'?'span':'div';
      // get block tag if it is explicitly defined
      if(ZenCode.charAt(0)!='#' && ZenCode.charAt(0)!='.' &&
          ZenCode.charAt(0)!='{')
        blockTag = regTag.exec(block)[1];
      // get block HTML contents
      if(block.search(regCBrace) != -1)
        var blockHTML = block.match(regCBrace)[1];
      // create jQuery attribute object with all data
      blockAttrs = $.extend(blockAttrs, {
        id: blockId,
        'class': blockClasses,
        html: blockHTML
      });
      // create Element based on block
      var el = $('<'+blockTag+'>', blockAttrs);
      el.attr(blockAttrs);  //fixes IE error (issue 2)
      // bind created element with any events and data
      el = bindEvents(block, el, functions);
      el = bindData(block, el, data);
      // remove block from ZenCode and update ZenObject
      ZenCode = ZenCode.substr(blocks[0].length);
      ZenObject.main = ZenCode;
    }

    // Recurse based on '+' or '>'
    if(ZenCode.length > 0) {
      // Create children
      if(ZenCode.charAt(0) == '>') {
        // one or more elements enclosed in a group
        if(ZenCode.charAt(1) == '(') {
          var zc = parseEnclosure(ZenCode.substr(1),'(',')');
          ZenCode = ZenCode.substr(zc.length+1);
        }
        // dynamically created elements or !for:! or !if:!
        else if(ZenCode.charAt(1) == '!') {
          var obj = parseEnclosure(ZenCode.substr(1),'!');
          var forScope = parseVariableScope(ZenCode.substr(1));
          var zc = obj+forScope;
          ZenCode = ZenCode.substr(zc.length+1);
        }
        // a single element that either ends the ZenCode or has siblings
        else {
          var len = Math.max(ZenCode.indexOf('+'),ZenCode.length);
          var zc = ZenCode.substring(1, len);
          ZenCode = ZenCode.substr(len);
        }
        var zo = ZenObject;
        zo.main = zc;
        // recurse and append
        var els = $(
          createHTMLBlock(zo,data,functions,indexes)
        );
        els.appendTo(el);
      }
      // Create siblings
      if(ZenCode.charAt(0) == '+') {
        var zo = ZenObject;
        zo.main = ZenCode.substr(1);
        // recurse and push new elements with current ones
        var el2 = createHTMLBlock(zo,data,functions,indexes);
        $.each(el2, function(index,value) {
          el.push(value);
        });
      }
    }
    var ret = el;
    return ret;
  }

  /*
   * Binds the appropiate data to the element specified by
   * &data=value
   * Or in the case of
   * &data
   * binds data.data to data on the element.
   */
  function bindData(ZenCode, el, data) {
    if(ZenCode.search(regDatas) == 0)
      return el;
    var datas = ZenCode.match(regDatas);
    if(datas === null)
      return el;
    for(var i=0;i<datas.length;i++) {
      var split = regData.exec(datas[i]);
      // the data dfn can be either &dfn or &data=dfn
      if(split[3] === undefined)
        $(el).data(split[1],data[split[1]]);
      else
        $(el).data(split[1],data[split[3]]);
    }
    return el;
  }

  /*
   * Binds the appropiate function to the event specified by
   * ~event=function
   * Or in the case of 
   * ~event
   * binds function.event to event.
   */
  function bindEvents(ZenCode, el, functions) {
    if(ZenCode.search(regEvents) == 0)
      return el;
    var bindings = ZenCode.match(regEvents);
    if(bindings === null)
      return el;
    for(var i=0;i<bindings.length;i++) {
      var split = regEvent.exec(bindings[i]);
      // function dfn can be either ~dfn or ~function=dfn
      if(split[2] === undefined)
        var fn = functions[split[1]];
      else
        var fn = functions[split[2]];
      $(el).bind(split[1],fn);
    }
    return el;
  }

  /*
   * parses attributes out of a single css element definition
   * returns as a space delimited string of attributes and their values
   */
  function parseAttributes(ZenBlock, data) {
    if(ZenBlock.search(regAttrDfn) == -1)
      return undefined;
    var attrStrs = ZenBlock.match(regAttrDfn);
    attrStrs = attrStrs[0].match(regAttrs);
    var attrs = {};
    for(var i=0;i<attrStrs.length;i++) {
      var parts = regAttr.exec(attrStrs[i]);
      attrs[parts[1]] = '';
      // all attributes must be attr="value"
      if(parts[3] !== undefined)
        attrs[parts[1]] = parseContents(parts[3],data);
    }
    return attrs;
  }

  /*
   * parses classes out of a single css element definition
   * returns as a space delimited string of classes
   */
  function parseClasses(ZenBlock) {
    ZenBlock = ZenBlock.match(regTagNotContent)[0];
    if(ZenBlock.search(regClasses) == -1)
      return undefined;
    var classes = ZenBlock.match(regClasses);
    var clsString = '';
    for(var i=0;i<classes.length;i++) {
      clsString += ' '+regClass.exec(classes[i])[1];
    }
    return $.trim(clsString);
  }

  /*
   * Converts !...! into its javascript equivelant.
   */
  function parseContents(ZenBlock, data, indexes) {
    if(indexes===undefined)
      indexes = {};
    var html = ZenBlock;
    if(data===undefined)
      return html;
    //The while takes care of the issue .!fruit!!fruit=="bla"?:".sd":""!
    //aka contigous !...!
    while(regExclamation.test(html)) {
      html = html.replace(regExclamation, function(str, str2) {
        var begChar = '';
        // don't process !for:! or !if:!
        if(str.indexOf("!for:") > 0 || str.indexOf("!if:") > 0)
          return str;
        // regex can return either !val! or x!val! where x is a misc char
        // begChar takes care of this second possability and saves the
        // character to be restored back to the string
        if(str.charAt(0) == '!')
          str = str.substring(1,str.length-1);
        else {
          begChar = str.charAt(0);
          str = str.substring(2,str.length-1);
        }
        // wrap a function with dfn to find value in either data or indexes
        var fn = new Function('data','indexes',
          'var r=undefined;'+
          'with(data){try{r='+str+';}catch(e){}}'+
          'with(indexes){try{if(r===undefined)r='+str+';}catch(e){}}'+
          'return r;');
        var val = unescape(fn(data,indexes));
        //var val = fn(data,indexes);
        return begChar+val;
      });
    }
    html = html.replace(/\\./g,function (str) {
      return str.charAt(1);
    });
    return unescape(html);
  }

  /*
   * There are actually three forms of this function:
   *
   * parseEnclosure(ZenCode,open) - use open as both open and close
   * parseEnclosure(ZenCode,open,close) - specify both
   * parseEnclosure(ZenCode,open,close,count) - specify initial count
   */
  function parseEnclosure(ZenCode,open,close,count) {
    if(close===undefined)
      close = open;
    var index = 1;
    // allow count to be either 1 if the string starts with an open char
    // or 0 and then return if it does not.
    if(count === undefined)
      count = ZenCode.charAt(0)==open?1:0;
    if(count==0)
      return;
    // go through each character to find the end of the enclosure while
    // keeping track of how deeply nested the parser currently is
    // and ignoring escaped enclosure characters.
    for(;count>0 && index<ZenCode.length;index++) {
      if(ZenCode.charAt(index)==close && ZenCode.charAt(index-1)!='\\')
        count--;
      else if(ZenCode.charAt(index)==open && ZenCode.charAt(index-1)!='\\')
        count++;
    }
    var ret = ZenCode.substring(0,index);
    return ret;
  }

  /*
   * Parses multiple ZenCode references.  The initial ZenCode must be
   * declared as ZenObject.main
   */
  function parseReferences(ZenCode, ZenObject) {
    ZenCode = ZenCode.replace(regReference, function(str) {
      str = str.substr(1);
      // wrap str in a function to find its value in the ZenObject
      var fn = new Function('objs',//'reparse',
        'var r="";'+
        'with(objs){try{'+
          //'if($.isPlainObject('+str+'))'+
          //  'r=reparse('+str+');'+
          //'else '+
            'r='+str+';'+
        '}catch(e){}}'+
        'return r;');
      return fn(ZenObject,parseReferences);
    });
    return ZenCode;
  }

  /*
   * Parses the scope of a !for:...!
   *
   * The scope of !for:...! is:
   *   If the tag has no children, then only immeiately following tag
   *   Tag and its children
   */
  function parseVariableScope(ZenCode) {
    // only parse !for:! or !if:!
    if(ZenCode.substring(0,5)!="!for:" &&
        ZenCode.substring(0,4)!="!if:")
      return undefined;
    // find the enclosure and remove it from the string 
    var forCode = parseEnclosure(ZenCode,'!');
    ZenCode = ZenCode.substr(forCode.length);
    // scope of !for:! and !if:! can only be one (if any) group of elements
    if(ZenCode.charAt(0) == '(') {
      return parseEnclosure(ZenCode,'(',')');
    }
    var tag = ZenCode.match(regZenTagDfn)[0];
    ZenCode = ZenCode.substr(tag.length);
    // scope of !for:! and !if:! is the single element and its children
    if(ZenCode.length==0 || ZenCode.charAt(0)=='+') {
      return tag;
    }
    else if(ZenCode.charAt(0)=='>') {
      var rest = '';
      rest = parseEnclosure(ZenCode.substr(1),'(',')',1);
      return tag+'>'+rest;
    }
    return undefined;
  }
 })(jQuery);