import { useState, useEffect, useRef } from "react";
import "./Keyboard.scss";
import Keyboard from "react-simple-keyboard";
// ამ კომპონენტისთვის გადმოცემულ reduceer ფუნქციას საჭიროა ჰქონდეს შესაბამირი action "CHANGE_INPUT"
export default function KeyboardWrapper(props) {
  const { setLetter, inputName, inputValue, textState, dispatchText } = props;
  const [keyboardKey, setKeyboardKey] = useState(false);
  const [chosenCardIndex, setChosenCardIndex] = useState(null);
  // დავამატოთ iOS კლავიატურის მდგომარეობის თრეკინგი
  const [iosKeyboardVisible, setIosKeyboardVisible] = useState(false);

  // რეფერენსი ფოკუსში მყოფი ელემენტისთვის
  const focusedElementRef = useRef(null);
  // დავამატოთ კურსორის პოზიციის დასამახსოვრებლად
  const cursorPositionRef = useRef({ start: 0, end: 0 });

  // iOS კლავიატურის დეტექციისთვის
  useEffect(() => {
    if (!window.visualViewport) return;
    
    const detectKeyboard = () => {
      const windowHeight = window.innerHeight;
      const viewportHeight = window.visualViewport.height;
      
      // iOS-ზე კლავიატურა ამცირებს viewport-ის სიმაღლეს
      if (windowHeight - viewportHeight > 150) {
        setIosKeyboardVisible(true);
      } else {
        setIosKeyboardVisible(false);
      }
    };
    
    window.visualViewport.addEventListener('resize', detectKeyboard);
    window.visualViewport.addEventListener('scroll', detectKeyboard);
    
    return () => {
      window.visualViewport.removeEventListener('resize', detectKeyboard);
      window.visualViewport.removeEventListener('scroll', detectKeyboard);
    };
  }, []);

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
    // შენიშვნა: ეს ნაწილი მნიშვნელოვანია ფოკუსის შესანარჩუნებლად, 
    // მაგრამ iOS-ზე შეიძლება კლავიატურა დამალოს
    setTimeout(() => {
      if (focusedElementRef.current) {
        // არ ვცვლით ფოკუსს iOS-ზე კლავიატურის დასატოვებლად
        if (focusedElementRef.current.setSelectionRange) {
          focusedElementRef.current.setSelectionRange(newPosition, newPosition);
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
  const diacretials = ["\u10FC", "\u0302", "\u0306", "\u0304", "\u2322", "\u0327", "\u02D6"];
  const trueLetters = ["ჲ", "ჺ", "ჴ", "ჸ", "ჵ", "ჳ", "ჶ", "ჹ", "ჷ", "ჱ", "®", "°"];
  // ჱ ჶ ჹ ჷ ჳ ® °
  // ]
  function handleKeyboardButtonClick(letter) {
    // შევამოწმოთ რომ ველი არჩეულია და არსებობს
    if (!inputName || !textState || typeof textState[inputName] === 'undefined') {
      console.warn("არ არის არჩეული ველი ან მისი სახელი არასწორია:", inputName);
      return;
    }
    console.log("handleKeyboardButtonClick", letter);

    const currentText = textState[inputName];
    const { start, end } = cursorPositionRef.current;

    // სიმბოლოს ჩასმა კურსორის პოზიციაში
    const newText = currentText.substring(0, start) +
      letter +
      currentText.substring(end);

    // სტეიტის განახლება
    dispatchText({
      type: "CHANGE_INPUT",
      payload: { name: inputName, value: newText },
    });

    // ახალი კურსორის პოზიცია სიმბოლოს შემდეგ
    const newPosition = start + letter.length;

    // დავაბრუნოთ ფოკუსი და დავაყენოთ კურსორი სწორ პოზიციაში
    // iOS-ზე ფოკუსის შეცვლა დამალავს კლავიატურას, ამიტომ ფრთხილად
    setTimeout(() => {
      if (focusedElementRef.current) {
        // არ გადავიყვანოთ ფოკუსი, მხოლოდ კურსორის პოზიცია განვაახლოთ
        if (focusedElementRef.current.setSelectionRange) {
          focusedElementRef.current.setSelectionRange(newPosition, newPosition);
          cursorPositionRef.current = {
            start: newPosition,
            end: newPosition
          };
        }
      }
    }, 10);
  }

  // კლავიატურის კლასი iOS კლავიატურის მდგომარეობის მიხედვით
  const keyboardClasses = `keyboard ${iosKeyboardVisible ? 'ios-keyboard-visible' : ''}`;

  return (
    <div className={keyboardClasses}>
      {keyboardKey ? (
        <div className="letters">
          <div className="diacretials">
            {diacretials.map((diacretial, index) => (
              <div key={index}>
                <button className="keyboard-button"
                  onClick={() => handleKeyboardButtonClick(diacretial)}>
                  {diacretial}
                </button>
              </div>
            ))}
          </div>
          {trueLetters.map((letter, index) => (
            <div key={index}>
              <button className="keyboard-button"
                onClick={() => handleKeyboardButtonClick(letter)}>
                {letter}
              </button>
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
