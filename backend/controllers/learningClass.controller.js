import Sentence from "../models/sentence.model.js";
import LearningClass from "../models/learningClass.model.js";
import OnBoardRequest from "../models/onBoardRequest.model.js"
import createError from "../utils/createError.js";
import User from "../models/user.model.js";
import { createOnBoardRequest,updateClassText } from "./onBoardRequest.controller.js";
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
    const classId = learningClass.classId;
    const filters = {
      ...(ids._id && { _id: ids._id }),
    };
    const sentences = await Sentence.find(filters).sort({ [ids.sort]: -1 });
    const requestFilters = {
      classId: req.params.id,
    };
    console.log("requests")
    const requests = await OnBoardRequest.find(requestFilters)
    console.log("requests", requests)
    if (!learningClass) next(createError(404, "Gig not found!"));
    res.status(200).send({ learningClass, sentences, requests });
  } catch (err) {
    next(err);
  }
};
export const getLearningClasses = async (req, res, next) => {
  const q = req.query;
  const filters = {
    ...(q.type == "student" && { students: { $all: [q.userId] } }),
    ...(q.type != "student" && { userId: q.userId }),
  };
  try {
    const LearningClasses = await LearningClass.find(filters).sort({ [q.sort]: -1 });
    res.status(200).send(LearningClasses);
  } catch (err) {
    next(err);
  }
};

export const updateLearningClass = async (req, res, next) => {
  const classId = req.params.id;
  const { writingRequest, userId, userName, acceptedTexts} = req.body;
  // console.log(classId, req.body, writingRequest);
  try {
    // console.log("try")
    const learningClass = await LearningClass.findById(classId);
    if (learningClass.userId != req.body.userId) {
      return next(createError(403, "You can't update this class!"));
    }
    // console.log("try",learningClass)
    if (req.body.type == "requestOnBoard") {
      // const writingRequest = req.body.writingRequest;
      console.log("type:request")
      createOnBoardRequest(classId, writingRequest, userId, userName, res, next)
    }

    // const namesObject = {}
      if (req.body.type == "students") {
        const names = req.body.students;
        const q = { username: names };
        const filters = {
          ...(q.username && { username: q.username }),
        };
        const studentsInfo = await User.find(filters)
        // console.log("students",names,studentsInfo)
        // for (var i = 0; i < studentsInfo.length; i++) {
        //   const student = await User.findById(studentsInfo[i]._id.toHexString());
        //   const studentId = studentsInfo[i]._id.toHexString()
        //   // const updatedStudentsInfo = User.findByIdAndUpdate(
        //   //   { _id: studentId },
        //   //   { classes: [...new Set([...studentsInfo[i].classes, classId])] }
        //   // )
        //   // console.log("update user",updatedStudentsInfo)
        // }
        const studentsIds = studentsInfo.map((userInfo, index) => userInfo._id.toHexString())
        const updatedClassResult = await LearningClass.findByIdAndUpdate(
          { _id: classId },
          {
            students: [...new Set([...learningClass.students,
            ...studentsIds])],
          },
        );
        console.log("updated",updatedClassResult)

      } else if (req.body.type == "sentences") {
        console.log("sentences")
        const updatedResult = await LearningClass.findByIdAndUpdate(
          { _id: classId },
          {
            sentences: [...new Set([...learningClass.sentences, ...req.body.sentences])],
          },
        );
      }
    console.log("end")
    if (req.body.type == "acceptOnBoardRequest") {
      console.log("type:accept")
      updateClassText(classId, userId, acceptedTexts, res, next)
    }
  } catch (err) {
    console.log("catch", err)

    next(err);
  }
};
