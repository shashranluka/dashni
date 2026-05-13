// Custom composition map: [sequence, PUA replacement]
// "" = sequence unknown, fill in when determined
const PUA_MAP = [
  ["ჺ", "\uE17A"], // 50
  ["ჵ", "\uE163"], // 49
  ["ჸ", "\uE174"], // 48
  ["ჰ\u0327", "\uE132"], // 47
  // ["ჴ\u02EC", "\uE159"], // 46
  ["ჴ\u0317", "\uE159"], // 46
  ["ჴ\u02EC", "\uE159"], // 46
  ["ჳ", "\uE156"], // 45
  ["ხ\u02EC", "\uE11A"], // 44
  ["შ\u02EC", "\uE0D8"], // 43
  ["ყ\u02EC", "\uE0C7"], // 42
  ["\u2322უ", "\uE199"], // 41
  ["უ\u0304ჼ", "\uE198"], // 40
  ["უჼ", "\uE09E"], // 39
  ["უ\u0304", "\uE097"], // 38
  ["უ\u0302", "\uE09D"], // 37
  ["უ\u0306", "\uE09B"], // 36
  ["ტ\u02EC", "\uE092"], // 35
  ["ს\u02EC", "\uE088"], // 34
  ["რ\u02BB", "\uE19C"], // 33
  ["\u2322ო", "\uE197"], // 32
  ["ო\u0304ჼ", "\uE06C"], // 31
  ["ოჼ", "\uE06B"], // 30
  ["ო\u0304\u0304", "\uE196"], // 29
  ["ო\u0304", "\uE064"], // 28
  ["ო\u0302", "\uE068"], // 27
  ["ო\u0306", "\uE067"], // 26
  ["ლ\u02BB", "\uE057"], // 25
  ["ლ\u02EC", "\uE19B"], // 24
  ["ჲჼ", "\uE19A"], // 23
  ["ჲ", "\uE135"], // 22
  ["\u2322ი", "\uE195"], // 21
  ["ი\u0304ჼ", "\uE040"], // 20
  ["იჼ", "\uE03F"], // 19
  ["ი\u0304", "\uE03C"], // 18
  ["ი\u0302", "\uE03E"], // 17
  ["თ\u02EC", "\uE035"], // 16
  ["\u2322ე\u0304", "\uE194"], // 15
  ["\u2322ე", "\uE193"], // 14
  ["ე\u0304ჼ", "\uE025"], // 13
  ["ეჼ", "\uE024"], // 12
  ["ე\u0304", "\uE021"], // 11
  ["ე\u0302", "\uE023"], // 10
  ["ე\u0306", "\uE022"], // 9
  [" აჼ", "\uE192"], // 8
  ["\u2322ა", "\uE191"], // 7
  ["ა\u0304ჼ", "\uE00A"], // 6
  ["აჼ", "\uE009"], // 5
  ["ა\u0304\u0304", "\uE190"], // 4
  ["ა\u0304", "\uE002"], // 3
  ["ა\u0302", "\uE008"], // 2
  ["ა\u0306", "\uE006"], // 1
];

/**
 * Converts Georgian combining character sequences to their PUA glyph equivalents
 * for display purposes. Storage always uses standard Unicode.
 * @param {string} str
 * @returns {string}
 */
export function toDisplayText(str) {
  if (!str) return str;
  let result = str;
  for (const [seq, pua] of PUA_MAP) {
    if (!seq) continue; // skip unknown sequences
    result = result.split(seq).join(pua);
  }
  return result;
}
