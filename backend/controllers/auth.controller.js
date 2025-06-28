import User from "../models/user.model.js";
import createError from "../utils/createError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
  try {
    // პირველ ეტაპზე ვამოწმებთ, ხომ არ არსებობს უკვე ამ იმეილით მომხმარებელი
    const existingUserByEmail = await User.findOne({ email: req.body.email });
    
    // თუ მომხმარებელი უკვე არსებობს, ვაბრუნებთ შეცდომას
    if (existingUserByEmail) {
      return res.status(409).json({
        success: false,
        message: "ამ ელ-ფოსტით მომხმარებელი უკვე არსებობს"
      });
    }
    
    // ასევე შევამოწმოთ მომხმარებლის სახელიც
    const existingUserByUsername = await User.findOne({ username: req.body.username });
    
    // თუ მომხმარებლის სახელი უკვე არსებობს, ვაბრუნებთ შეცდომას
    if (existingUserByUsername) {
      return res.status(409).json({
        success: false,
        message: "ეს მომხმარებლის სახელი უკვე დაკავებულია"
      });
    }
    
    // თუ ყველაფერი წესრიგშია, გავაგრძელოთ რეგისტრაციის პროცესი
    const hash = bcrypt.hashSync(req.body.password, 5);
    const newUser = new User({
      ...req.body,
      password: hash,
    });

    await newUser.save();
    
    // წარმატებული რეგისტრაციის შეტყობინების გაგზავნა
    res.status(201).json({
      success: true,
      message: "მომხმარებელი წარმატებით შეიქმნა"
    });
    
  } catch (err) {
    // შეცდომის დამუშავება
    console.error("რეგისტრაციის შეცდომა:", err);
    
    // თუ შეცდომა მონგოს დუბლიკატის გამო მოხდა (იშვიათია, მაგრამ თუ პირველი შემოწმებები გვერდი აუარა)
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "ეს მომხმარებლის მონაცემები უკვე გამოყენებულია"
      });
    }
    
    // სხვა შემთხვევაში გადავცეთ შეცდომა next მიდლვეარს
    next(err);
  }
};

export const login = async (req, res, next) => {
  console.log("ngvhvgf", req.body.email, req.body.password);
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) return next(createError(404, "User not found!"));

    const isCorrect = bcrypt.compareSync(req.body.password, user.password);
    if (!isCorrect)
      return next(createError(400, "Wrong password or username!"));

    const token = jwt.sign(
      { 
        id: user._id,
        isAdmin: user.isAdmin || false // დარწმუნდით რომ isAdmin ველი არსებობს
      }, 
      process.env.JWT_KEY
    );

    const { password, ...info } = user._doc;
    res
      .cookie("accessToken", token, {
        httpOnly: true,
      })
      .status(200)
      .send(info);
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res) => {
  res
    .clearCookie("accessToken", {
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .send("User has been logged out.");
};
