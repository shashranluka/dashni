import Text from "../models/text.model.js";


export const createText = async (req, res, next) => {
  console.log("sentence.controller", req.userId, "dwafdwa", req.body);
  // if (!req.isSeller)
  //   return next(createError(403, "Only sellers can create a gig!"));

  const newText = new Text({
    userId: req.userId,
    ...req.body,
  });
  // console.log("TextState", req.body, "newText", newText);
  try {
    const savedText = await newText.save();
    res.status(201).json(savedText);
  } catch (err) {
    next(err);
  }
};

export const getTexts = async (req, res, next) => {
  const { userId, language, whatIsNeeded } = req.query;
  console.log("getTexts userId", userId, "language", language, "whatIsNeeded", whatIsNeeded);
  
  try {
    let query = {};
    
    // მომხმარებლის ტექსტების დაბრუნება
    if (whatIsNeeded === "userTexts" && userId) {
      query = {
        userId: userId
      };
      
      // თუ ენა მითითებულია, დავამატოთ ენის ფილტრიც
      if (language) {
        query.language = language;
      }
    } 
    // სხვა შემთხვევაში დავაბრუნოთ ყველა ტექსტი (შეიძლება დავამატოთ სხვა პირობებიც)
    else {
      // თუ მხოლოდ ენაა მითითებული
      if (language) {
        query.language = language;
      }
    }
    
    const texts = await Text.find(query);
    res.status(200).json(texts);
  } catch (err) {
    next(err);
  }
};