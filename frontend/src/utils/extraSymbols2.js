// Unified base for the "extra symbols" virtual keyboard.
//
// Every entry is ONE Georgian letter + diacritic combination that exists as a
// single glyph in two different fonts, so the same combination can be shown
// from either font and the keyboard can switch between them:
//
//   - `seq`          canonical Unicode this key stands for: a Georgian base
//                    letter plus combining marks / modifier letters. This is the
//                    value to STORE in text. Identical to the keys of PUA_MAP in
//                    `utils/georgiaNormalize.js`.
//   - `dosh`         Private-Use codepoint that renders this glyph in the
//                    "ICL Symbol" font (`public/fonts/DOSH.woff2` / `DOSH.TTF`) -
//                    the same code `georgiaNormalize.js` maps `seq` to.
//   - `brtln`  Latin-Extended codepoint that renders this glyph in the
//                    "BerTlanDosh" font (`public/fonts/berTlan-dosh.ttf`) - the
//                    same code the old `pages/poligon/extraSymbols.js` used.
//
// How the pairing was found: `poligon/extraSymbols.js` and `PUA_MAP` in
// `georgiaNormalize.js` both hold 50 entries in the same order, so entry i of
// one lines up with entry i of the other. Each pair was then checked by
// rendering both fonts at those codepoints - the outlines draw the same glyph.
//
// Combining marks / modifiers seen in `seq`:
//   \u0304 macron   \u0302 circumflex   \u0306 breve   \u0317 mark below
//   \u0327 cedilla  \u02BB turned comma \u02EC voicing  \u2322 arc above
//   \u10FC Georgian modifier nar

/** Font sources a key label can be rendered from. */
export const SYMBOL_FONT_SOURCES = {
  dosh: {
    key: "dosh",
    label: "ICL Symbol",
    fontFamily: '"ICL Symbol", "Arial GEO Bold", sans-serif',
    file: "/fonts/DOSH.woff2",
  },
  brtln: {
    key: "brtln",
    label: "BerTlanDosh",
    fontFamily: '"BerTlanDosh", sans-serif',
    file: "/fonts/berTlan-dosh.ttf",
  },
};

export const DEFAULT_SYMBOL_FONT_SOURCE = "dosh";

const extraSymbols2 = [
  { id: 1, base: "\u10D0", seq: "ა\u0306", dosh: "\uE006", brtln: "\u00E1" }, // #1 ა  ა + breve
  { id: 2, base: "\u10D0", seq: "ა\u0302", dosh: "\uE008", brtln: "\u00E2" }, // #2 ა  ა + circumflex
  { id: 3, base: "\u10D0", seq: "ა\u0304", dosh: "\uE002", brtln: "\u0111" }, // #3 ა  ა + macron
  { id: 4, base: "\u10D0", seq: "ა\u0304\u0304", dosh: "\uE190", brtln: "\u0112" }, // #4 ა  ა + macron + macron
  { id: 5, base: "\u10D0", seq: "აჼ", dosh: "\uE009", brtln: "\u00F6" }, // #5 ა  ა + nar
  { id: 6, base: "\u10D0", seq: "ა\u0304ჼ", dosh: "\uE00A", brtln: "\u0101" }, // #6 ა  ა + macron + nar
  { id: 7, base: "\u10D0", seq: "\u2322ა", dosh: "\uE191", brtln: "\u0104" }, // #7 ა  ⌢ ა
  // NOTE: georgiaNormalize.js stores this key with a leading literal space
  // ("\u0020\u10D0\u10FC"); likely a typo for \u2322 (frown), kept verbatim so the
  // two files stay in sync.
  { id: 8, base: "\u10D0", seq: "\u0020აჼ", dosh: "\uE192", brtln: "\u00FC" }, // #8 ა  (space) ა + nar
  { id: 9, base: "\u10D4", seq: "ე\u0306", dosh: "\uE022", brtln: "\u00E4" }, // #9 ე  ე + breve
  { id: 10, base: "\u10D4", seq: "ე\u0302", dosh: "\uE023", brtln: "\u00E5" }, // #10 ე  ე + circumflex
  { id: 11, base: "\u10D4", seq: "ე\u0304", dosh: "\uE021", brtln: "\u00E3" }, // #11 ე  ე + macron
  { id: 12, base: "\u10D4", seq: "ეჼ", dosh: "\uE024", brtln: "\u00F7" }, // #12 ე  ე + nar
  { id: 13, base: "\u10D4", seq: "ე\u0304ჼ", dosh: "\uE025", brtln: "\u0102" }, // #13 ე  ე + macron + nar
  { id: 14, base: "\u10D4", seq: "\u2322ე", dosh: "\uE193", brtln: "\u0105" }, // #14 ე  ⌢ ე
  { id: 15, base: "\u10D4", seq: "\u2322ე\u0304", dosh: "\uE194", brtln: "\u0114" }, // #15 ე  ⌢ ე + macron
  { id: 16, base: "\u10D7", seq: "თ\u02EC", dosh: "\uE035", brtln: "\u00ED" }, // #16 თ  თ + voicing
  { id: 17, base: "\u10D8", seq: "ი\u0302", dosh: "\uE03E", brtln: "\u00E7" }, // #17 ი  ი + circumflex
  { id: 18, base: "\u10D8", seq: "ი\u0304", dosh: "\uE03C", brtln: "\u00E6" }, // #18 ი  ი + macron
  { id: 19, base: "\u10D8", seq: "იჼ", dosh: "\uE03F", brtln: "\u00F8" }, // #19 ი  ი + nar
  { id: 20, base: "\u10D8", seq: "ი\u0304ჼ", dosh: "\uE040", brtln: "\u00FE" }, // #20 ი  ი + macron + nar
  { id: 21, base: "\u10D8", seq: "\u2322ი", dosh: "\uE195", brtln: "\u0106" }, // #21 ი  ⌢ ი
  { id: 22, base: "\u10F2", seq: "ჲ", dosh: "\uE135", brtln: "\u00D7" }, // #22 ჲ  ჲ
  { id: 23, base: "\u10F2", seq: "ჲჼ", dosh: "\uE19A", brtln: "\u00FB" }, // #23 ჲ  ჲ + nar
  { id: 24, base: "\u10DA", seq: "ლ\u02EC", dosh: "\uE19B", brtln: "\u00EE" }, // #24 ლ  ლ + voicing
  { id: 25, base: "\u10DA", seq: "ლ\u02BB", dosh: "\uE057", brtln: "\u0109" }, // #25 ლ  ლ + turned comma
  { id: 26, base: "\u10DD", seq: "ო\u0306", dosh: "\uE067", brtln: "\u0110" }, // #26 ო  ო + breve
  { id: 27, base: "\u10DD", seq: "ო\u0302", dosh: "\uE068", brtln: "\u00E9" }, // #27 ო  ო + circumflex
  { id: 28, base: "\u10DD", seq: "ო\u0304", dosh: "\uE064", brtln: "\u00E8" }, // #28 ო  ო + macron
  { id: 29, base: "\u10DD", seq: "ო\u0304\u0304", dosh: "\uE196", brtln: "\u0113" }, // #29 ო  ო + macron + macron
  { id: 30, base: "\u10DD", seq: "ოჼ", dosh: "\uE06B", brtln: "\u00F9" }, // #30 ო  ო + nar
  { id: 31, base: "\u10DD", seq: "ო\u0304ჼ", dosh: "\uE06C", brtln: "\u0103" }, // #31 ო  ო + macron + nar
  { id: 32, base: "\u10DD", seq: "\u2322ო", dosh: "\uE197", brtln: "\u0107" }, // #32 ო  ⌢ ო
  { id: 33, base: "\u10E0", seq: "რ\u02BB", dosh: "\uE19C", brtln: "\u010A" }, // #33 რ  რ + turned comma
  { id: 34, base: "\u10E1", seq: "ს\u02EC", dosh: "\uE088", brtln: "\u010C" }, // #34 ს  ს + voicing
  { id: 35, base: "\u10E2", seq: "ტ\u02EC", dosh: "\uE092", brtln: "\u00EF" }, // #35 ტ  ტ + voicing
  { id: 36, base: "\u10E3", seq: "უ\u0306", dosh: "\uE09B", brtln: "\u00EB" }, // #36 უ  უ + breve
  { id: 37, base: "\u10E3", seq: "უ\u0302", dosh: "\uE09D", brtln: "\u00EC" }, // #37 უ  უ + circumflex
  { id: 38, base: "\u10E3", seq: "უ\u0304", dosh: "\uE097", brtln: "\u00EA" }, // #38 უ  უ + macron
  { id: 39, base: "\u10E3", seq: "უჼ", dosh: "\uE09E", brtln: "\u00FA" }, // #39 უ  უ + nar
  { id: 40, base: "\u10E3", seq: "უ\u0304ჼ", dosh: "\uE198", brtln: "\u0100" }, // #40 უ  უ + macron + nar
  { id: 41, base: "\u10E3", seq: "\u2322უ", dosh: "\uE199", brtln: "\u0108" }, // #41 უ  ⌢ უ
  { id: 42, base: "\u10E7", seq: "ყ\u02EC", dosh: "\uE0C7", brtln: "\u00F1" }, // #42 ყ  ყ + voicing
  { id: 43, base: "\u10E8", seq: "შ\u02EC", dosh: "\uE0D8", brtln: "\u00F0" }, // #43 შ  შ + voicing
  { id: 44, base: "\u10EE", seq: "ხ\u02EC", dosh: "\uE11A", brtln: "\u00F2" }, // #44 ხ  ხ + voicing
  { id: 45, base: "\u10F3", seq: "ჳ", dosh: "\uE156", brtln: "\u00D9" }, // #45 ჳ  ჳ
  // NOTE: georgiaNormalize.js also lists an alternate key "\u10F4\u02EC" for the
  // same PUA glyph.
  { id: 46, base: "\u10F4", seq: "ჴ\u0317", dosh: "\uE159", brtln: "\u00F3" }, // #46 ჴ  ჴ + mark below
  { id: 47, base: "\u10F0", seq: "ჰ\u0327", dosh: "\uE132", brtln: "\u00F4" }, // #47 ჰ  ჰ + cedilla
  { id: 48, base: "\u10F8", seq: "ჸ", dosh: "\uE174", brtln: "\u00F5" }, // #48 ჸ  ჸ
  { id: 49, base: "\u10F5", seq: "ჵ", dosh: "\uE163", brtln: "\u010D" }, // #49 ჵ  ჵ
  // NOTE: the old poligon/extraSymbols.js repeated "\u00F4" (o-circumflex) for
  // this slot (identical to #47), so the berTlan-dosh codepoint for \u10FA (ჺ)
  // is unconfirmed. `seq` and `dosh` are correct; fix `brtln` once known.
  { id: 50, base: "\u10FA", seq: "ჺ", dosh: "\uE17A", brtln: "\u00F4" }, // #50 ჺ  ჺ
];

/**
 * Display character for a symbol entry under the given font source.
 * @param {(typeof extraSymbols2)[number]} entry
 * @param {"dosh" | "brtln"} [source]
 * @returns {string}
 */
export function symbolGlyph(entry, source = DEFAULT_SYMBOL_FONT_SOURCE) {
  return source === "brtln" ? entry.brtln : entry.dosh;
}

/** Entries grouped by their Georgian base letter, in table order. */
export const extraSymbolsByBase = extraSymbols2.reduce((groups, entry) => {
  (groups[entry.base] ||= []).push(entry);
  return groups;
}, /** @type {Record<string, typeof extraSymbols2>} */ ({}));

export default extraSymbols2;
