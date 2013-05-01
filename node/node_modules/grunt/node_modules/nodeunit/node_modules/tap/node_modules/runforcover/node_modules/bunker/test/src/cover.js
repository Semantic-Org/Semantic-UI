var i = 0;
var iv = setInterval(function () {
    if (i++ === 10) {
        clearInterval(iv);
    }
}, 10);
