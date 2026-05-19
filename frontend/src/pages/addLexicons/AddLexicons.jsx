import { useMemo, useState } from "react";
import newRequest from "../../utils/newRequest";
import LexiconSearch from "../../components/LexiconSearch/LexiconSearch";
import "./AddLexicons.scss";

function AddLexicons() {
  const [lexiconName, setLexiconName] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [result, setResult] = useState(null);

  const rows = useMemo(() => {
    const lines = bulkText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    return lines.map((line) => ({
      text: line,
      lexicon_name: lexiconName.trim(),
    }));
  }, [bulkText, lexiconName]);

  const handleImport = async () => {
    if (!lexiconName.trim()) {
      setError("lexicon name სავალდებულოა");
      setNotice("");
      return;
    }

    if (!rows.length) {
      setError("დასამატებელი სტრიქონები ვერ მოიძებნა");
      setNotice("");
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");
    setResult(null);

    try {
      const response = await newRequest.post("/lexicons/bulk", { rows });
      const payload = response?.data;
      setResult(payload);
      setNotice("lexicons წარმატებით დაემატა");
    } catch (err) {
      setError(err?.response?.data?.message || "იმპორტი ვერ შესრულდა");
    } finally {
      setLoading(false);
    }
  };

  const handleTxtFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      setBulkText(content);
      setError("");
    } catch {
      setError("ფაილი ვერ წაიკითხა");
    }
  };

  return (
    <section className="add-lexicons-page">
      <header className="add-lexicons-header">
        <h1>addLexicons</h1>
        <p>
          თითო არაცარიელი ხაზი ჩაიწერება ცხრილში <strong>lexicons</strong> როგორც
          ცალკე ჩანაწერი.
        </p>
      </header>

      <div className="panel">
        <label className="field">
          <span>Lexicon name</span>
          <input
            type="text"
            value={lexiconName}
            onChange={(event) => setLexiconName(event.target.value)}
            placeholder="მაგ: tushetian-core"
          />
        </label>

        <div className="inline-tools">
          <label>
            <input type="file" accept=".txt,text/plain" onChange={handleTxtFile} />
          </label>
          <button
            type="button"
            className="btn"
            onClick={handleImport}
            disabled={loading}
          >
            {loading ? "იტვირთება..." : "მასიური დამატება"}
          </button>
        </div>

        <label className="field">
          <span>მონაცემები (ერთი სტრიქონი = ერთი ჩანაწერი)</span>
          <textarea
            value={bulkText}
            onChange={(event) => setBulkText(event.target.value)}
            placeholder="სტრიქონი 1&#10;სტრიქონი 2&#10;სტრიქონი 3"
          />
        </label>

        <div className="summary">სულ დასამატებელი ჩანაწერები: {rows.length}</div>

        {notice ? <div className="ok">{notice}</div> : null}
        {error ? <div className="error">{error}</div> : null}

        {result ? (
          <div className="summary">
            received: {result.received} | inserted: {result.inserted} | skipped: {result.skipped}
          </div>
        ) : null}
      </div>

      <LexiconSearch />
    </section>
  );
}

export default AddLexicons;
