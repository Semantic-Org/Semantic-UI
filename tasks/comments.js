module.exports = {
  // remove variable comments from css
  variables : {
    in  : /\/\*[\s\S]+\/\* End Config \*\//m,
    out : '',
  },
  // adds spacing around comments
  large: {
    in  : /(\/\*\*\*\*[\s\S]+?\*\/)/mg,
    out : '\n\n$1\n'
  },
  small: {
    in  : /(\/\*---[\s\S]+?\*\/)/mg,
    out : '\n$1\n'
  },
  tiny: {
    in  : /(\/\* [\s\S]+? \*\/)/mg,
    out : '\n$1'
  }
};