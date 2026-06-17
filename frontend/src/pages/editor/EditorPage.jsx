import { useEffect, useMemo, useRef, useState } from "react";
import AudioPlayer from "../../components/AudioPlayer/AudioPlayer";
import RareKeyboard from "../../components/RareKeyboard/RareKeyboard";
import LexiconSearch from "../../components/LexiconSearch/LexiconSearch";
import newRequest from "../../utils/newRequest";
import { toDisplayText } from "../../utils/georgiaNormalize";
import "./EditorPage.scss";

const AUDIO_FILE = "src/assets/audio_files/adas_mier_moyolili_zghapari.m4a";

function EditorPage() {
  const [segments, setSegments] = useState([]);
  const [words, setWords] = useState([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState("");
  const [textDraft, setTextDraft] = useState(""); // ← RAW Unicode
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingWordId, setSavingWordId] = useState(null);
  const [wordDrafts, setWordDrafts] = useState({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(true);
  const textAreaRef = useRef(null);
  console.log("segments", segments);
  const selectedSegment = useMemo(
    () =>
      segments.find(
        (segment) => String(segment.id) === String(selectedSegmentId),
      ) || null,
    [segments, selectedSegmentId],
  );

  const normalizeWord = (value = "") =>
    value
      .toString()
      .toLowerCase()
      .replace(/[.,!?;:"()\-_/\\[\]{}…]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const selectedSegmentWords = useMemo(() => {
    if (!selectedSegment?.text || !Array.isArray(words)) {
      return [];
    }

    const segmentWordSet = new Set(
      normalizeWord(selectedSegment.text).split(" ").filter(Boolean),
    );

    return words.filter((wordObj) => {
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
  }, [selectedSegment?.text, words]);

  const wordTranslationMap = useMemo(() => {
    const map = new Map();

    words.forEach((wordObj) => {
      const translation = wordObj?.translation || "";
      const candidates = [
        wordObj?.the_word,
        wordObj?.word,
        wordObj?.lemma,
        wordObj?.base_word,
      ]
        .map(normalizeWord)
        .filter(Boolean);

      candidates.forEach((candidate) => {
        if (!map.has(candidate)) {
          map.set(candidate, translation);
        }
      });
    });

    return map;
  }, [words]);

  const previewItems = useMemo(() => {
    const tokens = textDraft.split(/\s+/).filter(Boolean);

    return tokens.map((token, index) => {
      const cleaned = token.replace(
        /^[.,!?;:"()\-_/\\[\]{}…]+|[.,!?;:"()\-_/\\[\]{}…]+$/g,
        "",
      );
      const normalized = normalizeWord(cleaned);
      const translation = wordTranslationMap.get(normalized) || "-";

      return {
        id: `${token}-${index}`,
        word: token,
        translation,
      };
    });
  }, [textDraft, wordTranslationMap]);

  const exportCSV = (data, filename = "export.csv") => {
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(row =>
      Object.values(row).map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")
    ).join("\n");

    const blob = new Blob([`${headers}\n${rows}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await newRequest.get("/audio");
        const nextSegments = response?.data?.segments || [];
        const nextWords = response?.data?.words || [];
        setSegments(nextSegments);
        setWords(nextWords);

        if (nextSegments.length > 0) {
          const firstSegment = nextSegments[0];
          setSelectedSegmentId(String(firstSegment.id));
          setTextDraft(firstSegment.text || "");
        }
      } catch (err) {
        setError(
          err?.response?.data?.message || "მონაცემების ჩატვირთვა ვერ მოხერხდა",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedSegment) return;
    setTextDraft(selectedSegment.text || "");
    setNotice("");
    setError("");
  }, [selectedSegment]);

  const handleSave = async () => {
    if (!selectedSegment) return;

    const nextText = textDraft.trim();
    if (!nextText) {
      setError("ტექსტი სავალდებულოა");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await newRequest.put(
        `/audio/segments/${selectedSegment.id}`,
        {
          text: nextText,
        },
      );

      const updated = response.data;

      setSegments((prev) =>
        prev.map((segment) =>
          segment.id === updated.id
            ? { ...segment, text: updated.text, time: updated.time }
            : segment,
        ),
      );

      setTextDraft(updated.text || "");
      setNotice("ტექსტი წარმატებით განახლდა");
    } catch (err) {
      setError(err?.response?.data?.message || "ტექსტის შენახვა ვერ მოხერხდა");
    } finally {
      setSaving(false);
    }
  };

  const handleInsertRareSymbol = (symbol) => {
    const textareaElement = textAreaRef.current;
    if (!textareaElement) {
      setTextDraft((prev) => `${prev}${symbol}`);
      return;
    }

    const selectionStart = textareaElement.selectionStart ?? textDraft.length;
    const selectionEnd = textareaElement.selectionEnd ?? textDraft.length;

    const nextText = `${textDraft.slice(0, selectionStart)}${symbol}${textDraft.slice(selectionEnd)}`;
    setTextDraft(nextText);

    window.requestAnimationFrame(() => {
      const nextCursor = selectionStart + symbol.length;
      textareaElement.focus();
      textareaElement.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const handleWordFieldChange = (wordId, fieldName, value) => {
    if (!wordId) return;

    setWordDrafts((prev) => ({
      ...prev,
      [wordId]: {
        ...(prev[wordId] || {}),
        [fieldName]: value,
      },
    }));
  };

  const handleWordSave = async (wordObj) => {
    const wordId = wordObj?.id;
    if (!wordId) return;

    const draft = wordDrafts[wordId] || {
      the_word: wordObj?.the_word || "",
      translation: wordObj?.translation || "",
    };

    const nextWord = (draft.the_word || "").trim();
    const nextTranslation = (draft.translation || "").trim();

    if (!nextWord || !nextTranslation) {
      setError("სიტყვაც და თარგმანიც სავალდებულოა");
      setNotice("");
      return;
    }

    setSavingWordId(wordId);
    setError("");
    setNotice("");

    try {
      const response = await newRequest.put(`/audio/words/${wordId}`, {
        the_word: nextWord,
        translation: nextTranslation,
      });

      const updatedWord = response?.data;
      setWords((prev) =>
        prev.map((entry) =>
          entry.id === updatedWord.id
            ? {
                ...entry,
                the_word: updatedWord.the_word,
                translation: updatedWord.translation,
              }
            : entry,
        ),
      );

      setWordDrafts((prev) => ({
        ...prev,
        [wordId]: {
          the_word: updatedWord.the_word || "",
          translation: updatedWord.translation || "",
        },
      }));
      setNotice("სიტყვა წარმატებით განახლდა");
    } catch (err) {
      setError(err?.response?.data?.message || "სიტყვის შენახვა ვერ მოხერხდა");
    } finally {
      setSavingWordId(null);
    }
  };

  if (loading) {
    return (
      <section className="editor-page">
        <p>იტვირთება...</p>
      </section>
    );
  }

  return (
    <section className="editor-page">
      <header className="editor-header">
        <h1>Editor Page</h1>
        <p>
          ხელმისაწვდომია როგორც audio_segments ტექსტების, ასევე ქვემოთ სიტყვის
          და თარგმანის რედაქტირება.
        </p>
      </header>

      <div className="editor-audio-wrap">
        <AudioPlayer src={AUDIO_FILE} startTime={selectedSegment?.time} />
      </div>

      <div className="editor-panel">
        <label className="field">
          <span>ეპიზოდი</span>
          <select
            value={selectedSegmentId}
            onChange={(event) => setSelectedSegmentId(event.target.value)}
          >
            {segments.map((segment) => (
              <option key={segment.id} value={segment.id}>
                ეპიზოდი {segment.id} ({segment.time})
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>ტექსტი</span>
          <textarea
            ref={textAreaRef}
            rows={12}
            value={textDraft}
            onChange={(event) => setTextDraft(event.target.value)}
            placeholder="ტექსტი"
          />
        </label>

        <div className="actions">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !selectedSegment}
          >
            {saving ? "ინახება..." : "შენახვა"}
          </button>
        </div>

        {notice ? <p className="message ok">{notice}</p> : null}
        {error ? <p className="message error">{error}</p> : null}
      </div>
      <LexiconSearch />


      <div className="preview">
        <div className="preview-title">Preview</div>
        {previewItems.length ? (
          <div className="preview-grid">
            {previewItems.map((item) => (
              <div
                key={item.id}
                className={`preview-item ${item.translation === "-" ? "missing-translation" : ""}`}
              >
                <div className="preview-word">{toDisplayText(item.word)}</div>
                <div className="preview-translation">
                  {toDisplayText(item.translation)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="preview-empty">ტექსტი ცარიელია</div>
        )}
      </div>

      <section className="segment-words">
        <h2>არჩეული ეპიზოდის სიტყვები</h2>
        {selectedSegmentWords.length ? (
          <div className="segment-words-list">
            {selectedSegmentWords.map((wordObj, index) => {
              const wordText = wordObj?.the_word || wordObj?.word || "-";
              const translationText = wordObj?.translation || "-";
              const itemKey = wordObj?.id || `${wordText}-${translationText}-${index}`;
              const draft = wordObj?.id
                ? (wordDrafts[wordObj.id] || {
                    the_word: wordObj?.the_word || "",
                    translation: wordObj?.translation || "",
                  })
                : {
                    the_word: wordObj?.the_word || "",
                    translation: wordObj?.translation || "",
                  };

              return (
                <div key={itemKey} className="segment-words-item">
                  <label className="segment-word-field">
                    <span>სიტყვა</span>
                    <input
                      type="text"
                      value={draft.the_word}
                      onChange={(event) =>
                        handleWordFieldChange(
                          wordObj?.id,
                          "the_word",
                          event.target.value,
                        )
                      }
                      disabled={!wordObj?.id || savingWordId === wordObj.id}
                    />
                  </label>
                  <label className="segment-word-field">
                    <span>თარგმანი</span>
                    <input
                      type="text"
                      value={draft.translation}
                      onChange={(event) =>
                        handleWordFieldChange(
                          wordObj?.id,
                          "translation",
                          event.target.value,
                        )
                      }
                      disabled={!wordObj?.id || savingWordId === wordObj.id}
                    />
                  </label>
                  <button
                    type="button"
                    className="save-word-btn"
                    onClick={() => handleWordSave(wordObj)}
                    disabled={!wordObj?.id || savingWordId === wordObj.id}
                  >
                    {savingWordId === wordObj.id ? "ინახება..." : "შენახვა"}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="segment-words-empty">
            ამ ეპიზოდისთვის სიტყვები ვერ მოიძებნა.
          </p>
        )}
      </section>


      <div className="editor-keyboard-dock">
        <RareKeyboard
          isOpen={isKeyboardOpen}
          onToggle={() => setIsKeyboardOpen((prev) => !prev)}
          onInsert={handleInsertRareSymbol}
          disabled={!selectedSegment}
        />
      </div>
      <button onClick={() => exportCSV(segments, "segments.csv")}>Export segments CSV</button>
      <button onClick={() => exportCSV(words, "words.csv")}>Export words CSV</button>
    
      {/* <div className="editor-segments-list">
        <h2>ყველა ეპიზოდი</h2>
        <ol>
          {segments.map((segment) => (
            <li key={segment.id}>
              ეპიზოდი {segment.id} - დრო: {segment.time}
              <br />
              {segment.text}
            </li>
          ))}
        </ol>
      </div> */}
    </section>
  );
}

export default EditorPage;
