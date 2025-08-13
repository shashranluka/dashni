import Language from "../models/language.model.js";
import createError from "../utils/createError.js";

// მხოლოდ ბაზისური ინფორმაციის მიღება (კოდები და დასახელებები)
export const getLanguagesBasic = async (req, res, next) => {
  try {
    const languages = await Language.find({ isActive: true })
      .select("code name")
      .sort({ name: 1 });
    
    res.status(200).json(languages);
  } catch (err) {
    next(err);
  }
};

// კონკრეტული ენის სრული დეტალების მიღება
export const getLanguageDetails = async (req, res, next) => {
  try {
    const { code } = req.params;
    
    const language = await Language.findOne({ code, isActive: true });
    
    if (!language) {
      return next(createError(404, "ენა ვერ მოიძებნა"));
    }
    
    res.status(200).json(language);
  } catch (err) {
    next(err);
  }
};

// ენის დამატება (მხოლოდ ადმინისტრატორისთვის)
export const addLanguage = async (req, res, next) => {
  console.log(req.body, "Request body for adding language",req.user);
  try {
    // შევამოწმოთ არის თუ არა ადმინისტრატორი
    if (!req.user.isAdmin) {
      return next(createError(403, "თქვენ არ გაქვთ წვდომა ამ მოქმედების შესასრულებლად"));
    }
    console.log("Adding new language:", req.body);
    // შევამოწმოთ არსებობს თუ არა უკვე ასეთი კოდის ენა
    const existingLanguage = await Language.findOne({ code: req.body.code });
    if (existingLanguage) {
      return next(createError(400, "ამ კოდით ენა უკვე არსებობს"));
    }
    
    const newLanguage = new Language({
      ...req.body
    });
    console.log(newLanguage);
    const savedLanguage = await newLanguage.save();
    res.status(201).json(savedLanguage);
    console.log("New language added:", savedLanguage);
  } catch (err) {
    next(err);
    console.log(err);
  }
};

// ენის განახლება (მხოლოდ ადმინისტრატორისთვის)
export const updateLanguage = async (req, res, next) => {
  try {
    // შევამოწმოთ არის თუ არა ადმინისტრატორი
    if (!req.user.isAdmin) {
      return next(createError(403, "თქვენ არ გაქვთ წვდომა ამ მოქმედების შესასრულებლად"));
    }
    
    const { code } = req.params;
    
    const updatedLanguage = await Language.findOneAndUpdate(
      { code },
      { $set: req.body },
      { new: true }
    );
    
    if (!updatedLanguage) {
      return next(createError(404, "ენა ვერ მოიძებნა"));
    }
    
    res.status(200).json(updatedLanguage);
  } catch (err) {
    next(err);
  }
};

// ენის წაშლა (მხოლოდ ადმინისტრატორისთვის)
export const deleteLanguage = async (req, res, next) => {
  try {
    // შევამოწმოთ არის თუ არა ადმინისტრატორი
    if (!req.user.isAdmin) {
      return next(createError(403, "თქვენ არ გაქვთ წვდომა ამ მოქმედების შესასრულებლად"));
    }
    
    const { code } = req.params;
    
    // ნამდვილი წაშლის ნაცვლად ვაყენებთ isActive = false
    const deletedLanguage = await Language.findOneAndUpdate(
      { code },
      { isActive: false },
      { new: true }
    );
    
    if (!deletedLanguage) {
      return next(createError(404, "ენა ვერ მოიძებნა"));
    }
    
    res.status(200).json({ message: "ენა წარმატებით წაიშალა" });
  } catch (err) {
    next(err);
  }
};

// ყველა ენის მიღება (მხოლოდ ადმინისტრატორისთვის)
export const getAllLanguagesAdmin = async (req, res, next) => {
  try {
    // შევამოწმოთ არის თუ არა ადმინისტრატორი
    if (!req.user.isAdmin) {
      return next(createError(403, "თქვენ არ გაქვთ წვდომა ამ მოქმედების შესასრულებლად"));
    }
    
    const languages = await Language.find().sort({ name: 1 });
    res.status(200).json(languages);
  } catch (err) {
    next(err);
  }
};