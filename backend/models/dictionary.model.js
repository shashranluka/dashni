import mongoose from "mongoose";
const { Schema } = mongoose;

const dictionarySchema = new Schema(
  {
    // userId: {
    //   type: String,
    //   // required: true,
    // },
    // word: {
    //   type: String,
    //   required: true,
    // },
    // translation: {
    //   type: String,
    //   required: true,
    // },
    // desc: {
    //   type: String,
    //   // required: true,
    // },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Dictionary", dictionarySchema);
