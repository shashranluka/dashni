import { useEffect, useMemo, useState } from "react";
import newRequest from "../../utils/newRequest";
import WordGamePanel from "../../components/WordGamePanel/WordGamePanel";
import { useConfirmDelete } from "../../hooks/useConfirmDelete";
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
    const [actionError, setActionError] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editWord, setEditWord] = useState("");
    const [editDefinition, setEditDefinition] = useState("");
    const [savingId, setSavingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [isListOpen, setIsListOpen] = useState(false);
    const { confirm: confirmDelete, ConfirmDialog } = useConfirmDelete();

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

    const startEditing = (item) => {
        setActionError("");
        setEditingId(item.id);
        setEditWord(item.word || "");
        setEditDefinition(item.definition || "");
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditWord("");
        setEditDefinition("");
    };

    const saveWordEdit = async (id) => {
        const nextWord = editWord.trim();
        const nextDefinition = editDefinition.trim();

        if (!nextWord || !nextDefinition) {
            setActionError("სიტყვა და განმარტება სავალდებულოა");
            return;
        }

        setActionError("");
        setSavingId(id);

        try {
            const res = await newRequest.put(`/private-words/${id}`, {
                word: nextWord,
                definition: nextDefinition,
            });

            const updated = res?.data?.data;
            if (updated) {
                setRows((prev) =>
                    prev.map((row) => (row.id === id ? { ...row, ...updated } : row)),
                );
            }

            cancelEditing();
        } catch (err) {
            setActionError(err?.response?.data?.message || "რედაქტირება ვერ შესრულდა");
        } finally {
            setSavingId(null);
        }
    };

    const deleteWord = async (id, word) => {
        const confirmed = await confirmDelete(word);
        if (!confirmed) return;

        setActionError("");
        setDeletingId(id);

        try {
            await newRequest.delete(`/private-words/${id}`);
            setRows((prev) => prev.filter((row) => row.id !== id));
            if (editingId === id) {
                cancelEditing();
            }
        } catch (err) {
            setActionError(err?.response?.data?.message || "წაშლა ვერ შესრულდა");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <section className="my-words-page">
            <header className="my-words-header">
                {/* <h1>ჩემი სიტყვები</h1> */}
                <h2>ჩემს მიერ დამატებული სიტყვები</h2>
            </header>

            {loading ? <p className="my-words-info">იტვირთება...</p> : null}
            {error ? <p className="my-words-error">{error}</p> : null}
            {actionError ? <p className="my-words-error">{actionError}</p> : null}
            {ConfirmDialog}

            {!loading && !error ? (
                <>
                    <button
                        type="button"
                        className="my-words-count"
                        onClick={() => setIsListOpen((prev) => !prev)}
                        aria-expanded={isListOpen}
                        aria-controls="my-words-list"
                        disabled={rows.length === 0}
                    >
                        ნაპოვნია: {rows.length} სიტყვა
                        {rows.length > 0 ? (
                            <span className="my-words-count-icon" aria-hidden="true">
                                {isListOpen ? "▾" : "▸"}
                            </span>
                        ) : null}
                    </button>

                    <div id="my-words-list" className="my-words-list">
                    {rows.length > 0 && isListOpen ? (
                        <>
                            {rows.map((item) => (
                                <article key={item.id} className="my-word-card">
                                    {editingId === item.id ? (
                                        <div className="my-word-edit-form">
                                            <input
                                                type="text"
                                                value={editWord}
                                                onChange={(e) => setEditWord(e.target.value)}
                                                placeholder="სიტყვა"
                                            />
                                            <textarea
                                                value={editDefinition}
                                                onChange={(e) => setEditDefinition(e.target.value)}
                                                placeholder="განმარტება"
                                                rows={3}
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <h3>{item.word}</h3>
                                            <p>{item.definition}</p>
                                        </>
                                    )}

                                    <div className="my-word-actions">
                                        {editingId === item.id ? (
                                            <>
                                                <button
                                                    type="button"
                                                    className="my-word-btn my-word-btn-save"
                                                    onClick={() => saveWordEdit(item.id)}
                                                    disabled={savingId === item.id}
                                                >
                                                    {savingId === item.id ? "ინახება..." : "შენახვა"}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="my-word-btn my-word-btn-cancel"
                                                    onClick={cancelEditing}
                                                    disabled={savingId === item.id}
                                                >
                                                    გაუქმება
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    className="my-word-btn my-word-btn-edit"
                                                    onClick={() => startEditing(item)}
                                                >
                                                    რედაქტირება
                                                </button>
                                                <button
                                                    type="button"
                                                    className="my-word-btn my-word-btn-delete"
                                                    onClick={() => deleteWord(item.id, item.word)}
                                                    disabled={deletingId === item.id}
                                                >
                                                    {deletingId === item.id ? "იშლება..." : "წაშლა"}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </>
                        ) : null}
                        </div>
                    {privateGameWords.length === 0 && (<p className="my-words-empty">შენთვის private სიტყვები ჯერ არ დამატებულა.</p>)}

                    {privateGameWords.length > 0 ? (
                        <section className="my-words-game">
                            {/* <h2>თამაში </h2> */}
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
