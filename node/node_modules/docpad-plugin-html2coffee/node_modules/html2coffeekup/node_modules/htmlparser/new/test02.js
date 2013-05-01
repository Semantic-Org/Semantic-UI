var htmlparser = require('./htmlparser');

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
        , expected: [{ type: 'tag', name: 'div', name_raw: 'div', raw: 'div' }]
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
        , expected: [{ type: 'tag', name: 'div', name_raw: 'div', raw: 'div' }]
    }

    , 'split simple tag #2': {
        data: ['<d', 'iv>']
        , expected: [{ type: 'tag', name: 'div', name_raw: 'div', raw: 'div' }]
    }

    , 'split simple tag #3': {
        data: ['<div', '>']
        , expected: [{ type: 'tag', name: 'div', name_raw: 'div', raw: 'div' }]
    }

    , 'text before tag': {
        data: ['xxx<div>']
        , expected: [
            { type: 'text', data: 'xxx'},
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div' }
            ]
    }

    , 'text after tag': {
        data: ['<div>xxx']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div' },
            { type: 'text', data: 'xxx'}
            ]
    }

    , 'text inside tag': {
        data: ['<div>xxx</div>']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div' },
            { type: 'text', data: 'xxx'},
            { type: 'tag', name: '/div', name_raw: '/div', raw: '/div' }
            ]
    }

    , 'attribute with single quotes': {
        data: ['<div a=\'1\'>']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div a=\'1\'' },
            { type: 'attr', name:'a', name_raw: 'a', value: '1'}
            ]
    }

    , 'attribute with double quotes': {
        data: ['<div a="1">']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div a="1"' },
            { type: 'attr', name:'a', name_raw: 'a', value: '1'}
            ]
    }

    , 'attribute with no quotes': {
        data: ['<div a=1>']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div a=1' },
            { type: 'attr', name:'a', name_raw: 'a', value: '1'}
            ]
    }

    , 'attribute with no value': {
        data: ['<div wierd>']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div wierd' },
            { type: 'attr', name:'wierd', name_raw: 'wierd', value: null}
            ]
    }

    , 'attribute with no value, trailing text': {
        data: ['<div wierd>xxx']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div wierd' },
            { type: 'attr', name:'wierd', name_raw: 'wierd', value: null},
            { type: 'text', data: 'xxx' }
            ]
    }

    , 'tag with multiple attributes': {
        data: ['<div a="1" b="2">']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div a="1" b="2"' },
            { type: 'attr', name:'a', name_raw: 'a', value: '1'},
            { type: 'attr', name:'b', name_raw: 'b', value: '2'}
            ]
    }

    , 'tag with multiple attributes, trailing text': {
        data: ['<div a="1" b="2">xxx']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div a="1" b="2"' },
            { type: 'attr', name:'a', name_raw: 'a', value: '1'},
            { type: 'attr', name:'b', name_raw: 'b', value: '2'},
            { type: 'text', data: 'xxx' }
            ]
    }

    , 'tag with mixed attributes #1': {
        data: ['<div a=1 b=\'2\' c="3">']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div a=1 b=\'2\' c="3"' },
            { type: 'attr', name:'a', name_raw: 'a', value: '1'},
            { type: 'attr', name:'b', name_raw: 'b', value: '2'},
            { type: 'attr', name:'c', name_raw: 'c', value: '3'}
            ]
    }

    , 'tag with mixed attributes #2': {
        data: ['<div a=1 b="2" c=\'3\'>']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div a=1 b="2" c=\'3\'' },
            { type: 'attr', name:'a', name_raw: 'a', value: '1'},
            { type: 'attr', name:'b', name_raw: 'b', value: '2'},
            { type: 'attr', name:'c', name_raw: 'c', value: '3'}
            ]
    }

    , 'tag with mixed attributes #3': {
        data: ['<div a=\'1\' b=2 c="3">']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div a=\'1\' b=2 c="3"' },
            { type: 'attr', name:'a', name_raw: 'a', value: '1'},
            { type: 'attr', name:'b', name_raw: 'b', value: '2'},
            { type: 'attr', name:'c', name_raw: 'c', value: '3'}
            ]
    }

    , 'tag with mixed attributes #4': {
        data: ['<div a=\'1\' b="2" c=3>']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div a=\'1\' b="2" c=3' },
            { type: 'attr', name:'a', name_raw: 'a', value: '1'},
            { type: 'attr', name:'b', name_raw: 'b', value: '2'},
            { type: 'attr', name:'c', name_raw: 'c', value: '3'}
            ]
    }

    , 'tag with mixed attributes #5': {
        data: ['<div a="1" b=2 c=\'3\'>']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div a="1" b=2 c=\'3\'' },
            { type: 'attr', name:'a', name_raw: 'a', value: '1'},
            { type: 'attr', name:'b', name_raw: 'b', value: '2'},
            { type: 'attr', name:'c', name_raw: 'c', value: '3'}
            ]
    }

    , 'tag with mixed attributes #6': {
        data: ['<div a="1" b=\'2\' c="3">']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div a="1" b=\'2\' c="3"' },
            { type: 'attr', name:'a', name_raw: 'a', value: '1'},
            { type: 'attr', name:'b', name_raw: 'b', value: '2'},
            { type: 'attr', name:'c', name_raw: 'c', value: '3'}
            ]
    }

    , 'tag with mixed attributes, trailing text': {
        data: ['<div a=1 b=\'2\' c="3">xxx']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div a=1 b=\'2\' c="3"' },
            { type: 'attr', name:'a', name_raw: 'a', value: '1'},
            { type: 'attr', name:'b', name_raw: 'b', value: '2'},
            { type: 'attr', name:'c', name_raw: 'c', value: '3'},
            { type: 'text', data: 'xxx' }
            ]
    }

    , 'self closing tag': {
        data: ['<div/>']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div/' },
            { type: 'tag', name: '/div', name_raw: '/div', raw: null }
            ]
    }

    , 'self closing tag, trailing text': {
        data: ['<div/>xxx']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div/' },
            { type: 'tag', name: '/div', name_raw: '/div', raw: null },
            { type: 'text', data: 'xxx' }
            ]
    }

    , 'self closing tag with spaces #1': {
        data: ['<div />']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div /' },
            { type: 'tag', name: '/div', name_raw: '/div', raw: null }
            ]
    }

    , 'self closing tag with spaces #2': {
        data: ['<div/ >']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div/ ' },
            { type: 'tag', name: '/div', name_raw: '/div', raw: null }
            ]
    }

    , 'self closing tag with spaces #3': {
        data: ['<div / >']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div / ' },
            { type: 'tag', name: '/div', name_raw: '/div', raw: null }
            ]
    }

    , 'self closing tag with spaces, trailing text': {
        data: ['<div / >xxx']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div / ' },
            { type: 'tag', name: '/div', name_raw: '/div', raw: null },
            { type: 'text', data: 'xxx' }
            ]
    }

    , 'self closing tag with attribute': {
        data: ['<div a=b />']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div a=b /' },
            { type: 'attr', name:'a', name_raw: 'a', value: 'b'},
            { type: 'tag', name: '/div', name_raw: '/div', raw: null }
            ]
    }

    , 'self closing tag with attribute, trailing text': {
        data: ['<div a=b />xxx']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div a=b /' },
            { type: 'attr', name:'a', name_raw: 'a', value: 'b'},
            { type: 'tag', name: '/div', name_raw: '/div', raw: null },
            { type: 'text', data: 'xxx' }
            ]
    }

    , 'self closing tag split #1': {
        data: ['<div/', '>']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div/' },
            { type: 'tag', name: '/div', name_raw: '/div', raw: null }
            ]
    }

    , 'self closing tag split #2': {
        data: ['<div', '/>']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div/' },
            { type: 'tag', name: '/div', name_raw: '/div', raw: null }
            ]
    }

    , 'attribute missing close quote': {
        data: ['<div a="1><span id="foo">xxx']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div a="1><span id="foo' },
            { type: 'attr', name:'a', name_raw: 'a', value: '1><span id='},
            { type: 'attr', name:'foo', name_raw: 'foo', value: null},
            { type: 'text', data: 'xxx'}
            ]
    }

    , 'split attribute #1': {
        data: ['<div x', 'xx="yyy">']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div xxx="yyy"' },
            { type: 'attr', name:'xxx', name_raw: 'xxx', value: 'yyy'}
            ]
    }

    , 'split attribute #2': {
        data: ['<div xxx', '="yyy">']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div xxx="yyy"' },
            { type: 'attr', name:'xxx', name_raw: 'xxx', value: 'yyy'}
            ]
    }

    , 'split attribute #3': {
        data: ['<div xxx=', '"yyy">']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div xxx="yyy"' },
            { type: 'attr', name:'xxx', name_raw: 'xxx', value: 'yyy'}
            ]
    }

    , 'split attribute #4': {
        data: ['<div xxx="', 'yyy">']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div xxx="yyy"' },
            { type: 'attr', name:'xxx', name_raw: 'xxx', value: 'yyy'}
            ]
    }

    , 'split attribute #5': {
        data: ['<div xxx="yy', 'y">']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div xxx="yyy"' },
            { type: 'attr', name:'xxx', name_raw: 'xxx', value: 'yyy'}
            ]
    }

    , 'split attribute #6': {
        data: ['<div xxx="yyy', '">']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div xxx="yyy"' },
            { type: 'attr', name:'xxx', name_raw: 'xxx', value: 'yyy'}
            ]
    }

    , 'attribute split from tag #1': {
        data: ['<div ', 'xxx="yyy">']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div xxx="yyy"' },
            { type: 'attr', name:'xxx', name_raw: 'xxx', value: 'yyy'}
            ]
    }

    , 'attribute split from tag #2': {
        data: ['<div', ' xxx="yyy">']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div xxx="yyy"' },
            { type: 'attr', name:'xxx', name_raw: 'xxx', value: 'yyy'}
            ]
    }

    , 'text before complex tag': {
        data: ['xxx<div yyy="123">']
        , expected: [
            { type: 'text', data: 'xxx' },
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div yyy="123"'},
            { type: 'attr', name: 'yyy', name_raw: 'yyy', value: '123' }
            ]
    }

    , 'text after complex tag': {
        data: ['<div yyy="123">xxx']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div yyy="123"'},
            { type: 'attr', name: 'yyy', name_raw: 'yyy', value: '123' },
            { type: 'text', data: 'xxx' }
            ]
    }

    , 'text inside complex tag': {
        data: ['<div yyy="123">xxx</div>']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div yyy="123"'},
            { type: 'attr', name: 'yyy', name_raw: 'yyy', value: '123' },
            { type: 'text', data: 'xxx' },
            { type: 'tag', name: '/div', name_raw: '/div', raw: '/div'}
            ]
    }

    , 'nested tags': {
        data: ['<div><span></span></div>']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div'},
            { type: 'tag', name: 'span', name_raw: 'span', raw: 'span'},
            { type: 'tag', name: '/span', name_raw: '/span', raw: '/span'},
            { type: 'tag', name: '/div', name_raw: '/div', raw: '/div'}
            ]
    }

    , 'nested tags with attributes': {
        data: ['<div aaa="bbb"><span 123=\'456\'>xxx</span></div>']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div aaa="bbb"'},
            { type: 'attr', name: 'aaa', name_raw: 'aaa', value: 'bbb' },
            { type: 'tag', name: 'span', name_raw: 'span', raw: 'span 123=\'456\''},
            { type: 'attr', name: '123', name_raw: '123', value: '456' },
            { type: 'text', data: 'xxx' },
            { type: 'tag', name: '/span', name_raw: '/span', raw: '/span'},
            { type: 'tag', name: '/div', name_raw: '/div', raw: '/div'}
            ]
    }

    , 'comment inside tag': {
        data: ['<div><!-- comment text --></div>']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div'},
            { type: 'comment', data: ' comment text '},
            { type: 'tag', name: '/div', name_raw: '/div', raw: '/div'}
            ]
    }

    , 'cdata inside tag': {
        data: ['<div><![CDATA[ CData content ]]></div>']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div'},
            { type: 'cdata', data: ' CData content '},
            { type: 'tag', name: '/div', name_raw: '/div', raw: '/div'}
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
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div xxx=\'a"b\''},
            { type: 'attr', name: 'xxx', name_raw: 'xxx', value: 'a"b' }
            ]
    }

    , 'quotes in attribute #2': {
        data: ['<div xxx="a\'b">']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div xxx="a\'b"'},
            { type: 'attr', name: 'xxx', name_raw: 'xxx', value: 'a\'b' }
            ]
    }

    , 'brackets in attribute': {
        data: ['<div xxx="</div>">']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div xxx="</div>"'},
            { type: 'attr', name: 'xxx', name_raw: 'xxx', value: '</div>' }
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
        , expected: [{ type: 'tag', name: 'div', name_raw: 'div', raw: 'div'}]
    }

    , 'unfinished simple tag #2': {
        data: ['<div ']
        , expected: [{ type: 'tag', name: 'div', name_raw: 'div', raw: 'div '}]
    }

    , 'unfinished complex tag #1': {
        data: ['<div foo="bar"']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div foo="bar"'},
            { type: 'attr', name: 'foo', name_raw: 'foo', value: 'bar' }
            ]
    }

    , 'unfinished complex tag #2': {
        data: ['<div foo="bar" ']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div foo="bar" '},
            { type: 'attr', name: 'foo', name_raw: 'foo', value: 'bar' }
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
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div foo="bar' },
            { type: 'attr', name: 'foo', name_raw: 'foo', value: 'bar' }
            ]
    }

    , 'unfinished attribute #2': {
        data: ['<div foo="']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div foo="' },
            { type: 'attr', name: 'foo', name_raw: 'foo', value: null }
            ]
    }

    , 'spaces in tag #1': {
        data: ['< div>']
        , expected: [{ type: 'tag', name: 'div', name_raw: 'div', raw: ' div' }]
    }

    , 'spaces in tag #2': {
        data: ['<div >']
        , expected: [{ type: 'tag', name: 'div', name_raw: 'div', raw: 'div ' }]
    }

    , 'spaces in tag #3': {
        data: ['< div >']
        , expected: [{ type: 'tag', name: 'div', name_raw: 'div', raw: ' div ' }]
    }

    , 'spaces in tag, trailing text': {
        data: ['< div >xxx']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: ' div ' },
            { type: 'text', data: 'xxx' }
            ]
    }

    , 'spaces in attributes #1': {
        data: ['<div foo ="bar">']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div foo ="bar"' },
            { type: 'attr', name: 'foo', name_raw: 'foo', value: 'bar' }
            ]
    }

    , 'spaces in attributes #2': {
        data: ['<div foo= "bar">']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div foo= "bar"' },
            { type: 'attr', name: 'foo', name_raw: 'foo', value: 'bar' }
            ]
    }

    , 'spaces in attributes #3': {
        data: ['<div foo = "bar">']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div foo = "bar"' },
            { type: 'attr', name: 'foo', name_raw: 'foo', value: 'bar' }
            ]
    }

    , 'spaces in attributes #4': {
        data: ['<div foo =bar>']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div foo =bar' },
            { type: 'attr', name: 'foo', name_raw: 'foo', value: 'bar' }
            ]
    }

    , 'spaces in attributes #5': {
        data: ['<div foo= bar>']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div foo= bar' },
            { type: 'attr', name: 'foo', name_raw: 'foo', value: 'bar' }
            ]
    }

    , 'spaces in attributes #6': {
        data: ['<div foo = bar>']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div foo = bar' },
            { type: 'attr', name: 'foo', name_raw: 'foo', value: 'bar' }
            ]
    }

    , 'mixed case tag': {
        data: ['<diV>']
        , expected: [{ type: 'tag', name: 'div', name_raw: 'diV', raw: 'diV' }]
    }

    , 'upper case case tag': {
        data: ['<DIV>']
        , expected: [{ type: 'tag', name: 'div', name_raw: 'DIV', raw: 'DIV' }]
    }

    , 'mixed case attribute': {
        data: ['<div xXx="yyy">']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div xXx="yyy"' },
            { type: 'attr', name: 'xxx', name_raw: 'xXx', value: 'yyy' }
            ]
    }

    , 'upper case case attribute': {
        data: ['<div XXX="yyy">']
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: 'div XXX="yyy"' },
            { type: 'attr', name: 'xxx', name_raw: 'XXX', value: 'yyy' }
            ]
    }

    , 'multiline simple tag': {
        data: ["<\ndiv\n>"]
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: "\ndiv\n" }
            ]
    }

    , 'multiline complex tag': {
        data: ["<\ndiv\nid='foo'\n>"]
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: "\ndiv\nid='foo'\n" },
            { type: 'attr', name: 'id', name_raw: 'id', value: 'foo' }
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
            { type: 'tag', name: 'div', name_raw: 'div', raw: "div id='\nxxx\nyyy\n'" },
            { type: 'attr', name: 'id', name_raw: 'id', value: "\nxxx\nyyy\n" }
            ]
    }

    , 'multiline attribute #2': {
        data: ["<div id=\"\nxxx\nyyy\n\">"]
        , expected: [
            { type: 'tag', name: 'div', name_raw: 'div', raw: "div id=\"\nxxx\nyyy\n\"" },
            { type: 'attr', name: 'id', name_raw: 'id', value: "\nxxx\nyyy\n" }
            ]
    }

    // script tags
    // style tags

};

function runTests (permutator) {
    var parser = new htmlparser();

    var passed = 0;
    var failed = 0;

    console.time('Tests');
    for (var testName in tests) {
        var test = permutator ? permutator(tests[testName]) : tests[testName];
        process.stdout.write('[TEST] ' + testName + ' : ');
        parser.reset();
        for (var i = 0, len = test.data.length; i < len; i++) {
            parser.parse(test.data[i]);
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
