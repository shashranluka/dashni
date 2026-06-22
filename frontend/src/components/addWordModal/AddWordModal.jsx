import { useEffect, useRef, useState } from "react";
import newRequest from "../../utils/newRequest";
import "./AddWordModal.scss";

function AddWordModal({ open, initialWord = "", initialDefinition = "", onClose, onSaved }) {
  const [word, setWord] = useState(initialWord);
  const [definition, setDefinition] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isPrivateContributor, setIsPrivateContributor] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragRef = useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });
  const wasOpenRef = useRef(false);
  const prevInitialWordRef = useRef("");
  const prevInitialDefinitionRef = useRef("");

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("currentUser") || "null");
      setIsPrivateContributor(user?.is_private_contributor === true);
    } catch {
      setIsPrivateContributor(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      wasOpenRef.current = false;
      prevInitialWordRef.current = "";
      prevInitialDefinitionRef.current = "";
      return;
    }

    if (!wasOpenRef.current) {
      setWord(initialWord || "");
      setDefinition(initialDefinition || "");
      setError("");
      setSaving(false);
      wasOpenRef.current = true;
      prevInitialWordRef.current = initialWord || "";
      prevInitialDefinitionRef.current = initialDefinition || "";
      return;
    }

    if (initialWord && initialWord !== prevInitialWordRef.current) {
      setWord(initialWord);
      prevInitialWordRef.current = initialWord;
    }

    if (initialDefinition && initialDefinition !== prevInitialDefinitionRef.current) {
      setDefinition(initialDefinition);
      prevInitialDefinitionRef.current = initialDefinition;
    }
  }, [open, initialWord, initialDefinition]);


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

  const handleMouseDown = (e) => {
    dragRef.current.dragging = true;
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
    dragRef.current.originX = position.x;
    dragRef.current.originY = position.y;
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragRef.current.dragging) return;

      const nextX = dragRef.current.originX + (e.clientX - dragRef.current.startX);
      const nextY = dragRef.current.originY + (e.clientY - dragRef.current.startY);

      setPosition({ x: nextX, y: nextY });
    };

    const handleMouseUp = () => {
      dragRef.current.dragging = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [position.x, position.y]);

  if (!open || !isPrivateContributor) return null;

  return (
    <div className="awm-backdrop" >
      <div
        className="awm-modal"
        onMouseDown={handleMouseDown}
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      >
        <h3>სიტყვის დამატების ფანჯარა. შეგიძლიათ "მაუსით" ეკრანზე ამოძრაოთ</h3>

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