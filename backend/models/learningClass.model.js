import mongoose from "mongoose";
const { Schema } = mongoose;

const LearningClassSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    students: {
      type: Array,
      // required: true,
    },
    sentences: {
      type: Array,
      // required: true,
    },
    desc: {
      type: String,
      // required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("LearningClass", LearningClassSchema);
