function boop () {
    for (var i = 0; i < 30; i++) {
        nop();
    }
}

function nop () {
    return undefined;
}

var times = 0;
var iv = setInterval(function () {
    if (++times === 10) {
        clearInterval(iv);
        end();
    }
    else boop()
}, 100);
