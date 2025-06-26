import mongoose from "mongoose";
const { Schema } = mongoose;

const TextSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true, // სათაური სავალდებულოა
    },
    text: {
      type: String,
      required: true, // ტექსტი სავალდებულოა
    },
    translation: {
      type: String,
      required: true, // თარგმანი სავალდებულოა
    },
    additionalInfo: {
      type: String,
      default: "",
    },
    language: {
      type: String,
      required: true,
    },
    // დამატებული ველები
    themes: {
      type: [String], // სტრინგების მასივი
      default: [],
    },
    tags: {
      type: [String], // სტრინგების მასივი
      default: [],
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", ""], // შესაძლო მნიშვნელობები
      default: "",
    },
    isPublic: {
      type: Boolean,
      default: false, // ნაგულისხმევად საჯარო
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Text", TextSchema);
