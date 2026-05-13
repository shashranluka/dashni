import React, { useState, useEffect } from "react";
import { toDisplayText } from "../../utils/georgiaNormalize";
import "./Words.scss";

function Words() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // PostgreSQL-დან მონაცემების მიღება
    fetch("http://localhost:8800/api/words")
      .then((res) => res.json())
      .then((data) => {
        setWords(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="words loading">იტვირთება...</div>;

  return (
    <div className="words">
      <h1>სიტყვები</h1>
      <div className="words-grid">
        {words.map((word) => (
          <div key={word.id} className="word-card">
            <h3>{toDisplayText(word.foreign_word)}</h3>
            <p>{toDisplayText(word.translation)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Words;
