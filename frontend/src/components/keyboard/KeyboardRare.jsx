import { useState, useEffect, useRef } from "react";
import "./Keyboard.scss";
import Keyboard from "react-simple-keyboard";
// ამ კომპონენტისთვის გადმოცემულ reduceერ ფუნქციას საჭიროა ჰქონდეს შესაბამირი action "CHANGE_INPUT"
export default function KeyboardWrapper(props) {
  const { setLetter, inputName, inputValue, textState, dispatchText } = props;
  const [keyboardKey, setKeyboardKey] = useState(false);
  const [chosenCardIndex, setChosenCardIndex] = useState(null);
  
  // iOS კლავიატურის მდგომარეობის თრეკინგისთვის
  const [mobileKeyboardVisible, setMobileKeyboardVisible] = useState(false);

  // რეფერენსი ფოკუსში მყოფი ელემენტისთვის
  const focusedElementRef = useRef(null);
  // დავამატოთ კურსორის პოზიციის დასამახსოვრებლად
  const cursorPositionRef = useRef({ start: 0, end: 0 });

  // მობილური კლავიატურის დეტექციისთვის
  useEffect(() => {
    if (!window.visualViewport) return;
    
    const detectKeyboard = () => {
      const windowHeight = window.innerHeight;
      const viewportHeight = window.visualViewport.height;
      
      // კლავიატურა გახსნილია თუ ვიუპორტის სიმაღლე მნიშვნელოვნად შემცირდა
      if (windowHeight - viewportHeight > 150) {
        setMobileKeyboardVisible(true);
        // CSS ცვლადის დაყენება
        document.documentElement.style.setProperty('--keyboard-height', `${windowHeight - viewportHeight}px`);
      } else {
        setMobileKeyboardVisible(false);
        document.documentElement.style.setProperty('--keyboard-height', '0px');
      }
    };
    
    window.visualViewport.addEventListener('resize', detectKeyboard);
    window.visualViewport.addEventListener('scroll', detectKeyboard);
    
    // საწყისი შემოწმება
    detectKeyboard();
    
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
    setTimeout(() => {
      if (focusedElementRef.current) {
        // ამ ხაზის შეცვლა iOS-ზე კლავიატურის დასატოვებლად
        if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
          // iOS-ზე არ ვცვლით ფოკუსს, მხოლოდ კურსორის პოზიციას
          if (focusedElementRef.current.setSelectionRange) {
            focusedElementRef.current.setSelectionRange(newPosition, newPosition);
            cursorPositionRef.current = {
              start: newPosition,
              end: newPosition
            };
          }
        } else {
          // სხვა მოწყობილობებზე ჩვეულებრივი ქცევა
          focusedElementRef.current.focus();
          if (focusedElementRef.current.setSelectionRange) {
            focusedElementRef.current.setSelectionRange(newPosition, newPosition);
            cursorPositionRef.current = {
              start: newPosition,
              end: newPosition
            };
          }
        }
      }
    }, 10);
  }

  const diacretials = ["\u10FC", "\u0302", "\u0306", "\u0304", "\u2322", "\u0327", "\u02D6"];
  const trueLetters = ["ჲ", "ჺ", "ჴ", "ჸ", "ჵ", "ჳ", "ჶ", "ჹ", "ჷ", "ჱ", "®", "°"];

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
    setTimeout(() => {
      if (focusedElementRef.current) {
        // ამ ხაზის შეცვლა iOS-ზე კლავიატურის დასატოვებლად
        if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
          // iOS-ზე არ ვცვლით ფოკუსს, მხოლოდ კურსორის პოზიციას
          if (focusedElementRef.current.setSelectionRange) {
            focusedElementRef.current.setSelectionRange(newPosition, newPosition);
            cursorPositionRef.current = {
              start: newPosition,
              end: newPosition
            };
          }
        } else {
          // სხვა მოწყობილობებზე ჩვეულებრივი ქცევა
          focusedElementRef.current.focus();
          if (focusedElementRef.current.setSelectionRange) {
            focusedElementRef.current.setSelectionRange(newPosition, newPosition);
            cursorPositionRef.current = {
              start: newPosition,
              end: newPosition
            };
          }
        }
      }
    }, 10);
  }

  // კლავიატურის კლასები
  const keyboardClasses = `keyboard ${mobileKeyboardVisible ? 'mobile-keyboard-visible' : ''}`;

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
