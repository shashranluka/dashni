import Sentence from "../models/sentence.model.js";
import LearningClass from "../models/LearningClass.model.js";
import createError from "../utils/createError.js";

export const createLearningClass = async (req, res, next) => {
  // console.log("createGigdwada", req.body);
  if (!req.isSeller)
    return next(createError(403, "Only sellers can create a gig!"));

  const newLearningClass = new LearningClass({
    userId: req.userId,
    ...req.body,
  });
  // console.log(newLearningClass, "new");
  try {
    const savedClass = await newLearningClass.save();
    res.status(201).json(savedClass);
  } catch (err) {
    next(err);
    // console.log(err)
  }
};
export const deleteLearningClass = async (req, res, next) => {
  try {
    const learningClass = await LearningClass.findById(req.params.id);
    // console.log(learningClass.userId, req.userId)
    if (learningClass.userId !== req.userId)
      return next(createError(403, "You can delete only your gig!"));

    await LearningClass.findByIdAndDelete(req.params.id);
    res.status(200).send("Gig has been deleted!");
  } catch (err) {
    next(err);
  }
};
export const getLearningClass = async (req, res, next) => {
  console.log("getLearningClass");
  try {
    const learningClass = await LearningClass.findById(req.params.id);
    const ids = { _id: learningClass.sentences }
    // console.log("kog", ids);
    const filters = {
      ...(ids._id && { _id: ids._id }),
    };
    // const filters = {...(ids._id && { _id: ids._id }),}
    const sentences = await Sentence.find(filters).sort({ [ids.sort]: -1 });
    // console.log("kog",filters,sentences);
    
    if (!learningClass) next(createError(404, "Gig not found!"));
    res.status(200).send([learningClass,sentences]);
  } catch (err) {
    next(err);
  }
};
export const getLearningClasses = async (req, res, next) => {
  // const p= {shortTitle: 'two'};
  // const p= {title: 'one'};
  const q = req.query;
  console.log("dafa", q)
  // const filters = {
  const filters = {
    // ...(p.shortTitle && { shortTitle: p.shortTitle }),
    // ...(p.title && { title: p.title }),
    ...(q.userId && { userId: q.userId }),
    ...(q.cat && { cat: q.cat }),
    ...((q.min || q.max) && {
      price: {
        ...(q.min && { $gt: q.min }),
        ...(q.max && { $lt: q.max }),
      },
    }),
    ...(q.search && { title: { $regex: q.search, $options: "i" } }),
  };
  console.log(filters)

  try {
    // const gigs = await Gig.find((el)=>{
    //   el.userId==q.userId}).sort({ [q.sort]: -1 });
    const LearningClasses = await LearningClass.find(filters).sort({ [q.sort]: -1 });
    res.status(200).send(LearningClasses);
    console.log(LearningClasses)
  } catch (err) {
    next(err);
  }
};

export const updateLearningClass = async (req, res, next) => {
  console.log(req.body, "უპდატე",req.params,"params")
  const classId = req.params.id
  // const nameOfClass = req.body.share.name
  try {
    // console.log(classId, "უპდატე2")

    // ბაზიდან კლასის ინფორმაციის ამოღება
    const learningClass = await LearningClass.findById(classId);

    console.log("უპდატე3",learningClass)
    if (learningClass.userId !== req.body.userId)
      return next(createError(403, "You can delete only your gig!"));
    console.log(learningClass, "dwadwa")

    if(req.body.type=="students"){
      console.log("students")
      
      const updatedResult = await LearningClass.findByIdAndUpdate(
        { _id: classId },
        {
          students: [...new Set([...learningClass.students, ...req.body.students])],
        },
        // {
        //   sentences: [...new Set([...learningClass.sentences, ...req.body.sentences])],
        // },
      );

    }else if(req.body.type=="sentences"){
      console.log("sentences")
      const updatedResult = await LearningClass.findByIdAndUpdate(
        { _id: classId },
        // {
        //   students: [...new Set([...learningClass.students, ...req.body.students])],
        // },
        {
          sentences: [...new Set([...learningClass.sentences, ...req.body.sentences])],
        },
      );
    }

    // 
    // console.log(updatedResult, "updated");
  } catch (err) {
    next(err);
  }
};
