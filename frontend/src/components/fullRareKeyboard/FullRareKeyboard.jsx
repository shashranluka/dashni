import { useState, useEffect, useRef } from "react";
import "./FullRareKeyboard.scss";

const diacretials = [
  {
    mark: "ჼ", // ფონეტიკური ნიშანი ქართულ "ო"-ზე
    definition: "მოდიფიკატორი ნარ",
  },
  {
    mark: "\u2322", // ქვევიდან ღია მრუდი (frown)
    definition: "ქვევიდან ღია მრუდი",
  },
  {
    mark: "\u0327", // სედილა (ასოს ქვემოთ კაუჭი)
    definition: "სედილა",
  },
  {
    mark: "\u0306", // ბრევე (მოკლე ხმოვნის ნიშანი)
    definition: "ბრევე (მოკლე ხმოვნის ნიშანი)",
  },
  {
    mark: "\u02EC", // ტონალური მოდიფიკატორი
    definition: "თანხმოვნების გასაორმაგებლად",
  },
  {
    mark: "\u0304", // მაკრონი (გრძელი ხმოვნის ნიშანი)
    definition: "მაკრონი (გრძელი ხმოვნის ნიშანი)",
  },
  {
    mark: "\u0302", // სირკუმფლექსი (წვეტიანი ქუდი)
    definition: "სირკუმფლექსი",
  },
  // {
  //   mark: "°",
  //   definition: "გრადუსის ნიშანი",
  // },
  // {
  //   mark: "\u0303", // სედილა (ასოს ქვემოთ კაუჭი)
  //   definition: "ტილდა (ხმოვნების ნიშანი)",
  // },
  // // {
  //   mark: "\uE190", // სედილა (ასოს ქვემოთ კაუჭი)
  //   definition: "უმლაუტი (ასოს ზედა ნაწილში ორი წერტილი)",
  // },
  // {
  //   mark: "\uE191", // სედილა (ასოს ქვემოთ კაუჭი)
  //   definition: "უმლაუტი (ასოს ზედა ნაწილში ორი წერტილი)",
  // },
  // {
  //   mark: "\uE19E", // სედილა (ასოს ქვემოთ კაუჭი)
  //   definition: "უმლაუტი (ასოს ზედა ნაწილში ორი წერტილი)",
  // },
  {
    mark: "\u0301", // სედილა (ასოს ქვემოთ კაუჭი)
    definition: "უმლაუტი (ასოს ზედა ნაწილში ორი წერტილი)",
  },
  // {
  //   mark: "\uE00A", // სედილა (ასოს ქვემოთ კაუჭი)
  //   definition: "უმლაუტი (ასოს ზედა ნაწილში ორი წერტილი)",
  // },
  {
    mark: "\u0317", // სედილა (ასოს ქვემოთ კაუჭი)
    definition: "უმლაუტი (ასოს ზედა ნაწილში ორი წერტილი)",
  },
  {
    mark: "\u02BB", // სედილა (ასოს ქვემოთ კაუჭი)
    definition: "უმლაუტი (ასოს ზედა ნაწილში ორი წერტილი)",
  },
  {
    mark: "ˠ", // სედილა (ასოს ქვემოთ კაუჭი)
    definition: "უმლაუტი (ასოს ზედა ნაწილში ორი წერტილი)",
  },
];
// იშვიათი ქართული ასოების მასივი
// const trueLetters = ["ჲ", "ჺ", "ჴ", "ჸ", "ჵ", "ჳ", "ჶ", "ჹ", "ჷ", "ჱ", "®", "°"];
// იშვიათი ქართული ასოების მასივი - ობიექტების მასივის სახით
const trueLetters = [
  {
    mark: "ჲ",
    definition: "ქართული ასო-ბგერა ჲე (ჰიე)",
  },
  {
    mark: "ჺ",
    definition: "ქართული ხაზგასმული ო (ელიფსის ნიშანი)",
  },
  {
    mark: "ჴ",
    definition: "ქართული ხარისხიანი ხანი (ჴანი)",
  },
  {
    mark: "ჸ",
    definition: "ქართული ასო ჸე (ფარინგალური ხშული)",
  },
  {
    mark: "ჵ",
    definition: "ქართული ჰოე (ჵ)",
  },
  {
    mark: "ჳ",
    definition: "ქართული ასო-ბგერა ჳე (უი)",
  },
  {
    mark: "ჶ",
    definition: "ქართული ფი (ფარინგალური ფ)",
  },
  {
    mark: "ჹ",
    definition: "ქართული ყ-ს ვარიანტი",
  },
  {
    mark: "ჷ",
    definition: "ქართული შვა (ნეიტრალური ხმოვანი)",
  },
  {
    mark: "ჱ",
    definition: "ქართული ჱე (ეი)",
  },
  // {
  //   mark: "®",
  //   definition: "რეგისტრირებული სავაჭრო ნიშანი"
  // },
];
function FullRareKeyboard({ onInsert, disabled = false }) {
  const keyboardRootRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const updateDockOffset = () => {
      const root = keyboardRootRef.current;
      if (!root) return;
      const dock = root.closest(".editor-keyboard-dock") || root;
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
      const root = keyboardRootRef.current;
      const dock = root?.closest(".editor-keyboard-dock") || root;
      if (dock) {
        dock.style.bottom = "";
      }
    };
  }, []);

  return (
    <div
      ref={keyboardRootRef}
      className={`rare-keyboard ${isOpen ? "is-open" : "is-closed"}`}
    >
      {isOpen ? (
        <div className="rare-keyboard__body">
          <div className="rare-keyboard__section rare-keyboard__section--modifiers">
            {/* <span className="rare-keyboard__section-label">
              მამოდიფიცირებლები
            </span> */}
            <div className="rare-keyboard__grid" aria-label="მამოდიფიცირებლები">
              {diacretials.map((item) => (
                <button
                  key={item.mark}
                  type="button"
                  className="rare-keyboard__key rare-keyboard__key--modifiers"
                  onClick={() => onInsert(item.mark)}
                  disabled={disabled}
                  title={item.definition}
                  aria-label={item.definition}
                >
                  {item.mark}
                </button>
              ))}
            </div>
          </div>

          <div className="rare-keyboard__section rare-keyboard__section--letters">
            {/* <span className="rare-keyboard__section-label">იშვიათი ასოები</span> */}
            <div
              className="rare-keyboard__grid"
              aria-label="იშვიათი ქართული ასოები"
            >
              {trueLetters.map((item) => (
                <button
                  key={item.mark}
                  type="button"
                  className="rare-keyboard__key rare-keyboard__key--letters"
                  onClick={() => onInsert(item.mark)}
                  disabled={disabled}
                  title={item.definition}
                  aria-label={item.definition}
                >
                  {item.mark}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="rare-keyboard__top">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="rare-keyboard__toggle"
          aria-label={isOpen ? "დამალვა" : "ჩვენება"}
          title={isOpen ? "დამალვა" : "ჩვენება"}
        >
          {isOpen ? "▾" : "▴"}
        </button>
      </div>
    </div>
  );
}

export default FullRareKeyboard;
