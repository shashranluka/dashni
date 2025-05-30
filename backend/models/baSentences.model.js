import mongoose from "mongoose";
const { Schema } = mongoose;

const BaSentenceSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    sentence: {
      type: String,
      // required: true,
    },
    translation: {
      type: String,
      // required: true,
    },
    picture: {
      type: String,
      // default: 0,
    },
    theme: {
      type: String,
      // required: true,
    },
    language: {
      type: String,
      default: "ba",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Sentence", BaSentenceSchema);