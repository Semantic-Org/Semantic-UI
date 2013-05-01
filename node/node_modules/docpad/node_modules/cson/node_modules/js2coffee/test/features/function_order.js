var x = function() {
    alert(y());
    var z = function() { return 3; }
    function y() { return 2; }
}
