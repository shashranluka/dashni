import { useEffect, useMemo, useState } from "react";
import AudioPlayer from "../../components/AudioPlayer/AudioPlayer";
import newRequest from "../../utils/newRequest";
import "./EditorPage.scss";

const AUDIO_FILE = "src/assets/audio_files/adas_mier_moyolili_zghapari.m4a";

function EditorPage() {
  const [segments, setSegments] = useState([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState("");
  const [textDraft, setTextDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const selectedSegment = useMemo(
    () => segments.find((segment) => String(segment.id) === String(selectedSegmentId)) || null,
    [segments, selectedSegmentId]
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await newRequest.get("/audio");
        const nextSegments = response?.data?.segments || [];
        setSegments(nextSegments);

        if (nextSegments.length > 0) {
          const firstSegment = nextSegments[0];
          setSelectedSegmentId(String(firstSegment.id));
          setTextDraft(firstSegment.text || "");
        }
      } catch (err) {
        setError(err?.response?.data?.message || "მონაცემების ჩატვირთვა ვერ მოხერხდა");
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
      const response = await newRequest.put(`/audio/segments/${selectedSegment.id}`, {
        text: nextText,
      });

      const updated = response.data;

      setSegments((prev) =>
        prev.map((segment) =>
          segment.id === updated.id ? { ...segment, text: updated.text, time: updated.time } : segment
        )
      );

      setTextDraft(updated.text || "");
      setNotice("ტექსტი წარმატებით განახლდა");
    } catch (err) {
      setError(err?.response?.data?.message || "ტექსტის შენახვა ვერ მოხერხდა");
    } finally {
      setSaving(false);
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
        <p>ამ ეტაპზე ხელმისაწვდომია მხოლოდ audio_segments ტექსტების რედაქტირება.</p>
      </header>

      <div className="editor-mode-note">
        <strong>მომავალი:</strong> სიტყვების რედაქტირების ბლოკი დაემატება შემდეგ ვერსიაში.
      </div>

      <div className="editor-audio-wrap">
        <AudioPlayer src={AUDIO_FILE} startTime={selectedSegment?.time} />
      </div>

      <div className="editor-panel">
        <label className="field">
          <span>ეპიზოდი</span>
          <select value={selectedSegmentId} onChange={(event) => setSelectedSegmentId(event.target.value)}>
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
            rows={12}
            value={textDraft}
            onChange={(event) => setTextDraft(event.target.value)}
            placeholder="ტექსტი"
          />
        </label>

        <div className="actions">
          <button type="button" onClick={handleSave} disabled={saving || !selectedSegment}>
            {saving ? "ინახება..." : "შენახვა"}
          </button>
        </div>

        {notice ? <p className="message ok">{notice}</p> : null}
        {error ? <p className="message error">{error}</p> : null}
      </div>
    </section>
  );
}

export default EditorPage;
