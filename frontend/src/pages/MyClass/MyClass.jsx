import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./MyClass.scss";
import SentenceCard from "../../components/sentenceCard/SentenceCard";
import GameSentences from "../../components/gameSentences/GameSentences";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import getCurrentUser from "../../utils/getCurrentUser";

function MyClass() {
  // const [sort, setSort] = useState("sales");
  // const [open, setOpen] = useState(false);
  const [gameData, setGameData] = useState({});
  const [returnedData, setReturnedData] = useState({});
  const [newGame, setNewGame] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [gameDataCollected, setGameDataCollected] = useState(false);
  const { id } = useParams();
  const currentUser = getCurrentUser();
  const navigate = useNavigate();
  if (!currentUser) {
    navigate("/login")
  }

  const amountRef = useRef();
  const withPicsRef = useRef(0);
  const methodRef = useRef();
  const themesRef = useRef();
  const themes = useMemo(() => {
    return [
      { name: "ცხოველები", isChecked: "true" },
      { name: "სხეულის ნაწილები", isChecked: "true" },
      { name: "სხვადასხვა", isChecked: "true" },
      { name: "ცხოველები", isChecked: "true" },
    ];
  });

  // const maxRef = useRef();
  // ფუნქცია, რომელიც მიიღებს წინადადებების მონაცემების მასივს და
  // დააბრუნებს იქიდან შემთხვევითად არჩეულ მითითებული რაოდენობის ელემენტებს

  // const { search } = useLocation();

  // const { isLoading, error, data, refetch } = useQuery({
  //   queryKey: ["sentences"],
  //   refetchOnWindowFocus: false,
  //   queryFn: () =>
  //     newRequest
  //       .get(
  //         // `/gigs`
  //         `/sentences`
  //       )
  //       .then((res) => {
  //         return res.data;
  //       }),
  // });
  const gameDataCollectedtest = { a: "a", b: "b" }
  const { isLoading: isLoadingClass, error, data: classData } = useQuery({
    queryKey: ["gig"],
    refetchOnWindowFocus: false,
    queryFn: () =>
      newRequest.get(`/classes/single/${id}`).then((res) => {
        return res.data;
      }),
  });
  const { isLoading: isLoadingCollection, collectionError, data: collectionData } = useQuery({
    queryKey: ["collection"],
    refetchOnWindowFocus: false,
    queryFn: () =>
      newRequest.get(`/words?userId=${currentUser._id}`).then((res) => {
        return res.data;
      }),
  });
  if (!isLoadingClass && (!classData[0].userId == currentUser._id || !classData[0].students.includes(currentUser._id))) {
    navigate("/")
  }
  const GameData_new = useMemo(() => {
    return "chosenSentences"
  }, [newGame])
  function handleSubmit() {
    if (!isStarted) {
      setNewGame(newGame + 1);
    } else {
      setGameDataCollected(false);
    }
    setIsStarted(!isStarted);
  }

  function pickSentences(data, NoS, NoP, method, themes) {
    const sentencesWithPicture = data.filter((sentence) => sentence.picture);
    const sentencesWithOutPicture = data.filter(
      (sentence) => !sentence.picture
    );
    const chosenSentences = [];
    // სურათიანი წინადადებების არჩევა
    for (let i = 0; i < NoP; i++) {
      chosenSentences.push(
        sentencesWithPicture.splice(
          Math.floor(Math.random() * sentencesWithPicture.length),
          1
        )[0]
      );
    }
    // სურათის გარეშე წინადადებების არჩევა
    for (let i = 0; i < NoS - NoP; i++) {
      chosenSentences.push(
        sentencesWithOutPicture.splice(
          Math.floor(Math.random() * sentencesWithOutPicture.length),
          1
        )[0]
      );
    }
    return chosenSentences;
  }

  function splitText(data) {
    const words = data
      .map((el) =>
        el.sentence
          .toLowerCase()
          .replace(",", "")
          .replace(".", "")
          .replace('"', "")
          .replace('"', "")
          .replace("(", "")
          .replace(")", "")
          .replace(":", "")
          .replace("?", "")
          .split(" ")
      )
      .flat();
    return words;
  }
  const [numberOfWordsOnBoard, setNumberOfWordsOnBoard] = useState(0)
  const wordsOnBoard = useMemo(() => ([]), [])
  function clickCollectionCard(wordData, index) {
    wordsOnBoard.push(wordData)
    setNumberOfWordsOnBoard(numberOfWordsOnBoard + 1)
  }

  console.log(numberOfWordsOnBoard, typeof (wordsOnBoard))

  useEffect(() => {
    if (isStarted) {
      const chosenSentences = pickSentences(
        classData[1],
        amountRef.current.value,
        withPicsRef.current,
      );
      const wordsFromSentences = splitText(chosenSentences);
      const wordsToTranslate = wordsFromSentences.filter(
        (value, index, self) => self.indexOf(value) === index
      );
      const lang = "ba";
      newRequest
        .get(`/words`, {
          params: {
            wordsToTranslate,
            lang,
          },
        })
        .then((res) => {
          setGameData({
            wordsFromLexicon: res.data,
            chosenSentences: chosenSentences,
            wordsFromSentences: wordsFromSentences,
          });
          setGameDataCollected(true);
        });
    }
  }, [newGame]);
  useEffect(() => {
  })
  const returnedDatatest = ["65e1e49fe98143caf1ef9d0b", "65e1e49fe98143caf1ef9d0c", "65e1e49fe98143caf1ef9d0d", "65e1e49fe98143caf1ef9d0e"]
  function storeCollectedWords(returnedData) {
    newRequest.put(`/users/single/${currentUser._id}`, returnedData).then((res => console.log(res)))
  }
  useEffect(() => {
    if (typeof (returnedData) != "undefined") {
      newRequest.put(`/users/single/${currentUser._id}`, returnedData).then((res => console.log(res)))
    } else {
    }
  }, [returnedData])
  return (
    <div className="classroom">
      <div className="">
        <div className="board">
          <button onClick={() => setReturnedData(!returnedData)}>ტესტი</button>
          <button onClick={() => {
            storeCollectedWords()
          }}>ტესტი2</button>

        </div>
        <div className="">
          მოპოვებული სიტყვები
          {isLoadingCollection ? "იტვირთება" : collectionError ? "რაღაც შეცდომაა" :
            <div className="collection">
              {collectionData.map((wordData, index) => (
                <div className="card" onClick={() => clickCollectionCard(wordData, index)}>{wordData.theWord}</div>
              ))}
            </div>
          }
        </div>
        <div className="start-button">
          <div className="choose-sentences flex">
            <div className="">
              <label>წინადადებების რაოდენობა</label>
              <input
                ref={amountRef}
                type="number"
                placeholder="amount"
                defaultValue="4"
              />
            </div>
            {/* <div className="">
              <label>სურათებიანების რაოდენობა</label>
              <input
                ref={withPicsRef}
                type="number"
                placeholder="withPics"
                defaultValue="1"
              />
            </div> */}
            {/* <div className="">
              <input ref={methodRef} type="string" placeholder="method" />
              <label for="cars">Choosing method:</label>
              <select id="cars" name="carlist" form="carform" ref={methodRef}>
                <option value="volvo">Volvo</option>
                <option value="saab">Saab</option>
                <option value="opel">Opel</option>
                <option value="audi">Audi</option>
              </select>
            </div> */}
            <div className="">
              <button
                onClick={() => {
                  handleSubmit();
                  // if (!isStarted) setNewGame(newGame + 1);
                  // setIsStarted(!isStarted);
                }}
              >
                {isStarted ? "თამაშის გატანა" : "თამაშის გამოტანა"}
              </button>
            </div>
            {/* <input
          type="submit"
          className="input-interval"
          onClick={() => {
            handleSubmit();
          }}
        /> */}
          </div>
          {/* <GameInput /> */}
        </div>
        {/* <GameInput /> */}
        {gameDataCollected && <GameSentences gameData={gameData} setReturnedData={setReturnedData} storeCollectedWords={storeCollectedWords} />}
        <div className="cards">
          {isLoadingClass
            ? "loading"
            : error
              ? "Something went wrong!"
              : "go on"
            // : classData[1].map((gig) => <SentenceCard
            //   key={gig._id} item={gig} />)
          }
        </div>
      </div>
    </div>
  );
}

export default MyClass;
