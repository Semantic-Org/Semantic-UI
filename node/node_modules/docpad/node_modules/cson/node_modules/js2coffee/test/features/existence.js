function ifChecks() {
    if (x) { yep }
    if (!x) { yep }
}
function ifNullChecks() {
    if (x==null) { yep }
    if (x===null) { nah }
}
function voidChecks() {
    if (x==void 0) { yep }
    if (x===void 0) { nah }
    if (x==void 1) { yep }
}
function undefinedChecks() {
    if (typeof x == 'undefined') { nah }
}
function edgeCase() {
    if (!x == y) { nah }
}

function unlessChecks() {
    if (x!=null) { yep }
    if (x!==null) { nah }
    if (typeof x != 'undefined') { wat }
}

function whileAndFor() {
    while (x==null) { yep }
    while (x===null) { yep }

    for (a;x==null;2) { yep }
}
