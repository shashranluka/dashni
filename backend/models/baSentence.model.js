import mongoose from "mongoose";
const { Schema } = mongoose;

const SentenceSchema = new Schema(
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
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("BaSentence", SentenceSchema);
