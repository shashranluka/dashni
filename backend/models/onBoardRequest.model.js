import mongoose from "mongoose";
const { Schema } = mongoose;

const OnBoardRequestSchema = new Schema(
  {
    classId: {
      type: String,
      // required: true,
    },
    writingRequest: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    access: {
      type: String,
      required: true,
    },
    // desc: {
    //   type: String,
    //   // required: true,
    // },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("OnBoardRequest", OnBoardRequestSchema);
