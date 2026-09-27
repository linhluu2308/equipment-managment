const DAU_COMBINING_MARKS = /[̀-ͯ]/g;

export function boDau(s: string): string {
  return s
    .normalize("NFD")
    .replace(DAU_COMBINING_MARKS, "")
    .replace(/đ/gi, "d")
    .toLowerCase();
}
