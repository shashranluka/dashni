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

export const createWord = async (req, res, next) => {
  try {
    const savedWords = [];

    for (let i = 0; i < req.body.length; i++) {
      const language = req.body[i].language;
      // console.log("wordsState", req.body[i], "newWord", language);
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
          Model = SxWord;
      }

      const newWord = new Model({
        userId: req.userId,
        ...req.body[i],
      });

      // console.log("wordsState", req.body[i], "newWord", newWord);

      const savedWord = await newWord.save();
      savedWords.push(savedWord);
      console.log("savedWord", savedWord);
    }

    // მხოლოდ ერთხელ ვაგზავნით პასუხს, ყველა შენახული სიტყვის შემდეგ
    res.status(201).json(savedWords);

  } catch (err) {
    console.error("Error saving words:", err);
    next(err);
  }
};

export const getWords = async (req, res, next) => {
  console.log(req.query, "getWords req");
  const { userId, amount, language, type, privacy, wordsToTranslate, sort, whatIsNeeded } = req.query;
  try {
    console.log("userId", userId, "amount", amount, "language", language, "type", type, "privacy", privacy, "wordsToTranslate", wordsToTranslate, "sort", sort, "whatIsNeeded", whatIsNeeded);

    let Model;
    switch (language) {
      case "ba":
        Model = BaWord;
        break;
      case "ru":
        Model = RuWord;
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

    // თუ მოთხოვნილია მომხმარებლის მიერ დამატებული სიტყვები
    if (userId && whatIsNeeded === "userWords") {
      console.log("Fetching user added words for userId:", userId);

      // ვამოწმებთ მომხმარებლის არსებობას
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      // მოვძებნოთ მხოლოდ მომხმარებლის მიერ დამატებული სიტყვები
      const userAddedWords = await Model.find({
        userId: userId,
        language: language // უზრუნველვყოთ, რომ მხოლოდ მითითებული ენის სიტყვები დაბრუნდეს
      }).sort({ createdAt: -1 }); // ახლიდან ძველისკენ დალაგება

      console.log(`Found ${userAddedWords.length} words added by user`);
      return res.status(200).send(userAddedWords);
    }

    // დანარჩენი ლოგიკა რჩება უცვლელი

    // თუ მოთხოვნილია შემთხვევითი სიტყვების არჩევა
    if (type === "random") {
      const limit = parseInt(amount) || 10;

      let matchFilter = {};
      console.log("matchFilter", matchFilter);
      // შემთხვევითი სიტყვების არჩევისას ვითვალისწინებთ privacy-ს
      if (privacy === "public") {
        // მხოლოდ საჯარო სიტყვები
        matchFilter.isPrivate = false;
      } else if (privacy === "private" && userId) {
        // პირადი სიტყვები (ძველი ლოგიკა, შესაძლოა აღარ დაგჭირდეთ)
        matchFilter.isPrivate = true;
        matchFilter.userId = userId;
      } else if (privacy === "mine" && userId) {
        // მხოლოდ მომხმარებლის დამატებული სიტყვები (როგორც საჯარო, ისე პირადი)
        matchFilter.userId = userId;
      } else if (privacy === "all" && userId) {
        console.log(userId, "all");
        // როგორც მომხმარებლის დამატებული, ისე საჯარო სიტყვები
        matchFilter.$or = [
          { userId: userId },  // მომხმარებლის სიტყვები
          { isPrivate: false }     // საჯარო სიტყვები
        ];
      } else {
        // თუ მომხმარებელი არ არის ავტორიზებული ან სხვა შემთხვევაში, მხოლოდ საჯარო სიტყვები
        matchFilter.isPrivate = false;
      }

      console.log(userId, "userId", "matchFilter", matchFilter);

      const randomWords = await Model.aggregate([
        { $match: matchFilter },
        { $sample: { size: limit } }
      ]);

      return res.status(200).send(randomWords);
    }

    // თუ მოთხოვნილია კონკრეტული მომხმარებლის სიტყვები
    if ("userId" in req.query && !whatIsNeeded) {
      console.log("userId in req.query", userId, Model);  // ლოგავს მომხმარებლის ID-ს
      const user = await User.findById(userId);  // მონაცემთა ბაზიდან იღებს მომხმარებელს მოწოდებული ID-ით
      if (!user) return res.status(404).json({ error: "User not found" });  // თუ მომხმარებელი არ მოიძებნა, აბრუნებს 404 შეცდომას

      const collectedWordsData = await Model.find({  // პოულობს ყველა სიტყვას BaWord მოდელიდან
        _id: { $in: user.collectedWords }  // სადაც _id არის ერთ-ერთი მომხმარებლის შეგროვილი სიტყვებიდან
      });
      console.log("collectedWordsData", collectedWordsData);  // ლოგავს მოძიებულ სიტყვებს
      return res.status(200).send(collectedWordsData);  // აბრუნებს მოძიებულ სიტყვებს 200 სტატუს კოდით
    }


    // თუ მოთხოვნილია სიტყვების თარგმნა
    // const { wordsToTranslate, language, sort } = req.query;  // იღებს მოთხოვნის პარამეტრებს
    const filters = wordsToTranslate ? { word: wordsToTranslate } : {};  // ქმნის ფილტრს, თუ wordsToTranslate არსებობს

    // const Model = language === "ba" ? BaWord : Word;  // ირჩევს მოდელს ენის პარამეტრის მიხედვით (ba=ბაშკირული, სხვა=ქართული)
    const words = await Model.find(filters).sort({ [sort]: -1 });  // ეძებს სიტყვებს შესაბამისი მოდელიდან ფილტრით და ახარისხებს

    return res.status(200).send(words);  // აბრუნებს მოძიებულ სიტყვებს 200 სტატუს კოდით
  } catch (err) {  // იჭერს ნებისმიერ შეცდომას რომელიც try ბლოკში მოხდა
    console.error("Error in getWords:", err);  // ლოგავს შეცდომის შესახებ ინფორმაციას კონსოლში
    next(err);  // შეცდომას გადასცემს შემდეგ შეცდომების დამმუშავებელს
  }
};  // ფუნქციის დასასრული
