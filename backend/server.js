import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoute from "./routes/user.route.js";
import gigRoute from "./routes/gig.route.js";
import classRoute from "./routes/class.route.js";
import textRoute from "./routes/text.route.js";
import videoDataRoute from "./routes/videoData.route.js";
import audioDataRoute from "./routes/audioData.route.js";
import sentenceRoute from "./routes/sentence.route.js";
import languageRoute from "./routes/language.route.js";
import wordRoute from "./routes/word.route.js";
// import textRoute from "./routes/text.route.js";
import orderRoute from "./routes/order.route.js";
import conversationRoute from "./routes/conversation.route.js";
import messageRoute from "./routes/message.route.js";
import reviewRoute from "./routes/review.route.js";
// import translationRoute from "./routes/translation.route.js";
import authRoute from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
dotenv.config();
mongoose.set("strictQuery", true);

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to mongoDB!");
  } catch (error) {
    console.log(error);
  }
};


// console.log(process.env,process.env.ONLINE?"trueeee":"falseeee")
app.use(cors({ origin: process.env.HOST, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/gigs", gigRoute);
app.use("/api/videodatas", videoDataRoute);
app.use('/api/audiodatas', audioDataRoute);
app.use("/api/sentences", sentenceRoute);
app.use("/api/classes", classRoute);
app.use("/api/words", wordRoute);
app.use("/api/texts", textRoute);
app.use("/api/languages", languageRoute);
app.use("/api/orders", orderRoute);
app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);
app.use("/api/reviews", reviewRoute);
// app.use("/api/translation", translationRoute);

app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";
  // console.log(err,"err from sentences", errorMessage, "err from sentences");
  return res.status(errorStatus).send(errorMessage);
});

app.listen(8800, () => {
  connect();
  console.log("Backend server is running!");
});
