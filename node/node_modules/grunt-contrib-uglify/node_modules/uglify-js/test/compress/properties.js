keep_properties: {
    options = {
        properties: false
    };
    input: {
        a["foo"] = "bar";
    }
    expect: {
        a["foo"] = "bar";
    }
}

dot_properties: {
    options = {
        properties: true
    };
    input: {
        a["foo"] = "bar";
        a["if"] = "if";
    }
    expect: {
        a.foo = "bar";
        a["if"] = "if";
    }
}
