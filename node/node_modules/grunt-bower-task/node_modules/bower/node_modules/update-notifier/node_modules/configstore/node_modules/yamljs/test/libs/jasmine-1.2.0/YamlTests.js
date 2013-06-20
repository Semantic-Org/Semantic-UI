YAML.parseTests=[
	{
		title: "Simple Sequence",
		input: 
'\
- apple\n\
- banana\n\
- carrot\n\
',
		output: ['apple', 'banana', 'carrot']
	},
	{
		title: "Nested Sequences",
		input: 
'\
-\n\
 - foo\n\
 - bar\n\
 - baz\n\
',
		output: [['foo', 'bar', 'baz']]
	},
	{
		title: "Mixed Sequences",
		input: 
'\
- apple\n\
-\n\
 - foo\n\
 - bar\n\
 - x123\n\
- banana\n\
- carrot\n\
',
		output: ['apple', ['foo', 'bar', 'x123'], 'banana', 'carrot']
	},
	{
		title: "Deeply Nested Sequences",
		input: 
'\
-\n\
 -\n\
  - uno\n\
  - dos\n\
',
		output: [[['uno', 'dos']]]
	},
	{
		title: "Simple Mapping",
		input: 
'\
foo: whatever\n\
bar: stuff\n\
',
		output: { 'foo' : 'whatever', 'bar' : 'stuff' } 
	},
	{
		title: "Sequence in a Mapping",
		input: 
'\
foo: whatever\n\
bar:\n\
 - uno\n\
 - dos\n\
',
		output: { 'foo' : 'whatever', 'bar' : [ 'uno', 'dos' ] } 
	},
	{
		title: "Unindented Sequence in a Mapping",
		input:
'\
foo:\n\
- uno: 1\n\
  dos: 2\n\
',
		output: { 'foo' : [ {'uno': 1, 'dos': 2} ] }
	},
	{
		title: "Nested Mappings",
		input: 
'\
foo: whatever\n\
bar:\n\
 fruit: apple\n\
 name: steve\n\
 sport: baseball\n\
',
		output: 
		{ 'foo' : 'whatever',  
			'bar' : { 
		     'fruit' : 'apple',  
		     'name' : 'steve', 
		     'sport' : 'baseball' 
		   } 
		} 
	},
	{
		title: "Mixed Mapping",
		input: 
'\
foo: whatever\n\
bar:\n\
 -\n\
   fruit: apple\n\
   name: steve\n\
   sport: baseball\n\
 - more\n\
 -\n\
   python: rocks\n\
   perl: papers\n\
   ruby: scissorses\n\
',
		output: 
		{ 'foo' : 'whatever',  
		  'bar' : [ 
		    { 
		        'fruit' : 'apple',  
		        'name' : 'steve', 
		        'sport' : 'baseball' 
		    }, 
		    'more', 
		    { 
		        'python' : 'rocks', 
		        'perl' : 'papers', 
		        'ruby' : 'scissorses' 
		    } 
		  ] 
		} 
	},
	{
		title: "Mapping-in-Sequence Shortcut",
		input: 
'\
- work on YAML.py:\n\
   - work on Store\n\
',
		output: [ { 'work on YAML.py' : ['work on Store'] } ] 
		
	},
	{
		title: "Sequence-in-Mapping Shortcut",
		input: 
"\
allow:\n\
- 'localhost'\n\
- '%.sourceforge.net'\n\
- '%.freepan.org'\n\
",
		output: { 'allow' : [ 'localhost', '%.sourceforge.net', '%.freepan.org' ] }
		
	},
	{
		title: "Merge key",
		disabled: true,
		input: 
"\
mapping:\n\
  name: Joe\n\
  job: Accountant\n\
  <<:\n\
    age: 38\n\
",
		output: 
		{ 'mapping' :
		  { 'name' : 'Joe',
		    'job' : 'Accountant',
		    'age' : 38
		  }
		}
	},
	{
		title: "Simple Inline Array",
		input: 
"\
--- \n\
seq: [ a, b, c ]\n\
",
		output: { 'seq' : [ 'a', 'b', 'c' ] }
		
	},
	{
		title: "Simple Inline Hash",
		input: 
"\
---\n\
hash: { name: Steve, foo: bar }\n\
",
		output: { 'hash' : { 'name' : 'Steve', 'foo' : 'bar' } } 
		
	},
	{
		title: "Multi-line Inline Collections",
		input: 
"\
languages: [ Ruby,\n\
             Perl,\n\
             Python ]\n\
websites: { YAML: yaml.org,\n\
            Ruby: ruby-lang.org,\n\
            Python: python.org,\n\
            Perl: use.perl.org }\n\
",
		output: 
		{ 'languages' : [ 'Ruby', 'Perl', 'Python' ], 
		  'websites' : { 
		    'YAML' : 'yaml.org', 
		    'Ruby' : 'ruby-lang.org', 
		    'Python' : 'python.org', 
		    'Perl' : 'use.perl.org'  
		  } 
		} 
	},
	{
		title: "Commas in Values",
		input: 
"\
attendances: [ 45,123, 70,000, 17,222 ]\n\
",
		output: { 'attendances' : [ 45123, 70000, 17222 ] }
		
	},
	{
		title: "Strings",
		input: 
"\
--- \n\
String\n\
",
		output: 'String'
		
	},
	{
		title: "String characters",
		input: 
"\
- What's Yaml?\n\
- It's for writing data structures in plain text.\n\
- And?\n\
- And what? That's not good enough for you?\n\
- No, I mean, \"And what about Yaml?\"\n\
- Oh, oh yeah. Uh.. Yaml for Ruby.\n\
",
		output: 
		[ 
		  "What's Yaml?", 
		  "It's for writing data structures in plain text.", 
		  "And?", 
		  "And what? That's not good enough for you?", 
		  "No, I mean, \"And what about Yaml?\"", 
		  "Oh, oh yeah. Uh.. Yaml for Ruby." 
		] 
	},
	{
		title: "Indicators in Strings",
		input: 
"\
the colon followed by space is an indicator: but is a string:right here\n\
same for the pound sign: here we have it#in a string\n\
the comma can, honestly, be used in most cases: [ but not in, inline collections ]\n\
",
		output: 
		{ 
		  'the colon followed by space is an indicator' : 'but is a string:right here', 
		  'same for the pound sign' : 'here we have it#in a string', 
		  'the comma can, honestly, be used in most cases' : [ 'but not in', 'inline collections' ] 
		} 
	},
	{
		title: "Forcing Strings",
		input: 
"\
date string: !str 2001-08-01\n\
number string: !str 192\n\
",
		output: 
		{ 
		  'date string' : '2001-08-01', 
		  'number string' : '192' 
		} 
	},
	{
		title: "Single-quoted Strings",
		input: 
"\
all my favorite symbols: '#:!/%.)'\n\
a few i hate: '&(*'\n\
why do i hate them?: 'it''s very hard to explain'\n\
",
		output: 
		{ 
		  'all my favorite symbols' : '#:!/%.)', 
		  'a few i hate' : '&(*', 
		  'why do i hate them?' : 'it\'s very hard to explain' 
		} 
	},
	{
		title: "Double-quoted Strings",
		input: 
'\
i know where i want my line breaks: "one here\\nand another here\\n"\n\
',
		output: 
		{ 
		  'i know where i want my line breaks' : "one here\nand another here\n" 
		} 
	},
	{
		title: "Multi-line Quoted Strings",
		input: 
"\
i want a long string: \"so i'm going to\n\
  let it go on and on to other lines\n\
  until i end it with a quote.\"\n\
",
		output: 
		{ 'i want a long string' : "so i'm going to " + 
		     "let it go on and on to other lines " + 
		     "until i end it with a quote." 
		} 
	},
	{
		title: "Plain scalars",
		input: 
"\
- My little toe is broken in two places;\n\
- I'm crazy to have skied this way;\n\
- I'm not the craziest he's seen, since there was always the German guy\n\
  who skied for 3 hours on a broken shin bone (just below the kneecap);\n\
- Nevertheless, second place is respectable, and he doesn't\n\
  recommend going for the record;\n\
- He's going to put my foot in plaster for a month;\n\
- This would impair my skiing ability somewhat for the\n\
  duration, as can be imagined.\n\
",
		output: 
		[
		  "My little toe is broken in two places;", 
		  "I'm crazy to have skied this way;", 
		  "I'm not the craziest he's seen, since there was always " +
		     "the German guy who skied for 3 hours on a broken shin " + 
		     "bone (just below the kneecap);", 
		  "Nevertheless, second place is respectable, and he doesn't " + 
		     "recommend going for the record;", 
		  "He's going to put my foot in plaster for a month;", 
		  "This would impair my skiing ability somewhat for the duration, " +
		     "as can be imagined."
		]
	},
	{
		title: "Null",
		input: 
"\
name: Mr. Show\n\
hosted by: Bob and David\n\
date of next season: ~\n\
",
		output: 
		{ 
		  'name' : 'Mr. Show', 
		  'hosted by' : 'Bob and David', 
		  'date of next season' : null 
		}
	},
	{
		title: "Boolean",
		input: 
"\
Is Gus a Liar?: true\n\
Do I rely on Gus for Sustenance?: false\n\
",
		output: 
		{ 
		  'Is Gus a Liar?' : true, 
		  'Do I rely on Gus for Sustenance?' : false 
		} 
	},
	{
		title: "Integers",
		input: 
"\
zero: 0\n\
simple: 12\n\
one-thousand: 1,000\n\
negative one-thousand: -1,000\n\
",
		output: 
		{ 
		  'zero' : 0, 
		  'simple' : 12, 
		  'one-thousand' : 1000, 
		  'negative one-thousand' : -1000 
		} 
	},
	{
		title: "Integers as Map Keys",
		input: 
"\
1: one\n\
2: two\n\
3: three\n\
",
		output: 
		{ 
		    1 : 'one', 
		    2 : 'two', 
		    3 : 'three' 
		} 
	},
	{
		title: "Floats",
		input: 
"\
a simple float: 2.00\n\
larger float: 1,000.09\n\
scientific notation: 1.00009e+3\n\
",
		output: 
		{ 
		  'a simple float' : 2.0, 
		  'larger float' : 1000.09, 
		  'scientific notation' : 1000.09 
		} 
	},
	{
		title: "Time",
		input: 
"\
iso8601: 2001-12-14t21:59:43.10-05:00\n\
space seperated: 2001-12-14 21:59:43.10 -05:00\n\
",
		output: 
		{ 
		  'iso8601' : new Date("2001-12-14t21:59:43.10-05:00"), 
		  'space seperated' : new Date("2001-12-14 21:59:43.10 -05:00")
		} 
	},
	{
		title: "Date",
		input: 
"\
1976-07-31\n\
",
		output:  new Date("1976-07-31"), 
		
	},
	{
		title: "Single ending newline",
		input: 
"\
---\n\
this: |\n\
    Foo\n\
    Bar\n\
",
		output: { 'this' : "Foo\nBar\n" } 
		
	},
	{
		title: "The '+' indicator",
		input: 
"\
normal: |\n\
  extra new lines not kept\n\
\n\
preserving: |+\n\
  extra new lines are kept\n\
\n\
\n\
dummy: value\n\
",
		output: 
		{ 
		    'normal' : "extra new lines not kept\n", 
		    'preserving' : "extra new lines are kept\n\n\n", 
		    'dummy' : 'value' 
		} 
	},
	{
		title: "Three trailing newlines in literals",
		input: 
'\
clipped: |\n\
    This has one newline.\n\
\n\
\n\
\n\
same as "clipped" above: "This has one newline.\n"\n\
\n\
stripped: |-\n\
    This has no newline.\n\
\n\
\n\
\n\
same as "stripped" above: "This has no newline."\n\
\n\
kept: |+\n\
    This has four newlines.\n\
\n\
\n\
\n\
same as "kept" above: "This has four newlines.\n\n\n\n"\n\
',
		output: 
		{  
		  'clipped' : "This has one newline.\n", 
		  'same as "clipped" above' : "This has one newline.\n", 
		  'stripped' : 'This has no newline.', 
		  'same as "stripped" above' : 'This has no newline.', 
		  'kept' : "This has four newlines.\n\n\n\n", 
		  'same as "kept" above' : "This has four newlines.\n\n\n\n" 
		}
	},
	{
		title: "Extra trailing newlines with spaces",
		input: 
"\
---\n\
this: |\n\
    Foo\n\
\n\
      \n\
kept: |+\n\
    Foo\n\
      \n\
",
		output: 
		{ 'this' : "Foo\n\n  \n",  
		  'kept' : "Foo\n\n  \n" } 
	},
	{
		title: "Folded Block in a Sequence",
		input: 
"\
---\n\
- apple\n\
- banana\n\
- >\n\
    can't you see\n\
    the beauty of yaml?\n\
    hmm\n\
- dog\n\
",
		output: 
		[ 
		    'apple',  
		    'banana',  
		    "can't you see the beauty of yaml? hmm\n", 
		    'dog' 
		] 
	},
	{
		title: "Folded Block as a Mapping Value",
		input: 
"\
---\n\
quote: >\n\
    Mark McGwire's\n\
    year was crippled\n\
    by a knee injury.\n\
source: espn\n\
",
		output: 
		{  
		    'quote' : "Mark McGwire's year was crippled by a knee injury.\n", 
		    'source' : 'espn' 
		} 
	},
	{
		title: "Three trailing newlines in folded blocks",
		input: 
'\
clipped: >\n\
    This has one newline.\n\
\n\
\n\
\n\
same as "clipped" above: "This has one newline.\\n"\n\
\n\
stripped: >-\n\
    This has no newline.\n\
\n\
\n\
\n\
same as "stripped" above: "This has no newline."\n\
\n\
kept: >+\n\
    This has four newlines.\n\
\n\
\n\
\n\
same as "kept" above: "This has four newlines.\\n\\n\\n\\n"\n\
',
		output: 
		{  
		  'clipped' : "This has one newline.\n", 
		  'same as "clipped" above' : "This has one newline.\n", 
		  'stripped' : 'This has no newline.', 
		  'same as "stripped" above' : 'This has no newline.', 
		  'kept' : "This has four newlines.\n\n\n\n", 
		  'same as "kept" above' : "This has four newlines.\n\n\n\n" 
		} 
	},
	{
		title: "Simple Alias Example",
		input: 
"\
- &showell Steve\n\
- Clark\n\
- Brian\n\
- Oren\n\
- *showell\n\
",
		output: [ 'Steve', 'Clark', 'Brian', 'Oren', 'Steve' ] 
		
	},
	{
		title: "Alias of a Mapping",
		input: 
"\
- &hello\n\
    Meat: pork\n\
    Starch: potato\n\
- banana\n\
- *hello\n\
",
		output: 
		[  
		  { 'Meat' : 'pork', 'Starch' : 'potato' },  
		  'banana', 
		  { 'Meat' : 'pork', 'Starch' : 'potato' } 
		] 
	},
/*	{
		title: "Trailing Document Separator",
		input: 
"\
- foo: 1\n\
  bar: 2\n\
---\n\
more: stuff\n\
",
		output: [ { 'foo' : 1, 'bar' : 2 } ]
		
	},*/
	{
		title: "Leading Document Separator",
		input: 
"\
---\n\
- foo: 1\n\
  bar: 2\n\
# ---\n\
# more: stuff\n\
",
		output: [ { 'foo' : 1, 'bar' : 2 } ]
		
	},
	{
		title: "YAML Header",
		input: 
"\
--- %YAML:1.0\n\
foo: 1\n\
bar: 2\n\
",
		output: { 'foo' : 1, 'bar' : 2 }
		
	},
	{
		title: "Red Herring Document Separator",
		input: 
"\
foo: |\n\
    ---\n\
",
		output: { 'foo' : "---\n" } 
		
	},
	{
		title: "Strings",
		input: 
"\
foo: |\n\
    ---\n\
    foo: bar\n\
    ---\n\
    yo: baz\n\
bar: |\n\
    fooness\n\
",
		output: 
		{ 
		   'foo' : "---\nfoo: bar\n---\nyo: baz\n", 
		   'bar' : "fooness\n" 
		} 
		
	},
	
];
