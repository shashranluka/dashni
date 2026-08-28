import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import extraSymbols2, {
  SYMBOL_FONT_SOURCES,
} from "../../utils/extraSymbols2";
import "./ExtraSymbolKeyboard.scss";

const DOSH_FONT_FAMILY = SYMBOL_FONT_SOURCES.dosh.fontFamily;

/**
 * Virtual keyboard for the "extra" Georgian letter+diacritic symbols.
 *
 * Collapsible like `FullRareKeyboard`: starts closed, a toggle at the bottom
 * shows/hides the keys. Keys render with the "ICL Symbol" font (the `dosh`
 * codepoint of each entry). What gets inserted is controlled by `insertMode`:
 *   - "seq"     -> the canonical Unicode sequence (`entry.seq`), matching the
 *                  rest of the app / georgiaNormalize.
 *   - "display" -> the shown PUA codepoint (`entry.dosh`).
 *
 * @param {object} props
 * @param {(text: string) => void} props.onInsert            called with the text to insert
 * @param {"seq" | "display"}      [props.insertMode="seq"]  what onInsert receives
 * @param {boolean}                [props.disabled=false]
 * @param {string}                 [props.className]
 */
function ExtraSymbolKeyboard({
  onInsert,
  insertMode = "seq",
  disabled = false,
  className = "",
}) {
  const keyboardRootRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const dock = keyboardRootRef.current?.closest(".editor-keyboard-dock");
    if (!dock) return;

    const updateDockOffset = () => {
      const offset = Math.max(
        0,
        window.innerHeight - viewport.height - viewport.offsetTop,
      );
      dock.style.bottom = `${offset + 10}px`;
    };

    updateDockOffset();
    viewport.addEventListener("resize", updateDockOffset);
    viewport.addEventListener("scroll", updateDockOffset);

    return () => {
      viewport.removeEventListener("resize", updateDockOffset);
      viewport.removeEventListener("scroll", updateDockOffset);
      dock.style.bottom = "";
    };
  }, []);

  const groups = useMemo(() => {
    const byBase = new Map();
    for (const entry of extraSymbols2) {
      if (!byBase.has(entry.base)) byBase.set(entry.base, []);
      byBase.get(entry.base).push(entry);
    }
    return Array.from(byBase, ([base, items]) => ({ base, items }));
  }, []);

  const handleClick = (entry) => {
    if (disabled) return;
    onInsert?.(insertMode === "display" ? entry.dosh : entry.seq);
  };

  return (
    <div
      ref={keyboardRootRef}
      className={`extra-symbol-keyboard ${
        isOpen ? "is-open" : "is-closed"
      }${className ? ` ${className}` : ""}`}
      aria-label="დამატებითი სიმბოლოები"
    >
      {isOpen ? (
        <div className="extra-symbol-keyboard__groups">
          {groups.map(({ base, items }) => (
            <div key={base} className="extra-symbol-keyboard__group">
              <span className="extra-symbol-keyboard__group-label">{base}</span>
              <div className="extra-symbol-keyboard__keys">
                {items.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    className="extra-symbol-keyboard__key"
                    style={{ fontFamily: DOSH_FONT_FAMILY }}
                    title={entry.seq}
                    aria-label={`${base} — ${entry.seq}`}
                    disabled={disabled}
                    onClick={() => handleClick(entry)}
                  >
                    {entry.dosh}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="extra-symbol-keyboard__top">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="extra-symbol-keyboard__toggle"
          aria-label={isOpen ? "დამალვა" : "ჩვენება"}
          title={isOpen ? "დამალვა" : "ჩვენება"}
        >
          {isOpen ? "▾" : "▴"}
        </button>
      </div>
    </div>
  );
}

ExtraSymbolKeyboard.propTypes = {
  onInsert: PropTypes.func.isRequired,
  insertMode: PropTypes.oneOf(["seq", "display"]),
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default ExtraSymbolKeyboard;
