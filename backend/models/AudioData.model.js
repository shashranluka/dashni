import mongoose from "mongoose";
const AudioDataSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  audioUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model("AudioData", AudioDataSchema);