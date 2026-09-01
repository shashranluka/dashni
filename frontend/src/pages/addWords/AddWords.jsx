import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./AddWords.scss";

const LANGUAGE_OPTIONS = [
  { value: "tushetian", label: "თუშური" },
  { value: "english", label: "ინგლისური" },
  { value: "georgian", label: "ქართული" },
  { value: "other", label: "სხვა" },
];

const parseDelimitedLine = (line, delimiter) => {
  const cells = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === delimiter && !quoted) {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += char;
    }
  }

  cells.push(cell.trim());
  return cells;
};

const parseWordFile = (text, fallbackLanguage) => {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim());
  if (!lines.length) return [];

  const delimiter = lines[0].includes("\t") ? "\t" : ",";
  const firstCells = parseDelimitedLine(lines[0], delimiter).map((cell) =>
    cell.toLowerCase(),
  );
  const hasHeader =
    firstCells.includes("word") &&
    (firstCells.includes("definition") || firstCells.includes("translation"));
  const wordIndex = hasHeader ? firstCells.indexOf("word") : 0;
  const definitionIndex = hasHeader
    ? Math.max(firstCells.indexOf("definition"), firstCells.indexOf("translation"))
    : 1;
  const tagsIndex = hasHeader ? firstCells.indexOf("tags") : 2;
  const languageIndex = hasHeader ? firstCells.indexOf("language") : 3;

  return lines.slice(hasHeader ? 1 : 0).map((line, index) => {
    const cells = parseDelimitedLine(line, delimiter);
    return {
      line: index + (hasHeader ? 2 : 1),
      word: cells[wordIndex]?.trim() || "",
      definition: cells[definitionIndex]?.trim() || "",
      language: cells[languageIndex]?.trim().toLowerCase() || fallbackLanguage,
      tags: cells[tagsIndex]?.trim() || "",
    };
  });
};

function AddWords() {
  const [word, setWord] = useState("");
  const [definition, setDefinition] = useState("");
  const [tags, setTags] = useState("");
  const [language, setLanguage] = useState("tushetian");
  const [customLanguage, setCustomLanguage] = useState("");
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const selectedLanguage =
    language === "other" ? customLanguage.trim().toLowerCase() : language;
  const validRows = useMemo(
    () => rows.filter((row) => row.word && row.definition && row.language),
    [rows],
  );

  const resetMessages = () => {
    setError("");
    setNotice("");
    setResult(null);
  };

  const handleSingleSubmit = async (event) => {
    event.preventDefault();
    resetMessages();
    if (!word.trim() || !definition.trim() || !selectedLanguage) {
      setError("სიტყვა, განმარტება და ენა სავალდებულოა");
      return;
    }

    setSaving(true);
    try {
      await newRequest.post("/private-words", {
        word: word.trim(),
        definition: definition.trim(),
        language: selectedLanguage,
        tags,
      });
      setWord("");
      setDefinition("");
      setTags("");
      setNotice("სიტყვა წარმატებით შეინახა");
    } catch (err) {
      setError(err?.response?.data?.message || "სიტყვის შენახვა ვერ შესრულდა");
    } finally {
      setSaving(false);
    }
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    resetMessages();

    try {
      const parsedRows = parseWordFile(await file.text(), selectedLanguage);
      setRows(parsedRows);
      setFileName(file.name);
      if (!parsedRows.length) setError("ფაილში ჩანაწერები ვერ მოიძებნა");
    } catch {
      setRows([]);
      setFileName("");
      setError("ფაილის წაკითხვა ვერ მოხერხდა");
    }
  };

  const handleBulkSubmit = async () => {
    resetMessages();
    if (!validRows.length) {
      setError("შესანახად ვალიდური ჩანაწერები არ არის");
      return;
    }

    setSaving(true);
    try {
      const response = await newRequest.post("/private-words/bulk", {
        rows: validRows.map(({ word: rowWord, definition: rowDefinition, language: rowLanguage, tags: rowTags }) => ({
          word: rowWord,
          definition: rowDefinition,
          language: rowLanguage,
          tags: rowTags,
        })),
      });
      setResult(response.data);
      setNotice("ფაილის მონაცემები წარმატებით დამუშავდა");
    } catch (err) {
      setError(err?.response?.data?.message || "ფაილის იმპორტი ვერ შესრულდა");
    } finally {
      setSaving(false);
    }
  };

  const clearFile = () => {
    setRows([]);
    setFileName("");
    resetMessages();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="add-words-page">
      <header className="add-words-header">
        <div>
          <span className="add-words-eyebrow">პირადი ლექსიკონი</span>
          <h1>სიტყვების დამატება</h1>
          <p>დაამატე ერთი სიტყვა ხელით ან ატვირთე რამდენიმე სიტყვა ერთ ფაილად.</p>
        </div>
        <Link to="/my-words" className="add-words-link">ჩემი სიტყვები</Link>
      </header>

      <section className="add-words-card">
        <div className="add-words-card-heading">
          <span className="add-words-step">01</span>
          <div>
            <h2>ერთი სიტყვის დამატება</h2>
            <p>არსებული სიტყვა განმეორებით დამატებისას განახლდება.</p>
          </div>
        </div>

        <form className="add-words-form" onSubmit={handleSingleSubmit}>
          <label>
            <span>სიტყვა</span>
            <input
              value={word}
              onChange={(event) => setWord(event.target.value)}
              placeholder="მაგ. დაშნი"
              disabled={saving}
            />
          </label>
          <label>
            <span>ენა</span>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              disabled={saving}
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          {language === "other" ? (
            <label>
              <span>ენის კოდი</span>
              <input
                value={customLanguage}
                onChange={(event) => setCustomLanguage(event.target.value)}
                placeholder="მაგ. french"
                disabled={saving}
              />
            </label>
          ) : null}
          <label>
            <span>თეგები</span>
            <input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="მაგ. ზღაპარი, სასწავლი"
              disabled={saving}
            />
          </label>
          <label className="add-words-wide">
            <span>განმარტება</span>
            <textarea
              value={definition}
              onChange={(event) => setDefinition(event.target.value)}
              placeholder="ჩაწერე სიტყვის განმარტება ან თარგმანი"
              rows={3}
              disabled={saving}
            />
          </label>
          <button className="add-words-primary" type="submit" disabled={saving}>
            {saving ? "ინახება..." : "სიტყვის შენახვა"}
          </button>
        </form>
      </section>

      <section className="add-words-card">
        <div className="add-words-card-heading">
          <span className="add-words-step">02</span>
          <div>
            <h2>ფაილიდან დამატება</h2>
            <p>ატვირთე UTF-8 ფორმატის CSV ან TSV ფაილი, მაქსიმუმ 1 000 ჩანაწერით.</p>
          </div>
        </div>

        <div className="add-words-file-row">
          <label className="add-words-file-button">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.tsv,text/csv,text/tab-separated-values"
              onChange={handleFile}
              disabled={saving}
            />
            ფაილის არჩევა
          </label>
          <span>{fileName || "ფაილი არჩეული არ არის"}</span>
          {rows.length ? (
            <button type="button" className="add-words-clear" onClick={clearFile}>
              გასუფთავება
            </button>
          ) : null}
        </div>

        <div className="add-words-format">
          <strong>სვეტები:</strong> word, definition, tags, language
          <span>language ცარიელი თუა, ზემოთ არჩეული ენა გამოიყენება.</span>
          <span>tags არასავალდებულოა და მძიმეებით გამოყოფილ თეგებს იღებს.</span>
        </div>

        {rows.length ? (
          <>
            <div className="add-words-summary">
              <span>სულ: <strong>{rows.length}</strong></span>
              <span>ვალიდური: <strong>{validRows.length}</strong></span>
              <span>შეცდომიანი: <strong>{rows.length - validRows.length}</strong></span>
            </div>
            <div className="add-words-table-wrap">
              <table>
                <thead>
                  <tr><th>#</th><th>სიტყვა</th><th>განმარტება</th><th>თეგები</th><th>ენა</th><th>სტატუსი</th></tr>
                </thead>
                <tbody>
                  {rows.slice(0, 100).map((row) => {
                    const valid = row.word && row.definition && row.language;
                    return (
                      <tr key={`${row.line}-${row.word}`} className={valid ? "" : "is-invalid"}>
                        <td>{row.line}</td><td>{row.word || "—"}</td>
                        <td>{row.definition || "—"}</td><td>{row.tags || "—"}</td><td>{row.language || "—"}</td>
                        <td>{valid ? "მზადაა" : "შეავსე ველები"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {rows.length > 100 ? <p>ნაჩვენებია პირველი 100 ჩანაწერი.</p> : null}
            </div>
            <button
              className="add-words-primary"
              type="button"
              onClick={handleBulkSubmit}
              disabled={saving || !validRows.length}
            >
              {saving ? "იტვირთება..." : `${validRows.length} სიტყვის შენახვა`}
            </button>
          </>
        ) : null}
      </section>

      <div className="add-words-messages" aria-live="polite">
        {notice ? <p className="add-words-success">{notice}</p> : null}
        {error ? <p className="add-words-error">{error}</p> : null}
        {result ? (
          <p className="add-words-result">
            დამატებულია: {result.inserted} · განახლებულია: {result.updated} ·
            გამოტოვებულია: {result.skipped}
          </p>
        ) : null}
      </div>
    </main>
  );
}

export default AddWords;
