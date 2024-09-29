import Sentence from "../models/sentence.model.js";
import LearningClass from "../models/LearningClass.model.js";
import createError from "../utils/createError.js";
import User from "../models/user.model.js";
// import { getUsers, updateUser } from "./user.controller.js";

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
  try {
    const learningClass = await LearningClass.findById(req.params.id);
    const ids = { _id: learningClass.sentences }
    const filters = {
      ...(ids._id && { _id: ids._id }),
    };
    const sentences = await Sentence.find(filters).sort({ [ids.sort]: -1 });

    if (!learningClass) next(createError(404, "Gig not found!"));
    res.status(200).send([learningClass, sentences]);
  } catch (err) {
    next(err);
  }
};
export const getLearningClasses = async (req, res, next) => {
  const q = req.query;
  const filters = {
    ...(q.type=="student" && {students: { $all: [q.userId] }}),
    ...(q.type!="student" && { userId: q.userId }),
  };
  try {
    const LearningClasses = await LearningClass.find(filters).sort({ [q.sort]: -1 });
    res.status(200).send(LearningClasses);
  } catch (err) {
    next(err);
  }
};

export const updateLearningClass = async (req, res, next) => {
  const classId = req.params.id
  // console.log(req.body, "უპდატე", req.params, "params", classId)
  // const nameOfClass = req.body.share.name
  try {
    // console.log(classId, "უპდატე2")

    // ბაზიდან კლასის ინფორმაციის ამოღება
    const learningClass = await LearningClass.findById(classId);

    // console.log("უპდატე3", learningClass._id == learningClass._id)
    if (learningClass.userId !== req.body.userId)
      return next(createError(403, "You can delete only your gig!"));
    // console.log(learningClass, "dwadwa")
    const names = {}
    if (req.body.type == "students") {
      // console.log("დასაწყისი", req.body, "body", req.params, "params")
      // console.log("dafa", q)
      // const filters = {
      const names = req.body.students;
      // console.log("dafa", names, "query", req.query)

      const q = { username: names };

      const filters = {
        ...(q.username && { username: q.username }),
      };

      const studentsInfo = await User.find(filters)
      for (var i = 0; i < studentsInfo.length; i++) {
        // console.log(studentsInfo[i], "ინფო")
        const student = await User.findById(studentsInfo[i]._id.toHexString());
        const studentId = studentsInfo[i]._id.toHexString()

        // console.log(student, "student", [...new Set([...studentsInfo[i].classes, classId])], studentId, classId, "class")
        const updatedStudentsInfo = User.findByIdAndUpdate(
          { _id: studentId },
          { classes: [...new Set([...studentsInfo[i].classes, classId])] }
        )
        // console.log(studentsInfo[i], "სდწადაწლმ,", updatedStudentsInfo, "updated students")
      }
      const studentsIds = studentsInfo.map((userInfo, index) => userInfo._id.toHexString())
      // console.log([...new Set([...learningClass.students, ...studentsIds])], "set")
      const updatedClassResult = await LearningClass.findByIdAndUpdate(
        { _id: classId },
        {
          students: [...new Set([...learningClass.students,
          ...studentsIds])],
        },
        // {
        //   sentences: [...new Set([...learningClass.sentences, ...req.body.sentences])],
        // },
      );
      // console.log(updatedClassResult, "updated", names, "names")
      // console.log(q,"ქიუ", filters, "filters", studentsIds, "ids")

    } else if (req.body.type == "sentences") {
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
