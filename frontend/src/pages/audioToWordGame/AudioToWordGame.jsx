import { useState, useEffect, useRef, useMemo } from "react";
import newRequest from "../../utils/newRequest";
import WordGamePanel from "../../components/WordGamePanel/WordGamePanel";
import AudioPlayer from "../../components/AudioPlayer/AudioPlayer";
import EpisodePicker from "../../components/EpisodePicker/EpisodePicker";
import "./AudioToWordGame.scss";

function AudioToWordGame() {
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wordStatus, setWordStatus] = useState({
    learned_word_ids: [],
    needs_learning_word_ids: [],
    learned_words: [],
    needs_learning_words: [],
  });
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [seekTrigger, setSeekTrigger] = useState(0);

  const hasFetchedAudio = useRef(false);
  const hasFetchedResults = useRef(false);
  const audiofilePath = useRef(
    "src/assets/audio_files/adas_mier_moyolili_zghapari.m4a",
  );

  useEffect(() => {
    const fetchAudioData = async () => {
      if (hasFetchedAudio.current) return;
      hasFetchedAudio.current = true;

      try {
        const response = await newRequest.get("/audio");
        setGameData(response.data);

        // თავიდან ავტომატურად აირჩიოს პირველი სეგმენტი
        const firstSegment = response?.data?.segments?.[0] ?? null;
        setSelectedSegment(firstSegment);

        console.log("Fetched audio data:", response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAudioData();
  }, []);

  useEffect(() => {
    if (hasFetchedResults.current) return;
    hasFetchedResults.current = true;

    const fetchSavedWordStatus = async () => {
      try {
        const response = await newRequest.get("/results/word-status?source=public");
        setWordStatus({
          learned_word_ids: response?.data?.learned_word_ids || [],
          needs_learning_word_ids: response?.data?.needs_learning_word_ids || [],
          learned_words: response?.data?.learned_words || [],
          needs_learning_words: response?.data?.needs_learning_words || [],
        });
      } catch {
        // not logged in or endpoint unavailable — ignore
      }
    };

    fetchSavedWordStatus();
  }, []);

  console.log("wordStatus:", wordStatus);
  const normalizeWord = (value = "") =>
    value
      .toString()
      .toLowerCase()
      .replace(/[.,!?;:"()\-_/\\[\]{}…]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const wordsForGame = useMemo(() => {
    if (!selectedSegment?.text || !Array.isArray(gameData?.words)) {
      return [];
    }

    const segmentWordSet = new Set(
      normalizeWord(selectedSegment.text).split(" ").filter(Boolean),
    );

    return gameData.words.filter((wordObj) => {
      const candidateWords = [
        wordObj?.the_word,
        wordObj?.word,
        wordObj?.lemma,
        wordObj?.base_word,
      ]
        .map(normalizeWord)
        .filter(Boolean);

      return candidateWords.some((w) => segmentWordSet.has(w));
    });
  }, [selectedSegment?.text, gameData?.words]);

  const wordsForCompose = useMemo(() => {
    if (!selectedSegment?.text) {
      return [];
    }

    return selectedSegment.text
      .split(/\s+/)
      .map((word) =>
        word
          .trim()
          .replace(/^[.,!?;:"()\-_/\\[\]{}…]+|[.,!?;:"()\-_/\\[\]{}…]+$/g, ""),
      )
      .filter(Boolean);
  }, [selectedSegment?.text]);

  console.log("Selected segment:", selectedSegment);
  console.log("Words for game:", wordsForGame);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="listen-page">
      <h1>ადას მიერ მოყოლილი ზღაპარი</h1>
      {/* {gameData && gameData.audioData && gameData.audioData[0] && ( */}
      <div className="audio-section">
        <AudioPlayer
          src={audiofilePath.current}
          segments={gameData?.segments || []}
          startTime={selectedSegment?.time}
          seekTrigger={seekTrigger}
        />
      </div>
      {/* // )} */}
      {gameData && gameData.words && (
        <>
          <EpisodePicker
            episodes={gameData?.segments || []}
            activeEpisodeId={selectedSegment?.id ?? null}
            setSelectedEpisode={setSelectedSegment}
            setSeekTrigger={setSeekTrigger}
          />

          <h2 className="segment-info-title">
            ეპიზოდი {selectedSegment?.id ?? "-"} - სიტყვების რაოდენობა:{" "}
            {wordsForGame.length}
          </h2>
          {/* {!selectedSegment ? (
            <div className="segment-hint">
              აირჩიე ეპიზოდი ზემოთ მოცემული ღილაკებიდან სათამაშოდ სიტყვების
              ასარჩევად
            </div>
          ) : null} */}

          <WordGamePanel
            words={wordsForGame}
            wordStatus={wordStatus}
            allowCompose={true}
            composeWords={wordsForCompose}
          />
        </>
      )}
    </div>
  );
}

export default AudioToWordGame;
