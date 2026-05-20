import LexiconSearch from "../../components/LexiconSearch/LexiconSearch";
import "./LexiconSearchPage.scss";

function LexiconSearchPage() {
  return (
    <section className="lexicon-search-page">
      <header className="lexicon-search-page__header">
        <h1>ლექსიკონებში ძიება</h1>
        <p>შეიყვანე ტექსტი და ნახე lexicons ცხრილში არსებული ჩანაწერები.</p>
      </header>

      <LexiconSearch />
    </section>
  );
}

export default LexiconSearchPage;
