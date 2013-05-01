var htmlparser_old = require('../lib/htmlparser');
var htmlparser_new = require('./htmlparser');

var tests = {

    'plain text': {
        data: ['This is the text']
        , expected: [{ type: 'text', data: 'This is the text' }]
    }

    , 'split text': {
        data: ['This is', ' the text']
        , expected: [{ type: 'text', data: 'This is the text' }]
    }

    , 'simple tag': {
        data: ['<div>']
        , expected: [{ type: 'tag', name: 'div', raw: 'div' }]
    }

    , 'simple comment': {
        data: ['<!-- content -->']
        , expected: [{ type: 'comment', data: ' content ' }]
    }

    , 'simple cdata': {
        data: ['<![CDATA[ content ]]>']
        , expected: [{ type: 'cdata', data: ' content ' }]
    }

    , 'split simple tag #1': {
        data: ['<', 'div>']
        , expected: [{ type: 'tag', name: 'div', raw: 'div' }]
    }

    , 'split simple tag #2': {
        data: ['<d', 'iv>']
        , expected: [{ type: 'tag', name: 'div', raw: 'div' }]
    }

    , 'split simple tag #3': {
        data: ['<div', '>']
        , expected: [{ type: 'tag', name: 'div', raw: 'div' }]
    }

    , 'text before tag': {
        data: ['xxx<div>']
        , expected: [
            { type: 'text', data: 'xxx'},
            { type: 'tag', name: 'div', raw: 'div' }
            ]
    }

    , 'text after tag': {
        data: ['<div>xxx']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div' },
            { type: 'text', data: 'xxx'}
            ]
    }

    , 'text inside tag': {
        data: ['<div>xxx</div>']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div' },
            { type: 'text', data: 'xxx'},
            { type: 'tag', name: '/div', raw: '/div' }
            ]
    }

    , 'attribute with single quotes': {
        data: ['<div a=\'1\'>']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div a=\'1\'' },
            { type: 'attr', name:'a', data: '1'}
            ]
    }

    , 'attribute with double quotes': {
        data: ['<div a="1">']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div a="1"' },
            { type: 'attr', name:'a', data: '1'}
            ]
    }

    , 'attribute with no quotes': {
        data: ['<div a=1>']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div a=1' },
            { type: 'attr', name:'a', data: '1'}
            ]
    }

    , 'attribute with no value': {
        data: ['<div wierd>']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div wierd' },
            { type: 'attr', name:'wierd', data: null}
            ]
    }

    , 'attribute with no value, trailing text': {
        data: ['<div wierd>xxx']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div wierd' },
            { type: 'attr', name:'wierd', data: null},
            { type: 'text', data: 'xxx' }
            ]
    }

    , 'tag with multiple attributes': {
        data: ['<div a="1" b="2">']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div a="1" b="2"' },
            { type: 'attr', name:'a', data: '1'},
            { type: 'attr', name:'b', data: '2'}
            ]
    }

    , 'tag with multiple attributes, trailing text': {
        data: ['<div a="1" b="2">xxx']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div a="1" b="2"' },
            { type: 'attr', name:'a', data: '1'},
            { type: 'attr', name:'b', data: '2'},
            { type: 'text', data: 'xxx' }
            ]
    }

    , 'tag with mixed attributes #1': {
        data: ['<div a=1 b=\'2\' c="3">']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div a=1 b=\'2\' c="3"' },
            { type: 'attr', name:'a', data: '1'},
            { type: 'attr', name:'b', data: '2'},
            { type: 'attr', name:'c', data: '3'}
            ]
    }

    , 'tag with mixed attributes #2': {
        data: ['<div a=1 b="2" c=\'3\'>']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div a=1 b="2" c=\'3\'' },
            { type: 'attr', name:'a', data: '1'},
            { type: 'attr', name:'b', data: '2'},
            { type: 'attr', name:'c', data: '3'}
            ]
    }

    , 'tag with mixed attributes #3': {
        data: ['<div a=\'1\' b=2 c="3">']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div a=\'1\' b=2 c="3"' },
            { type: 'attr', name:'a', data: '1'},
            { type: 'attr', name:'b', data: '2'},
            { type: 'attr', name:'c', data: '3'}
            ]
    }

    , 'tag with mixed attributes #4': {
        data: ['<div a=\'1\' b="2" c=3>']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div a=\'1\' b="2" c=3' },
            { type: 'attr', name:'a', data: '1'},
            { type: 'attr', name:'b', data: '2'},
            { type: 'attr', name:'c', data: '3'}
            ]
    }

    , 'tag with mixed attributes #5': {
        data: ['<div a="1" b=2 c=\'3\'>']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div a="1" b=2 c=\'3\'' },
            { type: 'attr', name:'a', data: '1'},
            { type: 'attr', name:'b', data: '2'},
            { type: 'attr', name:'c', data: '3'}
            ]
    }

    , 'tag with mixed attributes #6': {
        data: ['<div a="1" b=\'2\' c="3">']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div a="1" b=\'2\' c="3"' },
            { type: 'attr', name:'a', data: '1'},
            { type: 'attr', name:'b', data: '2'},
            { type: 'attr', name:'c', data: '3'}
            ]
    }

    , 'tag with mixed attributes, trailing text': {
        data: ['<div a=1 b=\'2\' c="3">xxx']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div a=1 b=\'2\' c="3"' },
            { type: 'attr', name:'a', data: '1'},
            { type: 'attr', name:'b', data: '2'},
            { type: 'attr', name:'c', data: '3'},
            { type: 'text', data: 'xxx' }
            ]
    }

    , 'self closing tag': {
        data: ['<div/>']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div/' },
            { type: 'tag', name: '/div', raw: null }
            ]
    }

    , 'self closing tag, trailing text': {
        data: ['<div/>xxx']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div/' },
            { type: 'tag', name: '/div', raw: null },
            { type: 'text', data: 'xxx' }
            ]
    }

    , 'self closing tag with spaces #1': {
        data: ['<div />']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div /' },
            { type: 'tag', name: '/div', raw: null }
            ]
    }

    , 'self closing tag with spaces #2': {
        data: ['<div/ >']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div/ ' },
            { type: 'tag', name: '/div', raw: null }
            ]
    }

    , 'self closing tag with spaces #3': {
        data: ['<div / >']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div / ' },
            { type: 'tag', name: '/div', raw: null }
            ]
    }

    , 'self closing tag with spaces, trailing text': {
        data: ['<div / >xxx']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div / ' },
            { type: 'tag', name: '/div', raw: null },
            { type: 'text', data: 'xxx' }
            ]
    }

    , 'self closing tag with attribute': {
        data: ['<div a=b />']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div a=b /' },
            { type: 'attr', name:'a', data: 'b'},
            { type: 'tag', name: '/div', raw: null }
            ]
    }

    , 'self closing tag with attribute, trailing text': {
        data: ['<div a=b />xxx']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div a=b /' },
            { type: 'attr', name:'a', data: 'b'},
            { type: 'tag', name: '/div', raw: null },
            { type: 'text', data: 'xxx' }
            ]
    }

    , 'self closing tag split #1': {
        data: ['<div/', '>']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div/' },
            { type: 'tag', name: '/div', raw: null }
            ]
    }

    , 'self closing tag split #2': {
        data: ['<div', '/>']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div/' },
            { type: 'tag', name: '/div', raw: null }
            ]
    }

    , 'attribute missing close quote': {
        data: ['<div a="1><span id="foo">xxx']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div a="1><span id="foo' },
            { type: 'attr', name:'a', data: '1><span id='},
            { type: 'attr', name:'foo', data: null},
            { type: 'text', data: 'xxx'}
            ]
    }

    , 'split attribute #1': {
        data: ['<div x', 'xx="yyy">']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div xxx="yyy"' },
            { type: 'attr', name:'xxx', data: 'yyy'}
            ]
    }

    , 'split attribute #2': {
        data: ['<div xxx', '="yyy">']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div xxx="yyy"' },
            { type: 'attr', name:'xxx', data: 'yyy'}
            ]
    }

    , 'split attribute #3': {
        data: ['<div xxx=', '"yyy">']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div xxx="yyy"' },
            { type: 'attr', name:'xxx', data: 'yyy'}
            ]
    }

    , 'split attribute #4': {
        data: ['<div xxx="', 'yyy">']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div xxx="yyy"' },
            { type: 'attr', name:'xxx', data: 'yyy'}
            ]
    }

    , 'split attribute #5': {
        data: ['<div xxx="yy', 'y">']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div xxx="yyy"' },
            { type: 'attr', name:'xxx', data: 'yyy'}
            ]
    }

    , 'split attribute #6': {
        data: ['<div xxx="yyy', '">']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div xxx="yyy"' },
            { type: 'attr', name:'xxx', data: 'yyy'}
            ]
    }

    , 'attribute split from tag #1': {
        data: ['<div ', 'xxx="yyy">']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div xxx="yyy"' },
            { type: 'attr', name:'xxx', data: 'yyy'}
            ]
    }

    , 'attribute split from tag #2': {
        data: ['<div', ' xxx="yyy">']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div xxx="yyy"' },
            { type: 'attr', name:'xxx', data: 'yyy'}
            ]
    }

    , 'text before complex tag': {
        data: ['xxx<div yyy="123">']
        , expected: [
            { type: 'text', data: 'xxx' },
            { type: 'tag', name: 'div', raw: 'div yyy="123"'},
            { type: 'attr', name: 'yyy', data: '123' }
            ]
    }

    , 'text after complex tag': {
        data: ['<div yyy="123">xxx']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div yyy="123"'},
            { type: 'attr', name: 'yyy', data: '123' },
            { type: 'text', data: 'xxx' }
            ]
    }

    , 'text inside complex tag': {
        data: ['<div yyy="123">xxx</div>']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div yyy="123"'},
            { type: 'attr', name: 'yyy', data: '123' },
            { type: 'text', data: 'xxx' },
            { type: 'tag', name: '/div', raw: '/div'}
            ]
    }

    , 'nested tags': {
        data: ['<div><span></span></div>']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div'},
            { type: 'tag', name: 'span', raw: 'span'},
            { type: 'tag', name: '/span', raw: '/span'},
            { type: 'tag', name: '/div', raw: '/div'}
            ]
    }

    , 'nested tags with attributes': {
        data: ['<div aaa="bbb"><span 123=\'456\'>xxx</span></div>']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div aaa="bbb"'},
            { type: 'attr', name: 'aaa', data: 'bbb' },
            { type: 'tag', name: 'span', raw: 'span 123=\'456\''},
            { type: 'attr', name: '123', data: '456' },
            { type: 'text', data: 'xxx' },
            { type: 'tag', name: '/span', raw: '/span'},
            { type: 'tag', name: '/div', raw: '/div'}
            ]
    }

    , 'comment inside tag': {
        data: ['<div><!-- comment text --></div>']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div'},
            { type: 'comment', data: ' comment text '},
            { type: 'tag', name: '/div', raw: '/div'}
            ]
    }

    , 'cdata inside tag': {
        data: ['<div><![CDATA[ CData content ]]></div>']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div'},
            { type: 'cdata', data: ' CData content '},
            { type: 'tag', name: '/div', raw: '/div'}
            ]
    }

    , 'html inside comment': {
        data: ['<!-- <div>foo</div> -->']
        , expected: [{ type: 'comment', data: ' <div>foo</div> '}]
    }

    , 'html inside cdata': {
        data: ['<![CDATA[ <div>foo</div> ]]>']
        , expected: [{ type: 'cdata', data: ' <div>foo</div> '}]
    }

    , 'quotes in attribute #1': {
        data: ['<div xxx=\'a"b\'>']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div xxx=\'a"b\''},
            { type: 'attr', name: 'xxx', data: 'a"b' }
            ]
    }

    , 'quotes in attribute #2': {
        data: ['<div xxx="a\'b">']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div xxx="a\'b"'},
            { type: 'attr', name: 'xxx', data: 'a\'b' }
            ]
    }

    , 'brackets in attribute': {
        data: ['<div xxx="</div>">']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div xxx="</div>"'},
            { type: 'attr', name: 'xxx', data: '</div>' }
            ]
    }

    , 'split comment #1': {
        data: ['<','!-- comment text -->xxx']
        , expected: [
            { type: 'comment', data: ' comment text '},
            { type: 'text', data: 'xxx' }
            ]
    }

    , 'split comment #2': {
        data: ['<!','-- comment text -->xxx']
        , expected: [
            { type: 'comment', data: ' comment text '},
            { type: 'text', data: 'xxx' }
            ]
    }

    , 'split comment #3': {
        data: ['<!-','- comment text -->xxx']
        , expected: [
            { type: 'comment', data: ' comment text '},
            { type: 'text', data: 'xxx' }
            ]
    }

    , 'split comment #4': {
        data: ['<!--',' comment text -->xxx']
        , expected: [
            { type: 'comment', data: ' comment text '},
            { type: 'text', data: 'xxx' }
            ]
    }

    , 'split comment #5': {
        data: ['<!-- comment',' text -->xxx']
        , expected: [
            { type: 'comment', data: ' comment text '},
            { type: 'text', data: 'xxx' }
            ]
    }

    , 'split comment #6': {
        data: ['<!-- comment text ','-->xxx']
        , expected: [
            { type: 'comment', data: ' comment text '},
            { type: 'text', data: 'xxx' }
            ]
    }

    , 'split comment #7': {
        data: ['<!-- comment text -','->xxx']
        , expected: [
            { type: 'comment', data: ' comment text '},
            { type: 'text', data: 'xxx' }
            ]
    }

    , 'split comment #8': {
        data: ['<!-- comment text --','>xxx']
        , expected: [
            { type: 'comment', data: ' comment text '},
            { type: 'text', data: 'xxx' }
            ]
    }

    , 'split cdata #1': {
        data: ['<','![CDATA[ CData content ]]>']
        , expected: [{ type: 'cdata', data: ' CData content '}]
    }

    , 'split cdata #2': {
        data: ['<!','[CDATA[ CData content ]]>']
        , expected: [{ type: 'cdata', data: ' CData content '}]
    }

    , 'split cdata #3': {
        data: ['<![','CDATA[ CData content ]]>']
        , expected: [{ type: 'cdata', data: ' CData content '}]
    }

    , 'split cdata #4': {
        data: ['<![C','DATA[ CData content ]]>']
        , expected: [{ type: 'cdata', data: ' CData content '}]
    }

    , 'split cdata #5': {
        data: ['<![CD','ATA[ CData content ]]>']
        , expected: [{ type: 'cdata', data: ' CData content '}]
    }

    , 'split cdata #6': {
        data: ['<![CDA','TA[ CData content ]]>']
        , expected: [{ type: 'cdata', data: ' CData content '}]
    }

    , 'split cdata #7': {
        data: ['<![CDAT','A[ CData content ]]>']
        , expected: [{ type: 'cdata', data: ' CData content '}]
    }

    , 'split cdata #8': {
        data: ['<![CDATA','[ CData content ]]>']
        , expected: [{ type: 'cdata', data: ' CData content '}]
    }

    , 'split cdata #9': {
        data: ['<![CDATA[',' CData content ]]>']
        , expected: [{ type: 'cdata', data: ' CData content '}]
    }

    , 'split cdata #10': {
        data: ['<![CDATA[ CData ','content ]]>']
        , expected: [{ type: 'cdata', data: ' CData content '}]
    }

    , 'split cdata #11': {
        data: ['<![CDATA[ CData content ',']]>']
        , expected: [{ type: 'cdata', data: ' CData content '}]
    }

    , 'split cdata #12': {
        data: ['<![CDATA[ CData content ]',']>']
        , expected: [{ type: 'cdata', data: ' CData content '}]
    }

    , 'split cdata #13': {
        data: ['<![CDATA[ CData content ]]','>']
        , expected: [{ type: 'cdata', data: ' CData content '}]
    }

    , 'unfinished simple tag #1': {
        data: ['<div']
        , expected: [{ type: 'tag', name: 'div', raw: 'div'}]
    }

    , 'unfinished simple tag #2': {
        data: ['<div ']
        , expected: [{ type: 'tag', name: 'div', raw: 'div '}]
    }

    , 'unfinished complex tag #1': {
        data: ['<div foo="bar"']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div foo="bar"'},
            { type: 'attr', name: 'foo', data: 'bar' }
            ]
    }

    , 'unfinished complex tag #2': {
        data: ['<div foo="bar" ']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div foo="bar" '},
            { type: 'attr', name: 'foo', data: 'bar' }
            ]
    }

    , 'unfinished comment #1': {
        data: ['<!-- comment text']
        , expected: [{ type: 'comment', data: ' comment text'}]
    }

    , 'unfinished comment #2': {
        data: ['<!-- comment text ']
        , expected: [{ type: 'comment', data: ' comment text '}]
    }

    , 'unfinished comment #3': {
        data: ['<!-- comment text -']
        , expected: [{ type: 'comment', data: ' comment text -'}]
    }

    , 'unfinished comment #4': {
        data: ['<!-- comment text --']
        , expected: [{ type: 'comment', data: ' comment text --'}]
    }

    , 'unfinished cdata #1': {
        data: ['<![CDATA[ content']
        , expected: [{ type: 'cdata', data: ' content'}]
    }

    , 'unfinished cdata #2': {
        data: ['<![CDATA[ content ']
        , expected: [{ type: 'cdata', data: ' content '}]
    }

    , 'unfinished cdata #3': {
        data: ['<![CDATA[ content ]']
        , expected: [{ type: 'cdata', data: ' content ]'}]
    }

    , 'unfinished cdata #4': {
        data: ['<![CDATA[ content ]]']
        , expected: [{ type: 'cdata', data: ' content ]]'}]
    }

    , 'unfinished attribute #1': {
        data: ['<div foo="bar']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div foo="bar' },
            { type: 'attr', name: 'foo', data: 'bar' }
            ]
    }

    , 'unfinished attribute #2': {
        data: ['<div foo="']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div foo="' },
            { type: 'attr', name: 'foo', data: null }
            ]
    }

    , 'spaces in tag #1': {
        data: ['< div>']
        , expected: [{ type: 'tag', name: 'div', raw: ' div' }]
    }

    , 'spaces in tag #2': {
        data: ['<div >']
        , expected: [{ type: 'tag', name: 'div', raw: 'div ' }]
    }

    , 'spaces in tag #3': {
        data: ['< div >']
        , expected: [{ type: 'tag', name: 'div', raw: ' div ' }]
    }

    , 'spaces in closing tag #1': {
        data: ['< /div>']
        , expected: [{ type: 'tag', name: '/div', raw: ' /div' }]
    }

    , 'spaces in closing tag #2': {
        data: ['</ div>']
        , expected: [{ type: 'tag', name: '/div', raw: '/ div' }]
    }

    , 'spaces in closing tag #3': {
        data: ['</div >']
        , expected: [{ type: 'tag', name: '/div', raw: '/div ' }]
    }

    , 'spaces in closing tag #4': {
        data: ['< / div >']
        , expected: [{ type: 'tag', name: '/div', raw: ' / div ' }]
    }

    , 'spaces in tag, trailing text': {
        data: ['< div >xxx']
        , expected: [
            { type: 'tag', name: 'div', raw: ' div ' },
            { type: 'text', data: 'xxx' }
            ]
    }

    , 'spaces in attributes #1': {
        data: ['<div foo ="bar">']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div foo ="bar"' },
            { type: 'attr', name: 'foo', data: 'bar' }
            ]
    }

    , 'spaces in attributes #2': {
        data: ['<div foo= "bar">']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div foo= "bar"' },
            { type: 'attr', name: 'foo', data: 'bar' }
            ]
    }

    , 'spaces in attributes #3': {
        data: ['<div foo = "bar">']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div foo = "bar"' },
            { type: 'attr', name: 'foo', data: 'bar' }
            ]
    }

    , 'spaces in attributes #4': {
        data: ['<div foo =bar>']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div foo =bar' },
            { type: 'attr', name: 'foo', data: 'bar' }
            ]
    }

    , 'spaces in attributes #5': {
        data: ['<div foo= bar>']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div foo= bar' },
            { type: 'attr', name: 'foo', data: 'bar' }
            ]
    }

    , 'spaces in attributes #6': {
        data: ['<div foo = bar>']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div foo = bar' },
            { type: 'attr', name: 'foo', data: 'bar' }
            ]
    }

    , 'mixed case tag': {
        data: ['<diV>']
        , expected: [{ type: 'tag', name: 'diV', raw: 'diV' }]
    }

    , 'upper case tag': {
        data: ['<DIV>']
        , expected: [{ type: 'tag', name: 'DIV', raw: 'DIV' }]
    }

    , 'mixed case attribute': {
        data: ['<div xXx="yyy">']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div xXx="yyy"' },
            { type: 'attr', name: 'xXx', data: 'yyy' }
            ]
    }

    , 'upper case case attribute': {
        data: ['<div XXX="yyy">']
        , expected: [
            { type: 'tag', name: 'div', raw: 'div XXX="yyy"' },
            { type: 'attr', name: 'XXX', data: 'yyy' }
            ]
    }

    , 'multiline simple tag': {
        data: ["<\ndiv\n>"]
        , expected: [
            { type: 'tag', name: 'div', raw: "\ndiv\n" }
            ]
    }

    , 'multiline complex tag': {
        data: ["<\ndiv\nid='foo'\n>"]
        , expected: [
            { type: 'tag', name: 'div', raw: "\ndiv\nid='foo'\n" },
            { type: 'attr', name: 'id', data: 'foo' }
            ]
    }

    , 'multiline comment': {
        data: ["<!--\ncomment text\n-->"]
        , expected: [
            { type: 'comment', data: "\ncomment text\n" }
            ]
    }

    , 'cdata comment': {
        data: ["<![CDATA[\nCData content\n]]>"]
        , expected: [
            { type: 'cdata', data: "\nCData content\n" }
            ]
    }

    , 'multiline attribute #1': {
        data: ["<div id='\nxxx\nyyy\n'>"]
        , expected: [
            { type: 'tag', name: 'div', raw: "div id='\nxxx\nyyy\n'" },
            { type: 'attr', name: 'id', data: "\nxxx\nyyy\n" }
            ]
    }

    , 'multiline attribute #2': {
        data: ["<div id=\"\nxxx\nyyy\n\">"]
        , expected: [
            { type: 'tag', name: 'div', raw: "div id=\"\nxxx\nyyy\n\"" },
            { type: 'attr', name: 'id', data: "\nxxx\nyyy\n" }
            ]
    }

    , 'tags in script tag code': {
        data: ["<script language='javascript'>\nvar foo = '<bar>xxx</bar>';\n</script>"]
        , expected: [
            { type: 'tag', name: 'script', raw: "script language='javascript'" },
            { type: 'attr', name: 'language', data: 'javascript' },
            { type: 'text', data: "\nvar foo = '<bar>xxx</bar>';\n" },
            { type: 'tag', name: '/script', raw: "/script" },
            ]
    }

    , 'closing script tag in script tag code': {
        data: ["<script language='javascript'>\nvar foo = '</script>';\n</script>"]
        , expected: [
            { type: 'tag', name: 'script', raw: "script language='javascript'" },
            { type: 'attr', name: 'language', data: 'javascript' },
            { type: 'text', data: "\nvar foo = '" },
            { type: 'tag', name: '/script', raw: "/script" },
            { type: 'text', data: "';\n" },
            { type: 'tag', name: '/script', raw: "/script" }
            ]
    }

    , 'comment in script tag code': {
        data: ["<script language='javascript'>\nvar foo = '<!-- xxx -->';\n</script>"]
        , expected: [
            { type: 'tag', name: 'script', raw: "script language='javascript'" },
            { type: 'attr', name: 'language', data: 'javascript' },
            { type: 'text', data: "\nvar foo = '<!-- xxx -->';\n" },
            { type: 'tag', name: '/script', raw: "/script" },
            ]
    }

    , 'cdata in script tag code': {
        data: ["<script language='javascript'>\nvar foo = '<![CDATA[ xxx ]]>';\n</script>"]
        , expected: [
            { type: 'tag', name: 'script', raw: "script language='javascript'" },
            { type: 'attr', name: 'language', data: 'javascript' },
            { type: 'text', data: "\nvar foo = '<![CDATA[ xxx ]]>';\n" },
            { type: 'tag', name: '/script', raw: "/script" },
            ]
    }

    , 'commented script tag code': {
        data: ["<script language='javascript'>\n<!--\nvar foo = '<bar>xxx</bar>';\n//-->\n</script>"]
        , expected: [
            { type: 'tag', name: 'script', raw: "script language='javascript'" },
            { type: 'attr', name: 'language', data: 'javascript' },
            { type: 'text', data: "\n<!--\nvar foo = '<bar>xxx</bar>';\n//-->\n" },
            { type: 'tag', name: '/script', raw: "/script" },
            ]
    }

    , 'cdata in script tag': {
        data: ["<script language='javascript'>\n<![CDATA[\nvar foo = '<bar>xxx</bar>';\n]]>\n</script>"]
        , expected: [
            { type: 'tag', name: 'script', raw: "script language='javascript'" },
            { type: 'attr', name: 'language', data: 'javascript' },
            { type: 'text', data: "\n<![CDATA[\nvar foo = '<bar>xxx</bar>';\n]]>\n" },
            { type: 'tag', name: '/script', raw: "/script" },
            ]
    }

};

function runTests (permutator) {
    var callback = function handlerCallback (err) {
        if (err) {
            console.log('Handler error', err);
        }
    }
    var handler = new htmlparser_new.HtmlHandler(callback);
    var parser = new htmlparser_new.Parser(handler);

    var passed = 0;
    var failed = 0;

    console.time('Tests');
    for (var testName in tests) {
        var test = permutator ? permutator(tests[testName]) : tests[testName];
        process.stdout.write('[TEST] ' + testName + ' : ');
        parser.reset();
        for (var i = 0, len = test.data.length; i < len; i++) {
            parser.parseChunk(test.data[i]);
        }
        parser.done();
        var expected = JSON.stringify(test.expected);
        var result = JSON.stringify(parser.state.output);
        if (expected !== result) {
            failed++;
            process.stdout.write("FAIL\n");
            console.log('    [EXPECTED]', expected);
            console.log('    [ RESULT ]', result);
        } else {
            passed++;
            process.stdout.write("Ok\n");
        }
    }
    console.timeEnd('Tests');
    console.log('Passed tests: ' + passed + '/' + (passed + failed) + ' (' + Math.round(passed / (passed + failed) * 100) + '%)');
}

runTests();
runTests(function (test) {
    test.data = test.data.join('').split('');
    return test;
});

function handlerCallback (err, dom) {
    console.log(err || dom);
}

var handlerOld = new htmlparser_old.DefaultHandler(handlerCallback);
var parserOld = new htmlparser_old.Parser(handlerOld);

var handlerNew = new htmlparser_new.HtmlHandler(null, handlerCallback);
var parserNew = new htmlparser_new.Parser(handlerNew);
parserNew.parseComplete('<html></html>');

