import mongoose from "mongoose";
const { Schema } = mongoose;

const kaWordSchema = new Schema(
  {
    userId: {
      type: String,
      // required: true,
    },
    word: {
      type: String,
      required: true,
    },
    translation: {
      type: String,
      required: true,
    },
    definition: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      required: true,
    },
    additionalInfo: {
      type: String,
      default: '',
    },
    partOfSpeech: {
      type: String,
      default: '',
    },
    baseForm: {
      type: String,
      default: '',
    },
    baseFormTranslation: {
      type: String,
      default: '',
    },
    usageExamples: {
      type: String,
      default: '',
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("KaWord", kaWordSchema);