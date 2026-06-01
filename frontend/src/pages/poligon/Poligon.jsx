import { useEffect, useRef, useState } from "react";
import AudioPlayer from "../../components/AudioPlayer/AudioPlayer";
import EpisodePicker from "../../components/EpisodePicker/EpisodePicker";
import newRequest from "../../utils/newRequest";
import extraSymbols from "./extraSymbols";
import "./Poligon.scss";

const AUDIO_FILE = "src/assets/audio_files/adas_mier_moyolili_zghapari.m4a";

const toSeconds = (timeStr) => {
  if (!timeStr) return 0;
  const [minutes, seconds] = String(timeStr).split(":");
  return Number(minutes || 0) * 60 + Number(seconds || 0);
};

function Poligon() {
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [typedText, setTypedText] = useState("");
  const [fontSize, setFontSize] = useState(30);
  const [fontWeight, setFontWeight] = useState(400);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const [seekTrigger, setSeekTrigger] = useState(0);
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const activeEpisodeId = (() => {
    if (!episodes.length) return null;

    let candidate = episodes[0];
    for (const episode of episodes) {
      if (toSeconds(episode.time) <= playbackSeconds) {
        candidate = episode;
      } else {
        break;
      }
    }

    return candidate?.id ?? null;
  })();

  useEffect(() => {
    const fetchAudioData = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await newRequest.get("/audio");
        const nextEpisodes = response?.data?.segments || [];
        setEpisodes(nextEpisodes);
        setSelectedEpisode(nextEpisodes[0] || null);
        setPlaybackSeconds(toSeconds(nextEpisodes[0]?.time));
      } catch (err) {
        setError(
          err?.response?.data?.message || "მონაცემების ჩატვირთვა ვერ მოხერხდა",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAudioData();
  }, []);

  if (loading) {
    return (
      <section className="poligon-page">
        <p>იტვირთება...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="poligon-page">
        <p>{error}</p>
      </section>
    );
  }

  return (
    <section className="poligon-page">
      {/* <h1>პოლიგონი</h1>
      <p className="poligon-page__subtitle">
        ამ გვერდზე აუდიოს მოსმენა თავისუფლად შეგიძლიათ, ავტორიზაციის გარეშე.
      </p> */}

      <div className="poligon-page__player-wrap">
        <AudioPlayer
          src={AUDIO_FILE}
          startTime={selectedEpisode?.time}
          onTimeUpdate={setPlaybackSeconds}
          seekTrigger={seekTrigger}
        />
      </div>

      <EpisodePicker
        episodes={episodes}
        activeEpisodeId={activeEpisodeId}
        setSelectedEpisode={setSelectedEpisode}
        setSeekTrigger={setSeekTrigger}
      />

      <div className="poligon-page__input-wrap">
        <div className="poligon-page__input-label-row">
          <span>ტექსტი</span>
          <div className="poligon-page__font-size-controls">
            <div className="poligon-page__font-size-group">
              <button
                type="button"
                className="poligon-page__font-size-btn"
                aria-label="შრიფტის შემცირება"
                onClick={() => setFontSize((s) => Math.max(10, s - 1))}
              >
                A−
              </button>
              <span className="poligon-page__font-size-value">
                {fontSize}px
              </span>
              <button
                type="button"
                className="poligon-page__font-size-btn"
                aria-label="შრიფტის გადიდება"
                onClick={() => setFontSize((s) => Math.min(48, s + 1))}
              >
                A+
              </button>
            </div>
            <button
              type="button"
              className={`poligon-page__font-size-btn poligon-page__font-weight-btn${fontWeight >= 700 ? " is-active" : ""}`}
              aria-label="სიმკვეთრის შეცვლა"
              aria-pressed={fontWeight >= 700}
              onClick={() => setFontWeight((w) => (w >= 700 ? 400 : 700))}
            >
              <strong>B</strong>
            </button>
          </div>
        </div>
        <textarea
          ref={inputRef}
          value={typedText}
          onChange={(event) => setTypedText(event.target.value)}
          spellCheck={false}
          placeholder="აქ აკრიფეთ ტექსტი"
          style={{ fontSize: `${fontSize}px`, fontWeight }}
        />
      </div>

      <div
        className="poligon-page__symbol-keyboard"
        aria-label="დამატებითი სიმბოლოები"
      >
        {extraSymbols.map((symbol) => (
          <button
            key={symbol}
            type="button"
            className="poligon-page__symbol-btn"
            title={symbol}
            onClick={() => {
              const el = inputRef.current;
              if (!el) {
                setTypedText((prev) => prev + symbol);
                return;
              }
              const start = el.selectionStart ?? typedText.length;
              const end = el.selectionEnd ?? typedText.length;
              const next =
                typedText.slice(0, start) + symbol + typedText.slice(end);
              setTypedText(next);
              window.requestAnimationFrame(() => {
                const cursor = start + symbol.length;
                el.focus();
                el.setSelectionRange(cursor, cursor);
              });
            }}
          >
            {symbol}
          </button>
        ))}
      </div>
    </section>
  );
}

export default Poligon;
