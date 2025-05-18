import { useState, useEffect, useRef } from "react";
import "./Keyboard.scss";
import Keyboard from "react-simple-keyboard";
// ამ კომპონენტისთვის გადმოცემულ reduceer ფუნქციას საჭიროა ჰქონდეს შესაბამირი action "CHANGE_INPUT"
export default function KeyboardWrapper(props) {
  const { setLetter, inputName, inputValue, textState, dispatchText } = props;
  const [keyboardKey, setKeyboardKey] = useState(false);
  const [chosenCardIndex, setChosenCardIndex] = useState(null);

  // რეფერენსი ფოკუსში მყოფი ელემენტისთვის
  const focusedElementRef = useRef(null);
  // დავამატოთ კურსორის პოზიციის დასამახსოვრებლად
  const cursorPositionRef = useRef({ start: 0, end: 0 });

  // დავიჭიროთ დოკუმენტის ფოკუსირებული ელემენტი
  useEffect(() => {
    const handleFocus = () => {
      // დავიმახსოვროთ რომელი ელემენტია ფოკუსში input-ებიდან და textarea-დან
      if (document.activeElement.tagName === 'INPUT' ||
        document.activeElement.tagName === 'TEXTAREA') {
        focusedElementRef.current = document.activeElement;
      }
    };

    // დავამატოთ ფუნქცია კურსორის პოზიციის დასამახსოვრებლად
    const handleSelectionChange = () => {
      if (document.activeElement.tagName === 'INPUT' ||
        document.activeElement.tagName === 'TEXTAREA') {
        const activeElement = document.activeElement;
        cursorPositionRef.current = {
          start: activeElement.selectionStart,
          end: activeElement.selectionEnd
        };
      }
    };

    // დავამატოთ ლისენერები
    document.addEventListener('focusin', handleFocus);
    document.addEventListener('click', handleSelectionChange);
    document.addEventListener('keyup', handleSelectionChange);
    document.addEventListener('mouseup', handleSelectionChange);

    return () => {
      // გავასუფთავოთ ლისენერები კომპონენტის გაუქმებისას
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('click', handleSelectionChange);
      document.removeEventListener('keyup', handleSelectionChange);
      document.removeEventListener('mouseup', handleSelectionChange);
    };
  }, []);

  function handleKeyboardKeyClick() {
    setKeyboardKey(!keyboardKey);
  }

  function handleClick(diacretial) {
    // შევამოწმოთ რომ ველი არჩეულია და არსებობს
    if (!inputName || !textState || typeof textState[inputName] === 'undefined') {
      console.warn("არ არის არჩეული ველი ან მისი სახელი არასწორია:", inputName);
      return;
    }

    const currentText = textState[inputName];
    const { start, end } = cursorPositionRef.current;

    // სიმბოლოს ჩასმა კურსორის პოზიციაში
    const newText = currentText.substring(0, start) +
      diacretial.hex +
      currentText.substring(end);

    // სტეიტის განახლება
    dispatchText({
      type: "CHANGE_INPUT",
      payload: { name: inputName, value: newText },
    });

    // ახალი კურსორის პოზიცია სიმბოლოს შემდეგ
    const newPosition = start + diacretial.hex.length;

    // დავაბრუნოთ ფოკუსი და დავაყენოთ კურსორი სწორ პოზიციაში
    setTimeout(() => {
      if (focusedElementRef.current) {
        focusedElementRef.current.focus();

        if (focusedElementRef.current.setSelectionRange) {
          focusedElementRef.current.setSelectionRange(newPosition, newPosition);

          // ასევე განვაახლოთ ჩვენი დამახსოვრებული პოზიცია
          cursorPositionRef.current = {
            start: newPosition,
            end: newPosition
          };
        }
      }
    }, 10);
  }

  const letters = [
    {
      theLetter: "ა",
      modify: [
        { desc: "ნაზალური", hex: "\u10FC" },
      ],
    },
    {
      theLetter: "ე",
      modify: [
        // { desc: "მოკლე", hex: "\u0306" },
        // { desc: "ზემოკლე", hex: "\u0302" },
        // { desc: "გრძელი", hex: "\u0304" },
        // { desc: "თავისუფალი", hex: "\u2322" },

        // { desc: "ნაზალური", hex: "\u10FC" },
        // { desc: "გრძელი&ნაზალური", hex: "\u0304\u10FC" },
        { desc: "ზეგრძელი", hex: "\u0302" },
        // { desc: "თავისუფალი&ნაზალური", hex: "\u0302" },
        // { desc: "თავისუფალი&გრძელი", hex: "\u0302" },
        // { desc: "ინტენსიურიური", hex: "\u10FC" },
        // { desc: "ინტენსიურიური", hex: "\u10FC" },
        // { desc: "ლატერალური", hex: "\u10FC" },
        // { desc: "მჟღერი", hex: "\u10FC" },
      ],
    },
    {
      theLetter: "ი",
      modify: [
        // { desc: "მოკლე", hex: "\u0306" },
        // { desc: "ზემოკლე", hex: "\u0302" },
        // { desc: "გრძელი", hex: "\u0304" },
        { desc: "თავისუფალი", hex: "\u2322" },

        // { desc: "ნაზალური", hex: "\u10FC" },
        // { desc: "გრძელი&ნაზალური", hex: "\u0304\u10FC" },
      ],
    },
    {
      theLetter: "ო",
      modify: [
        // { desc: "მოკლე", hex: "\u0306" },
        // { desc: "ზემოკლე", hex: "\u0302" },
        { desc: "გრძელი", hex: "\u0304" },
        // { desc: "თავისუფალი", hex: "\u2322" },
        // { desc: "ნაზალური", hex: "\u10FC" },
        // { desc: "გრძელი&ნაზალური", hex: "\u0304\u10FC" },
      ],
    },
    {
      theLetter: "უ",
      modify: [
        // { desc: "მოკლე", hex: "\u0306" },
        { desc: "ზემოკლე", hex: "\u0302" },
        // { desc: "გრძელი", hex: "\u0304" },
        // { desc: "თავისუფალი", hex: "\u2322" },

        // { desc: "ნაზალური", hex: "\u10FC" },
        // { desc: "გრძელი&ნაზალური", hex: "\u0304\u10FC" },
      ],
    },
    {
      theLetter: "ჲ",
      modify: [
        { desc: "მოკლე", hex: "\u0306" },
        // { desc: "ზემოკლე", hex: "\u0302" },
        // { desc: "გრძელი", hex: "\u0304" },
        // { desc: "თავისუფალი", hex: "\u2322" },

        // { desc: "ნაზალური", hex: "\u10FC" },
        // { desc: "გრძელი&ნაზალური", hex: "\u0304\u10FC" },
      ],
    },
    // { theLetter: "ჲ", modify: [1, 2, 3, 4, 5, 6] },
    // { theLetter: "ჴ", modify: [1, 2, 3, 4, 5, 6] },
    // { theLetter: "ჸ", modify: [1, 2, 3, 4, 5, 6] },
    // { theLetter: "ჼ", modify: [1, 2, 3, 4, 5, 6] },
    // { theLetter: "ₔ", modify: [1, 2, 3, 4, 5, 6] },
    {
      theLetter: "ჰ",
      modify: [{ desc: "მჟღერი ჰ", hex: "\u0327" }],
    },
    // { theLetter: "έ", modify: [1, 2, 3, 4, 5, 6] },
    // { theLetter: "ჳ", modify: [1, 2, 3, 4, 5, 6] },
    // { theLetter: "ჺ", modify: [1, 2, 3, 4, 5, 6] },
    // { theLetter: "ჶ", modify: [1, 2, 3, 4, 5, 6] },
    // { theLetter: "ჹ", modify: [1, 2, 3, 4, 5, 6] },
    // { theLetter: "ჱ", modify: [1, 2, 3, 4, 5, 6] },
    // { theLetter: "ჷ", modify: [1, 2, 3, 4, 5, 6] },
    // { theLetter: "¸", modify: [1, 2, 3, 4, 5, 6] },
  ];

  return (
    <div className="keyboard">
      {keyboardKey ? (
        <div className="letters">
          {letters.map((letter, index) => (
            <div className="" key={index}>
              {letter.modify.map((diacretial, dIndex) => (
                <div
                // className="keyboard-button"
                // onClick={() => handleClick(diacretial)}
                >
                  <button className="keyboard-button"
                    key={`${index}-${dIndex}`}
                    onClick={() => handleClick(diacretial)}>
                    {diacretial.hex}
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : ""}
      <div className="keyboard-key" onClick={handleKeyboardKeyClick}>
        <div className="">
          {keyboardKey ? ">" : "<"}
        </div>
      </div>
    </div>
  );
}
