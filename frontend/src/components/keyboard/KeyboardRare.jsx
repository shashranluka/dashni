import { useState, useEffect, useRef } from "react";
import "./Keyboard.scss";
import Keyboard from "react-simple-keyboard";

export default function KeyboardWrapper(props) {
  const { setLetter, inputName, inputValue, textState, dispatchText } = props;
  const [keyboardKey, setKeyboardKey] = useState(false);
  const [chosenCardIndex, setChosenCardIndex] = useState(null);
  
  // iOS კლავიატურის მდგომარეობის თრეკინგისთვის
  const [mobileKeyboardVisible, setMobileKeyboardVisible] = useState(false);

  // რეფერენსი ფოკუსში მყოფი ელემენტისთვის
  const focusedElementRef = useRef(null);
  // კურსორის პოზიციის დასამახსოვრებლად
  const cursorPositionRef = useRef({ start: 0, end: 0 });
  // ტექსტის მნიშვნელობის დასამახსოვრებლად
  const textValueRef = useRef('');
  
  // ვამოწმებთ არის თუ არა iOS მოწყობილობა
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

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

  // ფოკუსის და კურსორის პოზიციის თრეკინგი
  useEffect(() => {
    // iOS-ზე ფოკუსს ვამოწმებთ ინტერვალით, რადგან focusin/focusout ივენთები
    // ხშირად არასწორად მუშაობს iOS-ზე სასურველი შედეგისთვის
    let focusCheckInterval;
    
    const startFocusChecking = () => {
      if (isIOS) {
        focusCheckInterval = setInterval(() => {
          const activeElement = document.activeElement;
          if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
            focusedElementRef.current = activeElement;
            
            // ასევე ვინახავთ კურსორის პოზიციას
            if (activeElement.selectionStart !== undefined) {
              cursorPositionRef.current = {
                start: activeElement.selectionStart,
                end: activeElement.selectionEnd
              };
            }
            
            // ვინახავთ ტექსტის მნიშვნელობას
            if (inputName && textState && textState[inputName] !== undefined) {
              textValueRef.current = textState[inputName];
            }
          }
        }, 300); // შემოწმება ყოველ 300მს-ში
      }
    };
    
    // არა-iOS მოწყობილობებისთვის სტანდარტული მიდგომა
    const handleFocus = () => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        focusedElementRef.current = document.activeElement;
      }
    };

    const handleSelectionChange = () => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        const activeElement = document.activeElement;
        cursorPositionRef.current = {
          start: activeElement.selectionStart,
          end: activeElement.selectionEnd
        };
      }
    };

    // დავამატოთ ლისენერები
    if (!isIOS) {
      document.addEventListener('focusin', handleFocus);
      document.addEventListener('click', handleSelectionChange);
      document.addEventListener('keyup', handleSelectionChange);
      document.addEventListener('mouseup', handleSelectionChange);
    } else {
      startFocusChecking();
    }

    return () => {
      if (!isIOS) {
        document.removeEventListener('focusin', handleFocus);
        document.removeEventListener('click', handleSelectionChange);
        document.removeEventListener('keyup', handleSelectionChange);
        document.removeEventListener('mouseup', handleSelectionChange);
      } else if (focusCheckInterval) {
        clearInterval(focusCheckInterval);
      }
    };
  }, [isIOS, inputName, textState]);

  function handleKeyboardKeyClick() {
    setKeyboardKey(!keyboardKey);
  }

  // iOS-ისთვის დაყოვნებადი ტექსტის შეცვლის ფუნქცია - გამოიყენებს preventDefault
  // შეტყობინების დაყოვნება შეიძლება დაგვეხმაროს ფოკუსის შენარჩუნებაში
  const updateTextWithDelay = (newText, newPosition) => {
    // ამჟამინდელი ტექსტის შენახვა
    const prevText = textValueRef.current;
    
    // სტეიტის განახლება
    dispatchText({
      type: "CHANGE_INPUT",
      payload: { name: inputName, value: newText },
    });
    
    // განახლებული ტექსტის დამახსოვრება
    textValueRef.current = newText;
    
    // iOS-ზე კურსორის პოზიციის განახლება დაყოვნებით
    if (isIOS && focusedElementRef.current) {
      // iOS-ზე ზოგი ბრაუზერი ხანდახან ტექსტს თვითონ ცვლის, ამიტომ ვაკეთებთ შემოწმებას
      setTimeout(() => {
        if (focusedElementRef.current.value !== newText) {
          focusedElementRef.current.value = newText;
        }
        
        if (focusedElementRef.current.setSelectionRange) {
          try {
            focusedElementRef.current.setSelectionRange(newPosition, newPosition);
            // განვაახლოთ კურსორის პოზიცია
            cursorPositionRef.current = {
              start: newPosition,
              end: newPosition
            };
          } catch (e) {
            console.warn("კურსორის პოზიციის დაყენება ვერ მოხერხდა", e);
          }
        }
      }, 50);
    }
  };

  function handleKeyboardButtonClick(letter) {
    // შევამოწმოთ რომ ველი არჩეულია და არსებობს
    if (!inputName || !textState || typeof textState[inputName] === 'undefined') {
      console.warn("არ არის არჩეული ველი ან მისი სახელი არასწორია:", inputName);
      return;
    }
    
    // თუ ფოკუსირებული ელემენტი არ არის, ვიპოვოთ ინფუთი სახელით
    if (!focusedElementRef.current && inputName) {
      const possibleInputs = document.querySelectorAll(`input[name="${inputName}"], textarea[name="${inputName}"]`);
      if (possibleInputs.length > 0) {
        focusedElementRef.current = possibleInputs[0];
      }
    }

    const currentText = textState[inputName];
    const { start, end } = cursorPositionRef.current;

    // სიმბოლოს ჩასმა კურსორის პოზიციაში
    const newText = currentText.substring(0, start) + letter + currentText.substring(end);
    
    // ახალი კურსორის პოზიცია სიმბოლოს შემდეგ
    const newPosition = start + letter.length;

    // iOS-ზე ვიყენებთ სპეციალურ მეთოდს ტექსტის განახლებისთვის
    if (isIOS) {
      updateTextWithDelay(newText, newPosition);
      
      // ვაჩერებთ ღილაკის ნორმალურ ქცევას iOS-ზე
      return;
    }

    // სხვა სისტემებზე ჩვეულებრივი ქცევა
    dispatchText({
      type: "CHANGE_INPUT",
      payload: { name: inputName, value: newText },
    });

    setTimeout(() => {
      if (focusedElementRef.current) {
        focusedElementRef.current.focus();
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

  const diacretials = ["\u10FC", "\u0302", "\u0306", "\u0304", "\u2322", "\u0327", "\u02D6"];
  const trueLetters = ["ჲ", "ჺ", "ჴ", "ჸ", "ჵ", "ჳ", "ჶ", "ჹ", "ჷ", "ჱ", "®", "°"];

  // კლავიატურის კლასები
  const keyboardClasses = `keyboard ${mobileKeyboardVisible ? 'mobile-keyboard-visible' : ''}`;

  return (
    <div className={keyboardClasses}>
      {keyboardKey ? (
        <div className="letters">
          <div className="diacretials">
            {diacretials.map((diacretial, index) => (
              <div key={index}>
                <button 
                  className="keyboard-button"
                  onMouseDown={(e) => {
                    // მნიშვნელოვანია preventDefault iOS-ზე ფოკუსის შესანარჩუნებლად
                    if (isIOS) {
                      e.preventDefault();
                    }
                    handleKeyboardButtonClick(diacretial);
                  }}
                >
                  {diacretial}
                </button>
              </div>
            ))}
          </div>
          {trueLetters.map((letter, index) => (
            <div key={index}>
              <button 
                className="keyboard-button"
                onMouseDown={(e) => {
                  // მნიშვნელოვანია preventDefault iOS-ზე ფოკუსის შესანარჩუნებლად
                  if (isIOS) {
                    e.preventDefault();
                  }
                  handleKeyboardButtonClick(letter);
                }}
              >
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
