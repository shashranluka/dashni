import Sentence from "../models/sentence.model.js";
import createError from "../utils/createError.js";

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
    console.log(req.params, "sentence",sentence,"/////////",sentence.userId, "     ", req.userId)
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
  const q = req.query;
  const ids = {_id: req.query.Ids}
  console.log("hello from getSentences");
  const filters = {
    ...(ids._id && { _id: ids._id }),
    ...(q.userId && { userId: q.userId }),
    ...(q.cat && { cat: q.cat }),
    // ...((q.min || q.max) && {
    //   price: {
    //     ...(q.min && { $gt: q.min }),
    //     ...(q.max && { $lt: q.max }),
    //   },
    // }),
    ...(q.search && { title: { $regex: q.search, $options: "i" } }),
  };
  // console.log(filters,"filters")
  try {
    const sentences = await Sentence.find(filters).sort({ [q.sort]: -1 });
    res.status(200).send(sentences);
    // console.log("getSentences", sentences, "getSentences");
  } catch (err) {
    next(err);
  }
};
