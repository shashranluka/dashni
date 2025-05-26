// React-ის საჭირო ჰუკების იმპორტი
import { useState, useEffect, useRef } from "react";
// SCSS სტილების იმპორტი
import "./Keyboard.scss";
// რეაქტის კლავიატურის ბიბლიოთეკის იმპორტი (აქ გამოუყენებელია)
import Keyboard from "react-simple-keyboard";

// კომპონენტის ექსპორტი, იღებს props-ებს
export default function KeyboardWrapper(props) {
  // დესტრუქტურიზაცია props ობიექტიდან, მისი თვისებების ინდივიდუალურად მისაღებად
  const { setLetter, inputName, inputValue, textState, dispatchText } = props;
  // სთეითი კლავიატურის გამოჩენის/დამალვის მდგომარეობისთვის
  const [keyboardKey, setKeyboardKey] = useState(false);
  // არჩეული ბარათის ინდექსის სთეითი (ამ კომპონენტში გამოუყენებელია)
  const [chosenCardIndex, setChosenCardIndex] = useState(null);

  // მობილური კლავიატურის ჩვენების მდგომარეობის სთეითი
  const [mobileKeyboardVisible, setMobileKeyboardVisible] = useState(false);

  // ფოკუსირებული ელემენტის შესანახი რეფერენსი
  const focusedElementRef = useRef(null);
  // კურსორის პოზიციის დასამახსოვრებელი რეფერენსი
  const cursorPositionRef = useRef({ start: 0, end: 0 });
  // ტექსტის მიმდინარე მნიშვნელობის შესანახი რეფერენსი
  const textValueRef = useRef('');

  // მომხმარებლის მოწყობილობის გამოცნობა, iOS-ზეა თუ არა
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  // მობილური კლავიატურის დეტექციის ეფექტი
  useEffect(() => {
    // თუ ბრაუზერს არ აქვს visualViewport API, გამოვიდეთ
    if (!window.visualViewport) return;

    // ფუნქცია, რომელიც ადგენს გახსნილია თუ არა მობილური კლავიატურა
    const detectKeyboard = () => {
      // ფანჯრის სრული სიმაღლე
      const windowHeight = window.innerHeight;
      // ხილული ვიუპორტის სიმაღლე (კლავიატურის გახსნისას მცირდება)
      const viewportHeight = window.visualViewport.height;

      // თუ სხვაობა მნიშვნელოვანია, ესე იგი კლავიატურა გახსნილია
      if (windowHeight - viewportHeight > 150) {
        // სთეითის განახლება - კლავიატურა ჩანს
        setMobileKeyboardVisible(true);
        // CSS ცვლადის დაყენება კლავიატურის სიმაღლისთვის
        document.documentElement.style.setProperty('--keyboard-height', `${windowHeight - viewportHeight}px`);
      } else {
        // სთეითის განახლება - კლავიატურა არ ჩანს
        setMobileKeyboardVisible(false);
        // CSS ცვლადის გასუფთავება
        document.documentElement.style.setProperty('--keyboard-height', '0px');
      }
    };

    // ვიზუალურ ვიუპორტზე მოვლენების მსმენელების დამატება
    window.visualViewport.addEventListener('resize', detectKeyboard);
    window.visualViewport.addEventListener('scroll', detectKeyboard);

    // პირველადი შემოწმება კომპონენტის ჩატვირთვისას
    detectKeyboard();

    // ეფექტიდან გამოსვლისას მსმენელების მოხსნა (memory leak თავიდან ასაცილებლად)
    return () => {
      window.visualViewport.removeEventListener('resize', detectKeyboard);
      window.visualViewport.removeEventListener('scroll', detectKeyboard);
    };
  }, []); // ცარიელი მასივი ნიშნავს, რომ ეფექტი მხოლოდ ერთხელ შესრულდება

  // ფოკუსისა და კურსორის პოზიციის თვალყურის დევნების ეფექტი
  useEffect(() => {
    // ინტერვალის ცვლადი iOS-ზე ფოკუსის შესამოწმებლად
    let focusCheckInterval;

    // ფოკუსის პერიოდული შემოწმების დაწყების ფუნქცია iOS-ზე
    const startFocusChecking = () => {
      if (isIOS) {
        // დროის ინტერვალის დაყენება, რომელიც რეგულარულად შეამოწმებს ფოკუსს
        focusCheckInterval = setInterval(() => {
          // მიმდინარე ფოკუსირებული ელემენტის მიღება
          const activeElement = document.activeElement;
          // თუ ფოკუსირებულია ინფუთი ან ტექსტარეა
          if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
            // ვინახავთ ელემენტს რეფერენსში
            focusedElementRef.current = activeElement;

            // ვინახავთ კურსორის პოზიციას
            if (activeElement.selectionStart !== undefined) {
              cursorPositionRef.current = {
                start: activeElement.selectionStart,
                end: activeElement.selectionEnd
              };
            }

            // ვინახავთ ტექსტის მიმდინარე მნიშვნელობას
            if (inputName && textState && textState[inputName] !== undefined) {
              textValueRef.current = textState[inputName];
            }
          }
        }, 300); // შემოწმება ყოველ 300 მილიწამში
      }
    };

    // არა-iOS მოწყობილობებისთვის ფოკუსის დაჭერის ფუნქცია
    const handleFocus = () => {
      // თუ ფოკუსირებულია ინფუთი ან ტექსტარეა
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        // ვინახავთ ელემენტს რეფერენსში
        focusedElementRef.current = document.activeElement;
      }
    };

    // კურსორის პოზიციის დაჭერის ფუნქცია
    const handleSelectionChange = () => {
      // თუ ფოკუსირებულია ინფუთი ან ტექსტარეა
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        const activeElement = document.activeElement;
        // ვინახავთ კურსორის პოზიციას
        cursorPositionRef.current = {
          start: activeElement.selectionStart,
          end: activeElement.selectionEnd
        };
      }
    };

    // მოვლენების მსმენელების დამატება მოწყობილობის ტიპის მიხედვით
    if (!isIOS) {
      // არა-iOS მოწყობილობებზე სტანდარტული მოვლენები
      document.addEventListener('focusin', handleFocus);
      document.addEventListener('click', handleSelectionChange);
      document.addEventListener('keyup', handleSelectionChange);
      document.addEventListener('mouseup', handleSelectionChange);
    } else {
      // iOS-ზე ვიყენებთ პერიოდულ შემოწმებას
      startFocusChecking();
    }

    // ეფექტიდან გამოსვლისას მსმენელების მოხსნა
    return () => {
      if (!isIOS) {
        document.removeEventListener('focusin', handleFocus);
        document.removeEventListener('click', handleSelectionChange);
        document.removeEventListener('keyup', handleSelectionChange);
        document.removeEventListener('mouseup', handleSelectionChange);
      } else if (focusCheckInterval) {
        // iOS-ზე ვწმენდთ ინტერვალს
        clearInterval(focusCheckInterval);
      }
    };
  }, [isIOS, inputName, textState]); // ეფექტი გაეშვება ამ ცვლადების ცვლილებისას

  // კლავიატურის გამოჩენის/დამალვის ღილაკის ქლიქის ჰენდლერი
  function handleKeyboardKeyClick() {
    // სთეითის ინვერსია - ჩართვა/გამორთვა
    setKeyboardKey(!keyboardKey);
  }

  // iOS-ისთვის დაყოვნებადი ტექსტის განახლების ფუნქცია
  const updateTextWithDelay = (newText, newPosition) => {
    // ამჟამინდელი ტექსტის შენახვა რეფერენსში
    const prevText = textValueRef.current;

    // ტექსტის მნიშვნელობის განახლება Redux/Context-ში
    dispatchText({
      type: "CHANGE_INPUT",
      payload: { name: inputName, value: newText },
    });

    // განახლებული ტექსტის დამახსოვრება რეფერენსში
    textValueRef.current = newText;

    // iOS-ზე კურსორის პოზიციის განახლება დაყოვნებით
    if (isIOS && focusedElementRef.current) {
      // დაყოვნება იძლევა დროს DOM-ის განახლებისთვის
      setTimeout(() => {
        // შემოწმება - თუ ველის მნიშვნელობა განსხვავდება მოსალოდნელისგან
        if (focusedElementRef.current.value !== newText) {
          // პირდაპირ DOM-ში ცვლილება (იშვიათი საჭიროებისთვის)
          focusedElementRef.current.value = newText;
        }

        // კურსორის პოზიციის განახლება
        if (focusedElementRef.current.setSelectionRange) {
          try {
            // კურსორის პოზიციის დაყენება
            focusedElementRef.current.setSelectionRange(newPosition, newPosition);
            // განვაახლოთ კურსორის პოზიცია რეფერენსში
            cursorPositionRef.current = {
              start: newPosition,
              end: newPosition
            };
          } catch (e) {
            // შეცდომის შემთხვევაში კონსოლში გამოტანა
            console.warn("კურსორის პოზიციის დაყენება ვერ მოხერხდა", e);
          }
        }
      }, 50); // 50 მილიწამიანი დაყოვნება
    }
  };

  // კლავიატურის ღილაკზე დაჭერის ფუნქცია
  function handleKeyboardButtonClick(letter) {
    // შემოწმება - არსებობს თუ არა მითითებული ველი
    if (!inputName || !textState || typeof textState[inputName] === 'undefined') {
      console.warn("არ არის არჩეული ველი ან მისი სახელი არასწორია:", inputName);
      return;
    }

    // თუ ფოკუსირებული ელემენტი არ არის, ვცდილობთ მოვძებნოთ inputName-ით
    if (!focusedElementRef.current && inputName) {
      // ვეძებთ ინფუთებს ან ტექსტარეებს მითითებული სახელით
      const possibleInputs = document.querySelectorAll(`input[name="${inputName}"], textarea[name="${inputName}"]`);
      if (possibleInputs.length > 0) {
        // თუ ვიპოვეთ, ვინახავთ პირველს
        focusedElementRef.current = possibleInputs[0];
      }
    }

    // მიმდინარე ტექსტის მიღება
    const currentText = textState[inputName];
    // კურსორის პოზიციის მიღება
    const { start, end } = cursorPositionRef.current;

    // ახალი ტექსტის შექმნა - სიმბოლოს ჩასმა კურსორის პოზიციაში
    const newText = currentText.substring(0, start) + letter + currentText.substring(end);

    // ახალი კურსორის პოზიცია - ჩასმული სიმბოლოს შემდეგ
    const newPosition = start + letter.length;

    // iOS-ზე სპეციალური მეთოდის გამოყენება
    if (isIOS) {
      updateTextWithDelay(newText, newPosition);
      // iOS-ზე ვასრულებთ ფუნქციას აქვე
      return;
    }

    // არა-iOS სისტემებზე ჩვეულებრივი ქცევა
    dispatchText({
      type: "CHANGE_INPUT",
      payload: { name: inputName, value: newText },
    });

    // დაყოვნება, რომ მივცეთ დრო DOM-ის განახლებას
    setTimeout(() => {
      if (focusedElementRef.current) {
        // ფოკუსის დაბრუნება ელემენტზე
        focusedElementRef.current.focus();
        if (focusedElementRef.current.setSelectionRange) {
          // კურსორის პოზიციის დაყენება
          focusedElementRef.current.setSelectionRange(newPosition, newPosition);
          // კურსორის პოზიციის განახლება რეფერენსში
          cursorPositionRef.current = {
            start: newPosition,
            end: newPosition
          };
        }
      }
    }, 10); // 10 მილიწამიანი დაყოვნება
  }

  // სპეციალური სიმბოლოების მასივი
  // const diacretials = ["\u10FC", "\u2322", "\u02EC", "\u0304", "\u0306", "\u0302", "\u0327"];

  const diacretials = [
    {
      mark: "\u2322", // ქვევიდან ღია მრუდი (frown)
      definition: "ქვევიდან ღია მრუდი"
    },
    {
      mark: "\u02EC", // ტონალური მოდიფიკატორი
      definition: "ხმოვნების გასაორმაგებლად"
    },
    {
      mark: "\u0304", // მაკრონი (გრძელი ხმოვნის ნიშანი)
      definition: "მაკრონი (გრძელი ხმოვნის ნიშანი)"
    },
    {
      mark: "\u0306", // ბრევე (მოკლე ხმოვნის ნიშანი)
      definition: "ბრევე (მოკლე ხმოვნის ნიშანი)"
    },
    {
      mark: "\u0302", // სირკუმფლექსი (წვეტიანი ქუდი)
      definition: "სირკუმფლექსი"
    },
    {
      mark: "\u0327", // სედილა (ასოს ქვემოთ კაუჭი)
      definition: "სედილა"
    }
  ];
  // იშვიათი ქართული ასოების მასივი
  // const trueLetters = ["ჲ", "ჺ", "ჴ", "ჸ", "ჵ", "ჳ", "ჶ", "ჹ", "ჷ", "ჱ", "®", "°"];
  // იშვიათი ქართული ასოების მასივი - ობიექტების მასივის სახით
  const trueLetters = [
    {
      mark: "ჼ", // ფონეტიკური ნიშანი ქართულ "ო"-ზე
      definition: "მოდიფიკატორი ნარ"
    },
    {
      mark: "ჲ",
      definition: "ქართული ასო-ბგერა ჲე (ჰიე)"
    },
    {
      mark: "ჺ",
      definition: "ქართული ხაზგასმული ო (ელიფსის ნიშანი)"
    },
    {
      mark: "ჴ",
      definition: "ქართული ხარისხიანი ხანი (ჴანი)"
    },
    {
      mark: "ჸ",
      definition: "ქართული ასო ჸე (ფარინგალური ხშული)"
    },
    {
      mark: "ჵ",
      definition: "ქართული ჰოე (ჵ)"
    },
    {
      mark: "ჳ",
      definition: "ქართული ასო-ბგერა ჳე (უი)"
    },
    {
      mark: "ჶ",
      definition: "ქართული ფი (ფარინგალური ფ)"
    },
    {
      mark: "ჹ",
      definition: "ქართული ყ-ს ვარიანტი"
    },
    {
      mark: "ჷ",
      definition: "ქართული შვა (ნეიტრალური ხმოვანი)"
    },
    {
      mark: "ჱ",
      definition: "ქართული ჱე (ეი)"
    },
    // {
    //   mark: "®",
    //   definition: "რეგისტრირებული სავაჭრო ნიშანი"
    // },
    {
      mark: "°",
      definition: "გრადუსის ნიშანი"
    }
  ];

  // კლავიატურის CSS კლასები - მობილური კლავიატურის ხილვადობის მიხედვით
  const keyboardClasses = `keyboard ${mobileKeyboardVisible ? 'mobile-keyboard-visible' : ''}`;

  // კომპონენტის JSX რენდერი
  return (
    <div className={keyboardClasses}>
      {/* კლავიატურის შიგთავსი, მხოლოდ როცა keyboardKey === true */}
      {keyboardKey ? (
        <div className="letters">
          {/* დიაკრიტიკული ნიშნების სექცია */}
          <div className="diacretials">
            {diacretials.map((diacretial, index) => (
              <div key={index}>
                <button
                  className="keyboard-button"
                  title={diacretial.definition} // ტულტიპად ვიყენებთ განმარტებას
                  onMouseDown={(e) => {
                    if (isIOS) {
                      e.preventDefault();
                    }
                    handleKeyboardButtonClick(diacretial.mark); // გადავცემთ მხოლოდ სიმბოლოს
                  }}
                >
                  {diacretial.mark} {/* სიმბოლოს ჩვენება */}
                </button>
              </div>
            ))}
          </div>
          {/* იშვიათი ასოების სექცია */}
          {trueLetters.map((letter, index) => (
            <div key={index} className="diacritical-container">
              <button
                className="keyboard-button"
                title={letter.definition}
                onMouseDown={(e) => {
                  // მნიშვნელოვანია preventDefault iOS-ზე ფოკუსის შესანარჩუნებლად
                  if (isIOS) {
                    e.preventDefault();
                  }
                  handleKeyboardButtonClick(letter.mark);
                }}
              >
                {letter.mark} {/* ასოს ჩვენება */}
              </button>
              {/* ტულტიპი განმარტებისთვის */}
              {/* <div className="diacritical-tooltip">
                {letter.definition}
              </div> */}
            </div>
          ))}
        </div>
      ) : ""}
      {/* კლავიატურის გამოჩენის/დამალვის ღილაკი */}
      <div className="keyboard-key" onClick={handleKeyboardKeyClick}>
        <div className="">
          {keyboardKey ? ">" : "<"} {/* ღილაკის ტექსტი კლავიატურის მდგომარეობის მიხედვით */}
        </div>
      </div>
    </div>
  );
}
