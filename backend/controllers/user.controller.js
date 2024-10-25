import User from "../models/user.model.js";
import createError from "../utils/createError.js";

export const deleteUser = async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (req.userId !== user._id.toString()) {
    return next(createError(403, "You can delete only your account!"));
  }
  await User.findByIdAndDelete(req.params.id);
  res.status(200).send("deleted.");
};
export const getUser = async (req, res, next) => {
  const user = await User.findById(req.params.id);

  res.status(200).send(user);
};
export const getUsers = async (req, res, next) => {
  console.log("get Users");
};
export const updateUser = async (req, res, next) => {
  console.log("update User",req.params,req.body);
  const userId = req.params.id;
  const student = await User.findById(userId);
  
  try {
    console.log("update User2",student._id==userId);

    const updated = await User.findByIdAndUpdate(
      { _id: userId },
      {collectedWords: req.body},
    );
  console.log("update User3",updated);

  } catch (error) {
    next(error)
  }

}