import { useState } from "react";
import newRequest from "../../utils/newRequest";
import "./LexiconSearch.scss";

function LexiconSearch() {
  const [query, setQuery] = useState("");
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
      const response = await newRequest.get("/lexicons/search", {
        params: { q: query },
      });
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

  return (
    <section className="lexicon-search-panel">
      <h2>Lexicons ძებნა</h2>
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
