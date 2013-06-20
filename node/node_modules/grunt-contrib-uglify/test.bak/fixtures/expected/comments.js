/*!
 * I am a comment
 */
function foo(){return 42}// @preserve preserve
// @license license
function bar(){return 2*foo()}/* @preserve
 * multiline preserve
 */
/* @license
 * multiline license
 */
function baz(){return bar()*bar()}