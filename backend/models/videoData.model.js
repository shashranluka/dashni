import mongoose from "mongoose";
const { Schema } = mongoose;

const videoDataSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    shortDesc: {
      type: String,
      required: false,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    // ✅ მარტივი Array - ყველა ტიპის subs-ისთვის
    subs: {
      type: Array,
      required: true,
    },
    features: {
      type: [String],
      required: false,
    },
    metadata: {
      type: Object,
      required: false,
      default: {
        totalSubtitles: 0,
        hasTimestamps: false,
        format: 'unknown',
        processedAt: new Date().toISOString(),
        dataVersion: "2.0"
      }
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("VideoData", videoDataSchema);
