import Word from "../models/word.model.js";
import BaWord from "../models/baWord.model.js";
import RuWord from "../models/ruWord.model.js";
import EnWord from "../models/enWord.model.js";
import KaWord from "../models/kaWord.model.js";
import DeWord from "../models/deWord.model.js";
import EsWord from "../models/esWord.model.js";
import FrWord from "../models/frWord.model.js";
import SxWord from "../models/sxWord.model.js";
import User from "../models/user.model.js";

/**
 * 🏗️ ენის მიხედვით შესაბამისი MongoDB Model-ის შერჩევა
 * @param {string} language - ენის კოდი (ba, en, ka, ru, de, es, fr, sx)
 * @returns {Object} - შესაბამისი Mongoose Model
 */
const getModelByLanguage = (language) => {
  console.log(`🔍 Model-ის შერჩევა ენისთვის: ${language}`);
  
  switch (language) {
    case "ba":
      console.log("📚 BaWord Model შეირჩა");
      return BaWord;
    case "ru":
      console.log("📚 RuWord Model შეირჩა");
      return RuWord;
    case "en":
      console.log("📚 EnWord Model შეირჩა");
      return EnWord;
    case "ka":
      console.log("📚 KaWord Model შეირჩა");
      return KaWord;
    case "de":
      console.log("📚 DeWord Model შეირჩა");
      return DeWord;
    case "es":
      console.log("📚 EsWord Model შეირჩა");
      return EsWord;
    case "fr":
      console.log("📚 FrWord Model შეირჩა");
      return FrWord;
    case "sx":
      console.log("📚 SxWord Model შეირჩა");
      return SxWord;
    default:
      console.log(`⚠️ უცნობი ენა: ${language}, SxWord Model გამოყენება default-ად`);
      return SxWord;
  }
};

export const createWord = async (req, res, next) => {
  console.log("Creating words with data:", req.body, "userId", req.userId);
  const { wordsToAdd, userId } = req.body;
  try {
    const savedWords = [];

    for (let i = 0; i < wordsToAdd.length; i++) {
      const language = wordsToAdd[i].language;
      
      // ✅ Model-ის მიღება ცალკე ფუნქციით
      const Model = getModelByLanguage(language);

      const newWord = new Model({
        userId: userId,
        ...wordsToAdd[i],
      });

      const savedWord = await newWord.save();
      savedWords.push(savedWord);
      console.log("savedWord", savedWord);
    }
    res.status(201).json(savedWords);
  } catch (err) {
    console.error("Error saving words:", err);
    next(err);
  }
};

/**
 * 🔍 სიტყვების თარგმნის ფუნქცია
 * ეძებს მოცემულ სიტყვებს ბაზაში და აბრუნებს მათ თარგმანებს
 */
export const translateWords = async (req, res, next) => {
  console.log("🔍 translateWords ფუნქცია გამოიძახა:", req.query);

  try {
    const { wordsToTranslate, language, sort = "createdAt" } = req.query;

    // ✅ პარამეტრების ვალიდაცია
    if (!wordsToTranslate) {
      console.log("❌ wordsToTranslate პარამეტრი არ არის მოცემული");
      return res.status(400).json({ 
        error: "wordsToTranslate პარამეტრი სავალდებულოა" 
      });
    }

    if (!language) {
      console.log("❌ language პარამეტრი არ არის მოცემული");
      return res.status(400).json({ 
        error: "language პარამეტრი სავალდებულოა" 
      });
    }

    // ✅ Model-ის მიღება ცალკე ფუნქციით
    const Model = getModelByLanguage(language);

    // ✅ wordsToTranslate-ის დამუშავება (array ან string)
    let wordsArray;
    if (Array.isArray(wordsToTranslate)) {
      wordsArray = wordsToTranslate;
    } else if (typeof wordsToTranslate === 'string') {
      try {
        // ✅ JSON parse თუ string array-ია
        wordsArray = JSON.parse(wordsToTranslate);
      } catch (parseError) {
        // ✅ Comma separated string
        wordsArray = wordsToTranslate.split(',').map(word => word.trim());
      }
    } else {
      wordsArray = [wordsToTranslate];
    }

    console.log(`📝 თარგმნის საჭირო სიტყვები (${wordsArray.length}):`, wordsArray);

    // ✅ Test mode - მხოლოდ შემოწმება, თარგმნა არა
    // if (test === "check") {
    //   console.log("🔍 Test mode: მხოლოდ შემოწმება");

    //   // ✅ Case-insensitive ძებნა
    //   const filters = { 
    //     word: { 
    //       $in: wordsArray.map(word => new RegExp(`^${word}$`, 'i')) 
    //     } 
    //   };

    //   const existingWords = await Model.find(filters)
    //     .select('word translation')
    //     .sort({ [sort]: -1 });

    //   console.log(`✅ ნაპოვნია ${existingWords.length} სიტყვა ბაზაში`);
      
    //   return res.status(200).json(existingWords);
    // }

    // ✅ სრული თარგმნის რეჟიმი
    console.log("🔄 სრული თარგმნის რეჟიმი");

    // ✅ ზუსტი დამთხვევების ძებნა (case-insensitive)
    const filters = { 
      word: { 
        $in: wordsArray.map(word => new RegExp(`^${word}$`, 'i')) 
      } 
    };

    const translatedWords = await Model.find(filters)
      .select('word translation isPrivate userId createdAt')
      // .sort({ [sort]: -1 });

    console.log(`📊 თარგმნის შედეგი: ${translatedWords.length}/${wordsArray.length} სიტყვა ნაპოვნია`);

    // ✅ Debug ინფორმაცია
    if (translatedWords.length > 0) {
      console.log("✅ ნაპოვნი სიტყვები:", 
        translatedWords.map(w => `${w.word} → ${w.translation}`).join(', ')
      );
    }

    // ✅ ვერ ნაპოვნი სიტყვების იდენტიფიცირება
    const foundWords = translatedWords.map(w => w.word.toLowerCase());
    const notFoundWords = wordsArray.filter(word => 
      !foundWords.includes(word.toLowerCase())
    );

    if (notFoundWords.length > 0) {
      console.log("❌ ვერ ნაპოვნი სიტყვები:", notFoundWords.join(', '));
    }

    // ✅ შედეგების დაბრუნება
    return res.status(200).json(translatedWords);

  } catch (err) {
    console.error("❌ translateWords შეცდომა:", err);
    next(err);
  }
};

/**
 * 💾 ახალი თარგმანების შენახვის ფუნქცია
 * Frontend-იდან მიღებული ხელით თარგმანების შენახვა
 */
export const saveTranslations = async (req, res, next) => {
  console.log("💾 saveTranslations ფუნქცია გამოიძახა:", req.body);

  try {
    const { translations } = req.body;

    // ✅ ვალიდაცია
    if (!translations || !Array.isArray(translations)) {
      return res.status(400).json({ 
        error: "translations array სავალდებულოა" 
      });
    }

    if (!req.userId) {
      return res.status(401).json({ 
        error: "ავტორიზაცია სავალდებულოა" 
      });
    }

    const savedTranslations = [];
    const errors = [];

    // ✅ ყველა თარგმნის შენახვა
    for (let i = 0; i < translations.length; i++) {
      const { word, translation, language } = translations[i];

      try {
        // ✅ პარამეტრების ვალიდაცია
        if (!word || !translation || !language) {
          errors.push(`თარგმანი ${i + 1}: word, translation და language სავალდებულოა`);
          continue;
        }

        // ✅ Model-ის მიღება ცალკე ფუნქციით
        const Model = getModelByLanguage(language);

        // ✅ უკვე არსებობს თუ არა შემოწმება
        const existingWord = await Model.findOne({ 
          word: new RegExp(`^${word}$`, 'i') 
        });

        if (existingWord) {
          console.log(`⚠️ სიტყვა "${word}" უკვე არსებობს, გამოტოვება`);
          continue;
        }

        // ✅ ახალი სიტყვის შექმნა
        const newWord = new Model({
          userId: req.userId,
          word: word.trim(),
          translation: translation.trim(),
          language: language,
          isPrivate: false, // Default public
        });

        const savedWord = await newWord.save();
        savedTranslations.push(savedWord);
        
        console.log(`✅ შეინახა: ${word} → ${translation}`);

      } catch (saveError) {
        console.error(`❌ შენახვის შეცდომა სიტყვისთვის "${word}":`, saveError);
        errors.push(`სიტყვა "${word}": ${saveError.message}`);
      }
    }

    // ✅ შედეგების დაბრუნება
    const result = {
      success: true,
      savedCount: savedTranslations.length,
      totalCount: translations.length,
      savedTranslations: savedTranslations,
    };

    if (errors.length > 0) {
      result.errors = errors;
      result.hasErrors = true;
    }

    console.log(`🎉 შენახვა დასრულდა: ${savedTranslations.length}/${translations.length} წარმატებით`);

    return res.status(201).json(result);

  } catch (err) {
    console.error("❌ saveTranslations შეცდომა:", err);
    next(err);
  }
};

/**
 * 📋 სიტყვების მიღების ფუნქცია
 * ფილტრებით და სხვადასხვა პარამეტრებით სიტყვების დაბრუნება
 */
export const getWords = async (req, res, next) => {
  console.log(req.query, "getWords req");
  const { userId, amount, language, type, privacy, sort, whatIsNeeded } = req.query;
  
  try {
    console.log("userId", userId, "amount", amount, "language", language, "type", type, "privacy", privacy, "sort", sort, "whatIsNeeded", whatIsNeeded);

    // ✅ Model-ის მიღება ცალკე ფუნქციით (default Word-ით)
    const Model = language ? getModelByLanguage(language) : Word;

    // ✅ თუ მოთხოვნილია მომხმარებლის მიერ დამატებული სიტყვები
    if (userId && whatIsNeeded === "userWords") {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      const userAddedWords = await Model.find({
        userId: userId,
        language: language
      }).sort({ createdAt: -1 });

      console.log(`Found ${userAddedWords.length} words added by user`);
      return res.status(200).send(userAddedWords);
    }

    // ✅ თუ მოთხოვნილია შემთხვევითი სიტყვების არჩევა
    if (type === "random") {
      const limit = parseInt(amount) || 10;

      let matchFilter = {};
      if (privacy === "public") {
        matchFilter.isPrivate = false;
      } else if (privacy === "private" && userId) {
        matchFilter.isPrivate = true;
        matchFilter.userId = userId;
      } else if (privacy === "mine" && userId) {
        matchFilter.userId = userId;
      } else if (privacy === "all" && userId) {
        matchFilter.$or = [
          { userId: userId },
          { isPrivate: false }
        ];
      } else {
        matchFilter.isPrivate = false;
      }

      const randomWords = await Model.aggregate([
        { $match: matchFilter },
        { $sample: { size: limit } }
      ]);

      return res.status(200).send(randomWords);
    }

    // ✅ თუ მოთხოვნილია კონკრეტული მომხმარებლის სიტყვები
    if ("userId" in req.query && !whatIsNeeded) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      const collectedWordsData = await Model.find({
        _id: { $in: user.collectedWords }
      });
      return res.status(200).send(collectedWordsData);
    }

    // ✅ Default case - ყველა სიტყვის დაბრუნება სორტირებით
    const allWords = await Model.find({}).sort({ [sort || 'createdAt']: -1 });
    return res.status(200).send(allWords);

  } catch (err) {
    console.error("Error in getWords:", err);
    next(err);
  }
};
