import { useEffect, useState } from "react";
import newRequest from "../../utils/newRequest";
import "./MyWords.scss";

function MyWords() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadMyWords = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await newRequest.get("/private-words");
                setRows(response?.data?.rows || []);
            } catch (err) {
                setRows([]);
                setError(err?.response?.data?.message || "private სიტყვების წამოღება ვერ შესრულდა");
            } finally {
                setLoading(false);
            }
        };

        loadMyWords();
    }, []);

    return (
        <section className="my-words-page">
            <header className="my-words-header">
                <h1>ჩემი private სიტყვები</h1>
                <p>აქ ჩანს შენი შენახული private სიტყვები და მათი განმარტებები.</p>
            </header>

            {loading ? <p className="my-words-info">იტვირთება...</p> : null}
            {error ? <p className="my-words-error">{error}</p> : null}

            {!loading && !error ? (
                <>
                    <p className="my-words-count">ნაპოვნია: {rows.length}</p>

                    {rows.length > 0 ? (
                        <div className="my-words-list">
                            {rows.map((item) => (
                                <article key={item.id} className="my-word-card">
                                    <h3>{item.word}</h3>
                                    <p>{item.definition}</p>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <p className="my-words-empty">შენთვის private სიტყვები ჯერ არ დამატებულა.</p>
                    )}
                </>
            ) : null}
        </section>
    );
}

export default MyWords;
