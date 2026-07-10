export function isCoarsePointer() {
  return typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches;
}
