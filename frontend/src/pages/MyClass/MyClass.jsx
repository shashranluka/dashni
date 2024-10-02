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

function Sentences() {
  // const [sort, setSort] = useState("sales");
  // const [open, setOpen] = useState(false);
  const [gameData, setGameData] = useState({});
  const [newGame, setNewGame] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [gameDataCollected, setGameDataCollected] = useState(false);
  const { id } = useParams();
  const currentUser = getCurrentUser();
  if(!currentUser){
    const navigate = useNavigate();
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

  const { isLoading: isLoadingClass, error, data: classData } = useQuery({
    queryKey: ["gig"],
    queryFn: () =>
      newRequest.get(`/classes/single/${id}`).then((res) => {
        console.log(res.data);
        return res.data;
      }),
  });
  if(!isLoadingClass&& (!classData[0].userId==currentUser._id || !classData[0].students.includes(currentUser._id))){
    navigate("/")
    // console.log(classData[0].userId==currentUser._id || classData[0].students.includes(currentUser._id))
  }
  // if()
  const GameData_new = useMemo(() => {
    // console.log("gamedata_new")
    return "chosenSentences"
  }, [newGame])
  // console.log("some render",GameData_new);
  function handleSubmit() {
    // console.log(data, "submit",isStarted,newGame);
    if (!isStarted) {
      setNewGame(newGame + 1);
    } else {
      setGameDataCollected(false);
    }
    setIsStarted(!isStarted);
    // console.log(data, "submit",isStarted,newGame);
  }

  function pickSentences(data, NoS, NoP, method, themes) {
    console.log(data)
    const sentencesWithPicture = data.filter((sentence) => sentence.picture);
    const sentencesWithOutPicture = data.filter(
      (sentence) => !sentence.picture
    );
    console.log(NoP, sentencesWithPicture, sentencesWithOutPicture);
    // console.log(data, NoS, method);
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
  console.log(classData)

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
  console.log(withPicsRef.current)
  useEffect(() => {
    if (isStarted) {
      const chosenSentences = pickSentences(
        classData[1],
        amountRef.current.value,
        withPicsRef.current.value,
        // methodRef.current.value
      );
      const wordsToTranslate = splitText(chosenSentences).filter(
        (value, index, self) => self.indexOf(value) === index
      );
      const lang = "ba";
      console.log("გაეშვა");
      newRequest
        .get(`/words`, {
          params: {
            wordsToTranslate,
            lang,
          },
        })
        .then((res) => {
          console.log("დაბრუნდა", res);
          setGameData({
            wordsFromLexicon: res.data,
            chosenSentences: chosenSentences,
            wordsFromSentences: wordsToTranslate,
          });
          console.log("დაბრუნდა", res);
          setGameDataCollected(true);
        });
    }
  }, [newGame]);

  console.log("gameData", gameData, isStarted);
  return (
    <div className="sentences">
      <div className="">
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
            <div className="">
              <label>სურათებიანების რაოდენობა</label>
              <input
                ref={withPicsRef}
                type="number"
                placeholder="withPics"
                defaultValue="1"
              />
            </div>
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
        {gameDataCollected && <GameSentences gameData={gameData} />}
        <div className="cards">
          {isLoadingClass
            ? "loading"
            : error
              ? "Something went wrong!"
              // : "go on"
              : classData[1].map((gig) => <SentenceCard
                key={gig._id} item={gig} />)
          }
        </div>
      </div>
    </div>
  );
}

export default Sentences;
