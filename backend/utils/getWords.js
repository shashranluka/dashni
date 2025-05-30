import BaWord from "../models/baWord.model.js";
import EnWord from "../models/enWord.model.js";
import KaWord from "../models/kaWord.model.js";
import DeWord from "../models/deWord.model.js";
import EsWord from "../models/esWord.model.js";
import FrWord from "../models/frWord.model.js";
import SxWord from "../models/sxWord.model.js";
import Word from "../models/word.model.js";  // Import the base Word model
export const getWordsBy = async (language, words) =>{
    let Model;
    switch (language) {
        case "ba":
        Model = BaWord;
        break;
        case "en":
        Model = EnWord;
        break;
        case "ka":
        Model = KaWord;
        break;
        case "de":
        Model = DeWord;
        break;
        case "es":
        Model = EsWord;
        break;
        case "fr":
        Model = FrWord;
        break;
        case "sx":
        Model = SxWord;
        break;
        default:
        Model = Word;
    }
    
    const filters = words ? { word: words } : {};  // ქმნის ფილტრს, თუ wordsToTranslate არსებობს

    // const Model = language === "ba" ? BaWord : Word;  // ირჩევს მოდელს ენის პარამეტრის მიხედვით (ba=ბაშკირული, სხვა=ქართული)
    const wordsFromDB = await Model.find(filters);  // ეძებს სიტყვებს შესაბამისი მოდელიდან ფილტრით და ახარისხებს
    return wordsFromDB;  // აბრუნებს მოძებნილ სიტყვებს
}