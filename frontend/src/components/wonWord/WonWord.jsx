import "./WonWord.scss";
export default function WonWord({ wonWord, setIsFixedVisible }) {
    console.log("WonWord component props:", { wonWord, setIsFixedVisible });
    console.log("WonWord component rendered with wonWord:", wonWord);
    return (
        <div className="wonWord">
            <div className="wonWordCard">
                <div className="wonWordText">
                    <span className="wonWordTitle">{wonWord.translation}</span>
                    <div className="letters">
                        {wonWord.word && wonWord.word.split('').map((letter, index) => (
                            <div key={index} className="letter-card">
                                {letter}
                            </div>
                        ))}
                    </div>
                    {/* <span className="wonWordContent">სიტყვა შენახულია</span> */}
                </div>
            </div>
        </div>
    );
}