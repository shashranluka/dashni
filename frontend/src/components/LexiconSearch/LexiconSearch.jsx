import { useState } from "react";
import newRequest from "../../utils/newRequest";
import "./LexiconSearch.scss";


const LEXICON_OPTIONS = [
  { value: "", label: "ყველა" },
  { value: "სიტყვანი", label: "სიტყვანი" },
  { value: "ქართ-თუშ_ლექსიკონი", label: "ქართ-თუშ" },
  { value: "თუშ-ქართ_ლექსიკონი", label: "თუშ-ქართ" },
];

function LexiconSearch() {
  const [query, setQuery] = useState("");
  const [lexicon, setLexicon] = useState(LEXICON_OPTIONS[0].value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (query.length === 0) {
      setError("ძიების ტექსტი სავალდებულოა");
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      // თუ lexicon ცარიელია, პარამეტრს არ ვაგზავნით (ყველა ლექსიკონი)
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
  console.log("LexiconSearch results:", results, results.length);
  const handleSubmit = (event) => {
    event.preventDefault();
    handleSearch();
  };

  return (
    <section className="lexicon-search-panel">
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontWeight: 700, fontSize: 24 }}>ლექსიკონებში ძებნა</h2>
        <select
          value={lexicon}
          onChange={e => setLexicon(e.target.value)}
          style={{
            padding: "7px 12px",
            borderRadius: 8,
            border: "1px solid #bbb",
            fontSize: 16
          }}
        >
          {LEXICON_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
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
      {searched && !error ? (
        <p className="summary">ნაპოვნი ჩანაწერები: {results.length}</p>
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
    </section>
  );
}

export default LexiconSearch;
