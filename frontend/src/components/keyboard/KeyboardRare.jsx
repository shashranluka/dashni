import { useState } from "react";
import "./Keyboard.scss";
import Keyboard from "react-simple-keyboard";

export default function KeyboardWrapper(props) {
  console.log(props)
  const { setLetter, inputName, inputValue, sentenceState, dispatchSentence  } = props;
  const [keyboardKey, setKeyboardKey] = useState(false)
  // console.log(setLetter);
  const letters = [
    {
      theLetter: "ა",
      modify: [
        // { desc: "მოკლე", hex: "\u0306" },
        // { desc: "ზემოკლე", hex: "\u0302" },
        // { desc: "გრძელი", hex: "\u0304" },
        // { desc: "ზეგრძელი", hex: "\u0305" },
        // { desc: "თავისუფალი", hex: "\u2322" },

        { desc: "ნაზალური", hex: "\u10FC" },
        // { desc: "გრძელი&ნაზალური", hex: "\u0304\u10FC" },
        // { desc: "თავისუფალი&ნაზალური", hex: "\u2322\u10FC" },
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
  const [chosenCardIndex, setChosenCardIndex] = useState(null);
  const testLetter = "\u0304";
  // console.log(testLetter);
  function handleKeyboardKeyClick() {
    setKeyboardKey(!keyboardKey);
    // console.log(keyboardKey)
  }
  console.log("d", inputName,inputValue)

  function handleClick(diacretial) {
    dispatchSentence({
      type: "CHANGE_INPUT",
      payload: { name: inputName, value: sentenceState[inputName]+ diacretial.hex },
    });
    // const currentText = text + diacretial.hex
    // console.log(diacretial, "dwafes", currentText,)
    // textSetter(currentText)
  }

  return (
    <div className="keyboard">
      {keyboardKey ? "" :

        (<div className="letters">
          {letters.map((letter, index) => (
            <div className="">
              {/* <div
              className="letter"
              onClick={() => {
                console.log(letter)
                setLetter(letter.theLetter);
                setChosenCardIndex(index);
                
                }}
                >
                {letter.theLetter}
                </div> */}
              {letter.modify.map((diacretial) => {
                // console.log(diacretial)
                return (<div className="keyboard-card" onClick={(e) =>handleClick(diacretial)}>
                  {/* {letter.theLetter} */}
                  <h3>
                    {diacretial.hex}
                  </h3>
                </div>)
              })}
            </div>
          ))}
        </div>)
      }
      <div className="keyboard-key" onClick={handleKeyboardKeyClick}>{keyboardKey ? "<" : ">"}</div>
    </div >
  );
}
