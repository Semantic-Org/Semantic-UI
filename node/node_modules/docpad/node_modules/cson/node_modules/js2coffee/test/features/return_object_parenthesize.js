function parenthesized() {
  return { a: 1, b: 2 };
  a();
}
function not_parenthesized() {
  return { a: 1 };
  a();
}
function parenthesized_b() {
  if (something()) {
    return { a: 1, b: 2 };
  }
}
function parenthesized_c() {
  if (something()) {
    return { a: 1, b: 2 };
  }
  a();
}
