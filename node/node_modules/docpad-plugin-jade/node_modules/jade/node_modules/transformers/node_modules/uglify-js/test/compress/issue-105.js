typeof_eq_undefined: {
    options = {
        comparisons: true,
        unsafe: false
    };
    input: { a = typeof b.c != "undefined" }
    expect: { a = "undefined" != typeof b.c }
}

typeof_eq_undefined_unsafe: {
    options = {
        comparisons: true,
        unsafe: true
    };
    input: { a = typeof b.c != "undefined" }
    expect: { a = b.c !== void 0 }
}
