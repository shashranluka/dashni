import mongoose from "mongoose";
const { Schema } = mongoose;

const ruWordSchema = new Schema(
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
    isPublic: {
      type: Boolean,
      default: false,
    },
    // ძველი ველი TRANSLATION, შევინარჩუნოთ თავსებადობისთვის
    TRANSLATION: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("RuWord", ruWordSchema);
