import Word from "../models/word.model.js";
import BaWord from "../models/baWord.model.js";
import User from "../models/user.model.js"

export const createWord = async (req, res, next) => {
  // console.log("wordsState", req.body, "newWord");
  // const newWord = new Word({
  //   userId: req.userId,
  //   ...req.body,
  // });
  // console.log("wordsState", req.body, "newWord", newWord);
  // try {
  //   console.log("try1");
  //   const savedWord = await newWord.save();
  //   console.log("try2", savedWord);
  //   res.status(201).json(savedWord);
  //   // console.log("try3", savedWord);
  // } catch (err) {
  //   // console.log("err");
  //   next(err);
  // }
};

// export const getWords = async (req, res, next) => {
//   console.log(req.query.chosenWords, "getWords req");
//   const q = {"anopheles":undefined};
//   const filters = {
//     ...(q && q["anopheles"]),
//     // ...(q._id && { _id: q._id }),
//   };
//   // console.log(filters)
//   try {
//     const videoDatas = await Word.find(q["anopheles"]).sort({ [q.sort]: -1 })

//     res.status(200).send(videoDatas);
//     console.log(videoDatas, "videodatas","word");
//   } catch (err) {
//     next(err);
//   }
// };

export const getWords = async (req, res, next) => {
  // console.log(Object.keys(req.query), req.query, "getWords req");
  const q = { theWord: req.query.wordsToTranslate };
  const lang = req.query.lang;
  const filters = {
    ...(q.theWord && { theWord: q.theWord }),
    // ...(q._id && { _id: q._id }),
  };
  if (Object.keys(req.query) == "userId") {
    // console.log("mopovebuli sityvebis wamoRebaa sawiro")
    const user = await User.findById(req.query.userId);
    // console.log("mopovebuli sityvebis patroni", user)
    const ids = user.collectedWords;
    const p = { _id: ids };

    const filter = {
      ...(p._id && { _id: p._id })
    }
    console.log(user.collectedWords.length, "user",filter)
    try {
      // console.log(p, "მონაცემები", filter, "ტესტი", user, "user")
      const collectedWordsData = await BaWord.find(filter)
      res.status(200).send(collectedWordsData);
      // console.log("მონაცემები",collectedWordsData,"data")
    } catch (err) {
      console.log(err)
    }
  }
  // console.log("filters", filters, "from words", req.query, "test");
  try {
    const videoDatas =
      lang == "ba"
        ? await BaWord.find(filters).sort({ [q.sort]: -1 })
        : await Word.find(filters).sort({ [q.sort]: -1 })

    res.status(200).send(videoDatas);
    // console.log("დასაწყისი", req.query, videoDatas, "videodatas", "word");
  } catch (err) {
    next(err);
  }
};
// export const getVideoData = async (req, res, next) => {
//   console.log("kog");
//   try {
//     const videoData = await VideoData.findById(req.params.id);
//     // console.log("kog",videoData);
//     if (!videoData) next(createError(404, "VideoData not found!"));
//     res.status(200).send(videoData);
//   } catch (err) {
//     next(err);
//   }
// };

// export const getVideoDatas = async (req, res, next) => {
//   const q = req.query;
//   console.log("req", q, "getvideoDatas");
//   // console.log("req", req, "res", res);
//   const filters = {
//     ...(q.userId && { userId: q.userId }),
//     ...(q.cat && { cat: q.cat }),
//     ...((q.min || q.max) && {
//       price: {
//         ...(q.min && { $gt: q.min }),
//         ...(q.max && { $lt: q.max }),
//       },
//     }),
//     ...(q.search && { title: { $regex: q.search, $options: "i" } }),
//   };
//   try {
//     // const gigs = await Gig.find((el)=>{
//     //   console.log(el,"ELEMENT")
//     //   el.userId==q.userId}).sort({ [q.sort]: -1 });
//     const videoDatas = await VideoData.find(filters).sort({ [q.sort]: -1 });
//     // for(let i=0;i<videoDatas.length;i++){
//     //   delete videoDatas[i].shortDesc;
//     //   console.log("works",videoDatas[i].shortDesc)
//     // }
//     res.status(200).send(videoDatas);
//     // console.log(videoDatas,"videodatas",videoDatas["title"]);
//   } catch (err) {
//     next(err);
//   }
// };
