import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    classes: {
      type: Array,
      unique:true,
    },
    phone: {
      type: String,
      // required: false,
    },
    desc: {
      type: String,
      // required: false,
    },
    isSeller: {
      type: Boolean,
      // default: false,
    },
    collectedWords: {
      type: Array
    },
    // // img: {
    // //   type: String,
    // //   // required: false,
    // // },
    // country: {
    //   type: String,
    //   // required: true,
    // },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
