import mongoose from "mongoose";
const { Schema } = mongoose;

const TextSchema = new Schema(
  {
    itself:"",
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
    },
    desc: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Text", TextSchema);
