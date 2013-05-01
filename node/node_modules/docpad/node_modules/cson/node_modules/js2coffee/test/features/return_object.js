function a() {
  console.log("Hello");
  return { a: 1, b: 2 };
}
function b() {
  console.log("Hello");
  return { a: 1 };
}
function c() {
  return { a: 1, b: 2 };
}
function d() {
  ({ c: 3 });
  return { a: 1, b: 2 };
}
