var data = "\
starting text\n\
<htmL>\n\
	<body>\n\
		<div style=\"width:100%\"></div>\n\
		<div name='\"foo\"'>xxx</div>\n\
		<div bar=baz>xxx</div>\n\
		<div wrong='<foo>'>xxx</div>\n\
	</BODY>\n\
</html>\n\
ending text\
";

console.log(data);

var Mode = {
	Text: 'text',
	Tags: 'tag',
	Attr: 'attr',
	CData: 'cdata',
	Comment: 'comment',
};

var state = {
	mode: Mode.Text,
	pos: 0,
	data: data,
	pending: null,
	output: [],
};

function parse (state) {
	switch (state.mode) {
		case Mode.Text:
			return parseText(state);
		case Mode.Tags:
			return parseTags(state);
		case Mode.Attr:
			return parseAttr(state);
		case Mode.CData:
			return parseCData(state);
		case Mode.Comment:
			return parseComment(state);
	}
}

function parseText (state) {
	console.log('parseText', state);
	var foundPos = state.data.indexOf('<', state.pos);
	if (foundPos === -1) {
		if (state.pending !== null) {
			state.output.push(state.pending + state.data.substring(state.pos, state.data.length));
			state.pending = null;
		} else {
			state.output.push(state.data.substring(state.pos, state.data.length));
		}
		state.pos = state.data.length;
	} else {
		var text = '';
		if (state.pending !== null) {
			text = state.pending + state.data.substring(state.pos, foundPos - 1);
			state.pending = null;
		} else {
			text = state.data.substring(state.pos, foundPos - 1);
		}
		state.output.push({ type: Mode.Text, data: text });
		state.pos = foundPos + 1;
		state.mode = Mode.Tags;
	}
}

var re_parseTags = /[\s>]/g;
function parseTags (state) {
	console.log('parseTags', state);
	re_parseTags.lastIndex = state.pos;
	var match = re_parseTags.exec(state.data);
	if (match) {
		if (match[0] === '>') {
			console.log('Just tag name', state.data.substring(state.pos, match.index));
			//process tag name
		} else {
			//process tag name
			//scan for attributes
		}
	} else {
		//end of tag?
	}
	process.exit();
}

function parseAttr (state) {
	console.log('parseAttr', state);
}

function parseCData (state) {
	console.log('parseCData', state);
}

function parseComment (state) {
	console.log('parseComment', state);
}

while (state.pos < state.data.length) {
	parse(state);
}
