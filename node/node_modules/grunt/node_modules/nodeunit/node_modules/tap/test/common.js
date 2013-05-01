exports.taps = ["Tests for the foo module"
               ,{ok:true, name:"test that the foo is fooish"
                ,file:"foo.js", line:8, name:"fooish test"
                ,stack:new Error("fooish").stack}
               ,{ok:false, name:"a test that the bar is barish"
                ,file:"bar.js", line:25
                ,expected:"bar\nbar\nbaz", actual:"rab\nrib\nzib"
                ,hash:{more:"\nstuff\nhere\n",regexp:/asdf/}}
               ,"Quux module tests"
               ,"This is a longer comment"
               ,{ok:true, name:"an easy one."}
               ,{ok:false, name:"bloooooo"
                ,expected:"blerggeyyy"
                ,actual:"blorggeyy"}
               ,{ok:false, name:"array test"
                ,expected:[{ok:true},{ok:true},{stack:new Error().stack}]
                ,actual:[1234567890,123456789,{error:new Error("yikes")}]}
               ,{ok:true, name:"nulltest"
                ,expected:undefined, actual:null}
               ,{ok:true, name:"weird key test"
                ,expected:"weird key"
                ,actual:"weird key"
                ,"this object":{"has a ":"weird key"
                               ,"and a looooooooonnnnnnnnnggg":"jacket"}}
               ,{ok:true, name:"regexp test"
                ,regexp:/asdf/,function:function (a,b) { return a + b }}
               ]

if (require.main === module) {
  console.log("1..1")
  console.log("ok 1 - just setup, nothing relevant")
}
