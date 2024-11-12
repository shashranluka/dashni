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
import { handleCheckboxesChange } from "../../utils/handleEvents"
import newRequest from "../../utils/newRequest";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import getCurrentUser from "../../utils/getCurrentUser";

function MyClass() {
  const currentUser = getCurrentUser();
  const navigate = useNavigate();
  if (!currentUser) {
    navigate("/login")
  }
  // const [sort, setSort] = useState("sales");
  // const [open, setOpen] = useState(false);
  const [gameData, setGameData] = useState({});
  const [returnedData, setReturnedData] = useState({});
  const [newGame, setNewGame] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isRequestsOpen, setIsRequestOpen] = useState(false);
  const [gameDataCollected, setGameDataCollected] = useState(false);
  const [checkedRequests, setCheckedRequests] = useState([]);
  const [checkedToBoard, setCheckedToBoard] = useState([]);
  const { id } = useParams();
  const marks = useMemo(() => [".", ",", ":", ";", "!", "?"]);
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
  console.log(classData,"classdata")

  
  const [requests, textsToBoard] = useMemo(() => {
    const requests = [];
    const textsToBoard = [];
    if (!isLoadingClass) {
      
      classData.requests.map((text) => {
        // console.log(text)
        if (text.access == "true") { textsToBoard.push(text) }
        else { requests.push(text) }
      })
    }
    return [requests, textsToBoard]
  }, [classData])
  
  const loadingRef = useRef(true);
  if (!isLoadingClass && loadingRef.current) {
    loadingRef.current = false;
    setCheckedRequests(new Array(requests.length).fill(false))
    setCheckedToBoard(new Array(textsToBoard.length).fill(false))
  }
  
  console.log(requests, textsToBoard)
  // const { isLoading: isLoadingRequests, requestsError, data: requestsData } = useQuery({
  //   queryKey: ["gig"],
  //   refetchOnWindowFocus: false,
  //   queryFn: () =>
  //     newRequest.get(`/classes/single/${id}`).then((res) => {
  //       return res.data;
  //     }),
  // });

  console.log(classData, collectionData, currentUser)
  
  //    ამის გამოა 
  if (!isLoadingClass && (classData.learningClass.userId != currentUser._id && !classData.learningClass.students.includes(currentUser._id))) {
    navigate("/")
    console.log("ამის გამო")
  }
  ////////////////////////////////
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

  // const [numberOfWordsOnBoard, setNumberOfWordsOnBoard] = useState(0)
  const [writingRequest, setWritingRequest] = useState("");
  const wordsOffCollection = useMemo(() => [], [])

  function clickCollectionCard(wordData, index) {
    setWritingRequest(writingRequest + " " + wordData.theWord)
    wordsOffCollection.push(collectionData.splice(index, 1)[0]._id)
    console.log(wordsOffCollection)
  }

  const storeCollectedWords = (returnedData) => {
    newRequest.put(`/users/single/${currentUser._id}`, returnedData).then((res => console.log(res)))
    setInterval(() => window.parent.location = window.parent.location.href, 5000)
    // window.parent.location = window.parent.location.href;
  }

  function markClickHandler(mark) {
    setWritingRequest(writingRequest + mark)
  }

  useEffect(() => {
    if (isStarted) {
      const chosenSentences = pickSentences(
        classData.sentences,
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

  function requestHandler() {
    const classId = classData.learningClass._id;
    const userId = currentUser._id
    const userName = currentUser.username

    newRequest.put(`/classes/single/${classId}`, { type: "requestOnBoard", writingRequest, userId, userName, wordsOffCollection });
    // navigate(`/myClass/${classId}`)
    console.log("navigate")
    // window.location.reload
    setInterval(() => window.parent.location = window.parent.location.href, 5000)
    // window.parent.location = window.parent.location.href;
  }
  function openRequests() {
    setIsRequestOpen(!isRequestsOpen)
  }

  function handleAccept() {
    const classId = classData.learningClass._id;
    const userId = currentUser._id
    const acceptedTexts = checkedRequests.reduce((a, c, i) => {
      if (c) {
        a.push(classData.requests[i]._id);
      }
      return a;
    }, []);
    console.log(acceptedTexts);
    newRequest.put(`/classes/single/${classId}`, { type: "acceptOnBoardRequest", acceptedTexts, userId });
    setInterval(() => window.parent.location = window.parent.location.href, 5000)
  }

  console.log(checkedRequests,checkedToBoard);
  return (
    <div className="">
      <div className="classroom">
        <div className="high-div">

          {currentUser.isSeller &&
            // <div className=""></div>
            <div className="requests">
              <div className="requests-button" onClick={openRequests}>{isRequestsOpen ? "მოთხოვნების დამალვა" : "მოთხოვნების გამოჩენა"}</div>
              {isRequestsOpen &&
                <div className="">
                  {requests.map((request, index) =>
                  // console.log(request.writingRequest))}
                  (
                    <div className="request-card">
                      <div className="writing-card">{request.writingRequest}</div>
                      <div className="panel">
                        <input type="checkbox" onChange={() => handleCheckboxesChange(index, checkedRequests, setCheckedRequests)} />
                        <div className="user-info-card">{request.userName}</div>
                      </div>
                    </div>
                  ))}
                  <div className="accept-button" onClick={handleAccept}>მონიშნულების დაფაზე გადატანა</div>
                </div>
              }
            </div>
          }
          <div className="board">
            <div className="writings">
              {textsToBoard.map((text, index) => (
                <div className="">
                  <div className="writing">{text.writingRequest}</div>
                  <div className="panel">
                    <input type="checkbox" onChange={() => handleCheckboxesChange(index, checkedToBoard, setCheckedToBoard)} />
                    <div className="user-info-card">{text.userName}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* <button onClick={() => setReturnedData(!returnedData)}>ტესტი</button>
          <button onClick={() => {
            storeCollectedWords(returnedDatatest)
            }}>ტესტი2</button> */}
          </div>
          <div className="writing-request">{writingRequest}</div>
          <div className="panel">
            <div className="marks-classroom">
              {marks.map((mark, index) => <div className="mark-card" onClick={() => markClickHandler(mark)}>{mark}</div>)}
            </div>
            <button className="request-button" refresh="true" onClick={requestHandler}>გაგზავნა</button>
          </div>
          <div className="">
            {/* მოპოვებული სიტყვები */}
            {isLoadingCollection ? "იტვირთება" : collectionError ? "რაღაც შეცდომაა" :
              <div className="collection">
                {collectionData.map((wordData, index) => (
                  <div className="card" onClick={() => clickCollectionCard(wordData, index)}>{wordData.theWord}</div>
                ))}
                {collectionData.length}
              </div>
            }
          </div>
        </div>
        <div className="game-div">

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
    </div>
  );
}

export default MyClass;
