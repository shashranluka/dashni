import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import getCurrentUser from "../../utils/getCurrentUser";
import "./MyPage.scss";
import { Link } from "react-router-dom";

function MyPage() {
    const currentUser = getCurrentUser();
    const [activeTab, setActiveTab] = useState("texts");
    const [selectedLanguage, setSelectedLanguage] = useState(() => {
        // ვამოწმებთ, თუ localStorage-ში უკვე არის ენა შენახული
        const savedLanguage = localStorage.getItem("selectedLanguage");
        return savedLanguage || "ka"; // თუ არა, ნაგულისხმევი ქართული
    });
    console.log("Current User:", currentUser, selectedLanguage);
    // ტექსტების გამოხმობა

    // სიტყვების გამოხმობა
    const {
        isLoading: wordsLoading,
        error: wordsError,
        data: words,
        refetch: refetchWords
    } = useQuery({
        queryKey: ["userWords"],
        queryFn: () =>
            newRequest.get(`/words?userId=${currentUser._id}&language=${selectedLanguage}&whatIsNeeded=userWords`).then((res) => res.data),
        enabled: !!currentUser
    });

    const {
        isLoading: textsLoading,
        error: textsError,
        data: texts,
        refetch: refetchTexts
    } = useQuery({
        queryKey: ["userTexts"],
        queryFn: () =>
            newRequest.get(`/texts?userId=${currentUser._id}&language=${selectedLanguage}&whatIsNeeded=userTexts`).then((res) => res.data),
        enabled: !!currentUser
    });
    console.log("Texts:", texts);
    console.log("Words:", words);
    // ტექსტის წაშლის ფუნქცია
    const handleDeleteText = async (id) => {
        if (window.confirm("ნამდვილად გსურთ ტექსტის წაშლა?")) {
            try {
                await newRequest.delete(`/texts/${id}`);
                refetchTexts();
            } catch (error) {
                console.error("ტექსტის წაშლისას მოხდა შეცდომა:", error);
            }
        }
    };

    // სიტყვის წაშლის ფუნქცია
    const handleDeleteWord = async (id) => {
        if (window.confirm("ნამდვილად გსურთ სიტყვის წაშლა?")) {
            try {
                await newRequest.delete(`/words/${id}`);
                refetchWords();
            } catch (error) {
                console.error("სიტყვის წაშლისას მოხდა შეცდომა:", error);
            }
        }
    };

    // თუ მომხმარებელი არ არის შესული
    if (!currentUser) {
        return (
            <div className="my-page-container">
                <div className="auth-message">
                    <i className="fas fa-lock"></i>
                    <h2>ავტორიზაცია საჭიროა</h2>
                    <p>ამ გვერდის სანახავად გთხოვთ გაიაროთ ავტორიზაცია</p>
                    <Link to="/login" className="auth-btn">შესვლა</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="my-page-container">
            <div className="page-header">
                <h1>ჩემი გვერდი</h1>
                <p>აქ შეგიძლიათ იხილოთ თქვენს მიერ დამატებული ტექსტები და სიტყვები</p>
            </div>

            {/* ტაბების ნავიგაცია */}
            <div className="tabs-navigation">
                <button
                    className={`tab-btn ${activeTab === "texts" ? "active" : ""}`}
                    onClick={() => setActiveTab("texts")}
                >
                    <i className="fas fa-file-alt"></i> ჩემი ტექსტები
                </button>
                <button
                    className={`tab-btn ${activeTab === "words" ? "active" : ""}`}
                    onClick={() => setActiveTab("words")}
                >
                    <i className="fas fa-font"></i> ჩემი სიტყვები
                </button>
            </div>

            {/* ტექსტების სექცია */}
            {activeTab === "texts" && (
                <div className="texts-section">
                    <div className="section-header">
                        <h2>ჩემი ტექსტები</h2>
                        <Link to="/add-text" className="add-btn">
                            <i className="fas fa-plus"></i> ტექსტის დამატება
                        </Link>
                    </div>

                    {textsLoading ? (
                        <div className="loading-spinner">იტვირთება...</div>
                    ) : textsError ? (
                        <div className="error-message">
                            <i className="fas fa-exclamation-triangle"></i>
                            <p>ტექსტების ჩატვირთვა ვერ მოხერხდა</p>
                        </div>
                    ) : texts && texts.length > 0 ? (
                        <div className="texts-grid">
                            {texts.map((text) => (
                                <div key={text._id} className="text-card">
                                    <div className="text-header">
                                        <div className="language-badge">
                                            {text.language === "ka" ? "🇬🇪" :
                                                text.language === "en" ? "🇬🇧" :
                                                    text.language === "de" ? "🇩🇪" :
                                                        text.language === "fr" ? "🇫🇷" : "🌐"}
                                        </div>
                                        <div className="text-actions">
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDeleteText(text._id)}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-content">
                                        <p className="text-original">{text.text}</p>
                                        {text.translation && (
                                            <p className="text-translation">{text.translation}</p>
                                        )}
                                    </div>
                                    {text.additionalInfo && (
                                        <div className="text-additional-info">
                                            <p>{text.additionalInfo}</p>
                                        </div>
                                    )}
                                    <div className="text-footer">
                                        <span className="text-date">
                                            {new Date(text.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <i className="fas fa-file-alt"></i>
                            <p>თქვენ არ გაქვთ დამატებული ტექსტები</p>
                            <Link to="/add-text" className="add-btn">
                                <i className="fas fa-plus"></i> ტექსტის დამატება
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {/* სიტყვების სექცია */}
            {activeTab === "words" && (
                <div className="words-section">
                    <div className="section-header">
                        <h2>ჩემი სიტყვები</h2>
                        <Link to="/add-word" className="add-btn">
                            <i className="fas fa-plus"></i> სიტყვის დამატება
                        </Link>
                    </div>

                    {wordsLoading ? (
                        <div className="loading-spinner">იტვირთება...</div>
                    ) : wordsError ? (
                        <div className="error-message">
                            <i className="fas fa-exclamation-triangle"></i>
                            <p>სიტყვების ჩატვირთვა ვერ მოხერხდა</p>
                        </div>
                    ) : words && words.length > 0 ? (
                        <div className="words-grid">
                            {words.map((word) => (
                                <div key={word._id} className="word-card">
                                    <div className="word-header">
                                        <div className="language-badge">
                                            {word.language === "ka" ? "🇬🇪" :
                                                word.language === "en" ? "🇬🇧" :
                                                    word.language === "de" ? "🇩🇪" :
                                                        word.language === "fr" ? "🇫🇷" : "🌐"}
                                        </div>
                                        <div className="word-actions">
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDeleteWord(word._id)}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="word-content">
                                        <h3 className="word-original">{word.word}</h3>
                                        {word.translation && (
                                            <p className="word-translation">{word.translation}</p>
                                        )}
                                        {word.definition && (
                                            <p className="word-definition">{word.definition}</p>
                                        )}
                                    </div>
                                    {word.examples && word.examples.length > 0 && (
                                        <div className="word-examples">
                                            <h4>მაგალითები:</h4>
                                            <ul>
                                                {word.examples.map((example, index) => (
                                                    <li key={index}>{example}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    <div className="word-footer">
                                        <span className="word-date">
                                            {new Date(word.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <i className="fas fa-font"></i>
                            <p>თქვენ არ გაქვთ დამატებული სიტყვები</p>
                            <Link to="/add-word" className="add-btn">
                                <i className="fas fa-plus"></i> სიტყვის დამატება
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default MyPage;