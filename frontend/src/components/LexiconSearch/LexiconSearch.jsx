import { useEffect, useRef, useState } from "react";
import newRequest from "../../utils/newRequest";
import "./LexiconSearch.scss";
import AddWordModal from "../addWordModal/AddWordModal";

const LEXICON_OPTIONS = [
  { value: "", label: "ყველა" },
  { value: "სიტყვანი", label: "სიტყვანი" },
  { value: "ქართ-თუშ_ლექსიკონი", label: "ქართ-თუშ" },
  { value: "თუშ-ქართ_ლექსიკონი", label: "თუშ-ქართ" },
];

function LexiconSearch() {
  const panelRef = useRef(null);

  const [query, setQuery] = useState("");
  const [lexicon, setLexicon] = useState(LEXICON_OPTIONS[0].value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [selectionBadge, setSelectionBadge] = useState(null);
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
    if (!isPrivateContributor) {
      setSelectionBadge(null);
      return;
    }

    const clearBadge = () => setSelectionBadge(null);

    const updateSelectionBadge = () => {
      const panel = panelRef.current;
      const selection = window.getSelection();

      if (!panel || !selection || selection.isCollapsed || selection.rangeCount === 0) {
        clearBadge();
        return;
      }

      const selectedText = selection.toString().trim();
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const insidePanel =
        container && panel.contains(container.nodeType === 1 ? container : container.parentNode);

      if (!selectedText || !insidePanel) {
        clearBadge();
        return;
      }

      const rect = range.getBoundingClientRect();
      if (!rect.width && !rect.height) {
        clearBadge();
        return;
      }

      const panelRect = panel.getBoundingClientRect();
      setSelectionBadge({
        top: rect.top - panelRect.top + panel.scrollTop - 34,
        left: rect.left + rect.width / 2 - panelRect.left + panel.scrollLeft,
        text: selectedText,
      });
    };

    document.addEventListener("selectionchange", updateSelectionBadge);
    window.addEventListener("resize", updateSelectionBadge);

    return () => {
      document.removeEventListener("selectionchange", updateSelectionBadge);
      window.removeEventListener("resize", updateSelectionBadge);
    };
  }, [isPrivateContributor]);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("ძიების ტექსტი სავალდებულოა");
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const params = { q: query };
      if (lexicon) params.lexicon_name = lexicon;

      const response = await newRequest.get("/lexicons/search", { params });
      setResults(response?.data?.rows || []);
    } catch (err) {
      setError(err?.response?.data?.message || "ძებნა ვერ შესრულდა");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleSearch();
  };

  const handlePlusMouseDown = (event) => {
    event.preventDefault();
    if (!selectionBadge?.text) return;
    setPrefillWord(selectionBadge.text);
    setIsAddModalOpen(true);
  };

  const handleDangerPlusMouseDown = (event) => {
    event.preventDefault();
    if (!selectionBadge?.text) return;
    setPrefillDefinition(selectionBadge.text);
    setIsAddModalOpen(true);
  };

  const handleAddModalClose = () => {
    setIsAddModalOpen(false);
    setPrefillWord("");
    setPrefillDefinition("");
  };

  // state-ები
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [prefillWord, setPrefillWord] = useState("");
  const [prefillDefinition, setPrefillDefinition] = useState("");

  return (
    <section className="lexicon-search-panel" ref={panelRef}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontWeight: 700, fontSize: 24 }}>ლექსიკონებში ძებნა</h2>

        <select
          value={lexicon}
          onChange={(e) => setLexicon(e.target.value)}
          style={{
            padding: "7px 12px",
            borderRadius: 8,
            border: "1px solid #bbb",
            fontSize: 16,
          }}
        >
          {LEXICON_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <form className="lexicon-search-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="აკრიფე ტექსტი და მოძებნე ჩანაწერები"
        />
        <button type="submit" disabled={loading}>
          {loading ? "ძებნა..." : "ძებნა"}
        </button>
      </form>

      {error ? <p className="error">{error}</p> : null}
      {searched && !error ? <p className="summary">ნაპოვნი ჩანაწერები: {results.length}</p> : null}

      {isPrivateContributor && selectionBadge ? (
        <div
          className="selection-plus-badges"
          style={{ top: selectionBadge.top, left: selectionBadge.left }}
        >
          <button
            type="button"
            className="selection-plus-badge"
            aria-label="მონიშნული ტექსტის დამატება"
            onMouseDown={handlePlusMouseDown}
          >
            +
          </button>
          <button
            type="button"
            className="selection-plus-badge selection-plus-badge--danger"
            aria-label="მონიშნული ტექსტის განმარტებაში დამატება"
            onMouseDown={handleDangerPlusMouseDown}
          >
            +
          </button>
        </div>
      ) : null}

      {results.length > 0 ? (
        <div className="lexicon-search-results">
          {results.map((row) => (
            <div key={row.id} className="lexicon-search-row">
              <div className="lexicon-text">{row.text}</div>
              <div className="lexicon-name">{row.lexicon_name}</div>
            </div>
          ))}
        </div>
      ) : searched && !error ? (
        <p className="empty">შედეგები ვერ მოიძებნა</p>
      ) : null}

      {isPrivateContributor && isAddModalOpen ? (
        <AddWordModal
          open={isAddModalOpen}
          initialWord={prefillWord}
          initialDefinition={prefillDefinition}
          onClose={handleAddModalClose}
          onSaved={() => {
            // სურვილისამებრ toast ან refresh
          }}
        />
      ) : null}
    </section>
  );
}

export default LexiconSearch;
