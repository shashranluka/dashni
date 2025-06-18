import Sentence from "../models/sentence.model.js";
import BaSentence from "../models/baSentence.model.js";
import createError from "../utils/createError.js";
import { getWordsBy } from "../utils/getWords.js"; // Assuming this is the correct path to the utility function
// import { getWords } from "./word.controller.js";

export const createSentence = async (req, res, next) => {
  // console.log("sentence.controller", req.userId, "dwafdwa", req.body);
  // if (!req.isSeller)
  //   return next(createError(403, "Only sellers can create a gig!"));

  const newSentence = new Sentence({
    userId: req.userId,
    ...req.body,
  });
  // console.log("SentenceState", req.body, "newWord", newSentence);
  try {
    const savedSentence = await newSentence.save();
    res.status(201).json(savedSentence);
  } catch (err) {
    next(err);
  }
};

// export const createWords = async (req, res, next) => {
//   console.log("sentence.controller", req.userId, "dwafdwa", req.body);
//   // if (!req.isSeller)
//   //   return next(createError(403, "Only sellers can create a gig!"));
// };
export const deleteSentence = async (req, res, next) => {
  try {
    const sentence = await Sentence.findById(req.params.id);
    console.log(req.params, "sentence", sentence, "/////////", sentence.userId, "     ", req.userId)
    if (sentence.userId !== req.userId)
      return next(createError(403, "You can delete only your gig!"));

    await Sentence.findByIdAndDelete(req.params.id);
    res.status(200).send("Gig has been deleted!");
  } catch (err) {
    next(err);
  }
};
export const getSentence = async (req, res, next) => {
  try {
    const sentence = await Sentence.findById(req.params.id);
    if (!sentence) next(createError(404, "Gig not found!"));
    res.status(200).send(sentence);
  } catch (err) {
    next(err);
  }
};
export const getSentences = async (req, res, next) => {
  const { language, whatData, amount, withPictures, source, themes, userId } = req.query;
  console.log("hello from getSentences", language, whatData, req.query);

  try {
    let Model;
    switch (language) {
      case "ba":
        Model = BaSentence;
        break;
      // case "ge":
      //   Model = Sentence;
      //   break;
      // case "en":
      //   Model = EnSentence;
      //   break;
      // default:
      //   Model = Sentence; // Default to BaSentence if no language is specified
    }

    // თუ მოთხოვნილია ენის წინადადებების შესახებ სტატისტიკა
    if (whatData === "languageDataInfo") {
      // საერთო რაოდენობა - ენა უკვე შერჩეულია მოდელით
      const totalCount = await Model.countDocuments();
      console.log("totalCount", totalCount);

      // სურათიანი წინადადებების რაოდენობა
      const withPicturesCount = await Model.countDocuments({
        picture: { $exists: true, $ne: "" }
      });
      console.log("withPicturesCount", withPicturesCount);
      // მომხმარებლის წინადადებების რაოდენობა
      const userCount = userId ?
        await Model.countDocuments({ userId: userId }) : 0;
      console.log("userCount", userCount);
      // საჯარო წინადადებები
      const publicCount = await Model.countDocuments({ isPublic: true });
      console.log("publicCount", publicCount);
      // თემების სტატისტიკა
      const themes = await Model.aggregate([
        {
          $group: {
            _id: "$theme",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);
      console.log("themes", themes);
      // თემების სტატისტიკის გარდაქმნა
      const themeStats = {};
      themes.forEach(theme => {
        if (theme._id) { // null თემების გამორიცხვა
          themeStats[theme._id] = theme.count;
        }
      });
      console.log("themeStats", themeStats);
      // დაბრუნება სტატისტიკის ობიექტით
      return res.status(200).json({
        totalCount,
        withPicturesCount,
        userCount,
        publicCount,
        themeStats
      });
    }
    // თამაშისთვის წინადადებების არჩევა სპეციალური პარამეტრებით
    else if (whatData === "sentencesForGame") {
      // console.log("Fetching sentences for game with params:", { 
      //   amount, withPictures, source, themes 
      // });

      // ძირითადი ფილტრები
      const baseFilters = {};

      // წყაროს ფილტრაცია
      if (source === "user" && userId) {
        baseFilters.userId = userId;
      } else if (source === "public") {
        baseFilters.isPublic = true;
      }

      // თემების ფილტრაცია
      // ბექენდი
      if (themes && themes.trim() !== '') {
        const themesList = themes.split("|");
        if (themesList.length > 0) {
          baseFilters.theme = { $in: themesList };
        }
      }
      // if (themes) {
      //   const themesList = themes.split(",");
      // }
      // if (themes.length > 0) {
      //   baseFilters.theme = { $in: themes };
      // }

      // პარამეტრების ნორმალიზება
      const sentencesAmount = parseInt(amount) || 5;
      const picturesAmount = parseInt(withPictures) || 0;
      const regularAmount = sentencesAmount - picturesAmount;

      let resultSentences = [];

      // სურათიანი წინადადებების მოძიება (თუ საჭიროა)
      if (picturesAmount > 0) {
        const pictureFilters = {
          ...baseFilters,
          picture: { $exists: true, $ne: "" }
        };

        const withPicturesSentences = await Model.aggregate([
          { $match: pictureFilters },
          { $sample: { size: picturesAmount } }
        ]);

        resultSentences = [...resultSentences, ...withPicturesSentences];
      }

      // წინადადებების მოძიება სურათის გარეშე (თუ საჭიროა)
      if (regularAmount > 0) {
        const noPictureFilters = {
          ...baseFilters
        };

        if (picturesAmount > 0) {
          // თუ უკვე ავიღეთ სურათიანი წინადადებები, 
          // მოვძებნოთ ან ცარიელი სურათით ან სურათის გარეშე
          noPictureFilters.$or = [
            { picture: { $exists: false } },
            { picture: "" }
          ];
        }

        const regularSentences = await Model.aggregate([
          { $match: noPictureFilters },
          { $sample: { size: regularAmount } }
        ]);

        resultSentences = [...resultSentences, ...regularSentences];
      }

      // შედეგების შემთხვევით გადანაწილება
      resultSentences = resultSentences
        .sort(() => Math.random() - 0.5);
      const wordsToTranslate = resultSentences
        .map(sentence => sentence.sentence)
        .join(" ")
        .toLowerCase()
        .replace(/[,."()?:]/g, "")
        .split(" ")
        .filter(word => word.trim() !== "");
      console.log("wordsToTranslate", wordsToTranslate);
      const translatedWords = await getWordsBy(language, wordsToTranslate);
      console.log("transaledWords", translatedWords);
      console.log(`Returning ${resultSentences.length} sentences with ${translatedWords.length} words for game`);
      console.log("resultSentences", resultSentences, "translatedWords", translatedWords);
      return res.status(200).json({resultSentences, translatedWords});
    }
    else {
      // სტანდარტული მოთხოვნა წინადადებებისთვის
      const filters = {};

      // დამატებითი ფილტრები
      if (whatData === "userOnly" && userId) {
        filters.userId = userId;
      } else if (whatData === "public") {
        filters.isPublic = true;
      }

      // სხვა ფილტრები
      if (req.query.search) {
        filters.sentence = { $regex: req.query.search, $options: "i" };
      }

      const sentences = await Model.find(filters);
      res.status(200).send(sentences);
    }
  } catch (err) {
    next(err);
  }
};
