import "./RareKeyboard.scss";

const RARE_SYMBOLS = [
  "ჱ",
  "ჲ",
  "ჳ",
  "ჴ",
  "ჵ",
  "ჶ",
  "ჷ",
  "ჸ",
  "ჹ",
  "ჺ",
  "჻",
  "ʼ",
  "«",
  "»",
  "—",
  "…",
];

function RareKeyboard({ isOpen, onToggle, onInsert, disabled = false }) {
  return (
    <div className={`rare-keyboard ${isOpen ? "is-open" : "is-closed"}`}>
      <div className="rare-keyboard__top">
        <strong>RareKeyboard</strong>
        <button type="button" onClick={onToggle} className="rare-keyboard__toggle">
          {isOpen ? "დამალვა" : "ჩვენება"}
        </button>
      </div>

      {isOpen ? (
        <div className="rare-keyboard__grid" aria-label="Rare symbols keyboard">
          {RARE_SYMBOLS.map((symbol) => (
            <button
              key={symbol}
              type="button"
              className="rare-keyboard__key"
              onClick={() => onInsert(symbol)}
              disabled={disabled}
              aria-label={`Insert ${symbol}`}
            >
              {symbol}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default RareKeyboard;
