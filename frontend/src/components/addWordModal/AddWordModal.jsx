import { useEffect, useState } from "react";
import newRequest from "../../utils/newRequest";
import "./AddWordModal.scss";

function AddWordModal({ open, initialWord = "", onClose, onSaved }) {
  const [word, setWord] = useState(initialWord);
  const [definition, setDefinition] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isPrivateContributor, setIsPrivateContributor] = useState(false);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("currentUser") || "null");
      setIsPrivateContributor(user?.is_private_contributor === true);
    } catch {
      setIsPrivateContributor(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setWord(initialWord || "");
      setDefinition("");
      setError("");
      setSaving(false);
    }
  }, [open, initialWord]);

  if (!open || !isPrivateContributor) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!word.trim() || !definition.trim()) {
      setError("სიტყვა და განმარტება სავალდებულოა");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await newRequest.post("/private-words", {
        word: word.trim(),
        definition: definition.trim(),
      });
      if (onSaved) onSaved();
      if (onClose) onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "დამატება ვერ შესრულდა");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="awm-backdrop" onClick={onClose}>
      <div className="awm-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Private სიტყვის დამატება</h3>

        <form onSubmit={handleSubmit}>
          <label>სიტყვა</label>
          <input
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="სიტყვა"
          />

          <label>განმარტება</label>
          <textarea
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            placeholder="განმარტება"
            rows={4}
          />

          {error ? <p className="error">{error}</p> : null}

          <div className="awm-actions">
            <button type="button" onClick={onClose} disabled={saving}>
              გაუქმება
            </button>
            <button type="submit" disabled={saving}>
              {saving ? "ინახება..." : "დამატება"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddWordModal;