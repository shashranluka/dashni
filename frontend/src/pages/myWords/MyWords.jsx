import { useEffect, useMemo, useState } from "react";
import newRequest from "../../utils/newRequest";
import WordGamePanel from "../../components/WordGamePanel/WordGamePanel";
import "./MyWords.scss";

function MyWords() {
    const [rows, setRows] = useState([]);
    const [wordStatus, setWordStatus] = useState({
        learned_word_ids: [],
        needs_learning_word_ids: [],
        learned_words: [],
        needs_learning_words: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadMyWords = async () => {
            setLoading(true);
            setError("");

            try {
                const [privateWordsRes, wordStatusRes] = await Promise.all([
                    newRequest.get("/private-words"),
                    newRequest.get("/results/word-status").catch(() => ({ data: {} })),
                ]);

                setRows(privateWordsRes?.data?.rows || []);
                setWordStatus({
                    learned_word_ids: wordStatusRes?.data?.learned_word_ids || [],
                    needs_learning_word_ids: wordStatusRes?.data?.needs_learning_word_ids || [],
                    learned_words: wordStatusRes?.data?.learned_words || [],
                    needs_learning_words: wordStatusRes?.data?.needs_learning_words || [],
                });
            } catch (err) {
                setRows([]);
                setError(err?.response?.data?.message || "private სიტყვების წამოღება ვერ შესრულდა");
            } finally {
                setLoading(false);
            }
        };

        loadMyWords();
    }, []);

    const privateGameWords = useMemo(
        () =>
            rows.map((item) => ({
                id: item.id,
                word: item.word,
                the_word: item.word,
                translation: item.definition,
                source: "private",
                is_private: true,
            })),
        [rows],
    );

    return (
        <section className="my-words-page">
            <header className="my-words-header">
                {/* <h1>ჩემი სიტყვები</h1> */}
                <p>ჩემს მიერ დამატებული სიტყვები და მათი განმარტებები.</p>
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

                    {privateGameWords.length > 0 ? (
                        <section className="my-words-game">
                            <h2>სიტყვების თამაში (private)</h2>
                            <WordGamePanel
                                words={privateGameWords}
                                wordStatus={wordStatus}
                                allowCompose={false}
                                getWordSource={() => "private"}
                            />
                        </section>
                    ) : null}
                </>
            ) : null}
        </section>
    );
}

export default MyWords;
