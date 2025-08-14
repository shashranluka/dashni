import VideoData from "../models/videoData.model.js";
import createError from "../utils/createError.js";

export const createVideoData = async (req, res, next) => {
  // ✅ Raw სუბტიტრების მონაცემების მიღება
  const rawData = req.body.subs.split("\n").filter(line => line.trim() !== "");
  console.log("📝 Raw სუბტიტრების მონაცემები:", rawData, "ხაზების რაოდენობა:", rawData.length);

  const subs = [];
  let sequentialIndex = 0;

  // ✅ Timestamp ფორმატის ამოცნობა
  const isTimestamp = (str) => {
    const timePatterns = [
      /^\d{1,2}:\d{2}$/,        // M:SS ან MM:SS
      /^\d{1,2}:\d{2}:\d{2}$/,  // H:MM:SS
      /^\d+:\d{2}$/,            // MM:SS (მოქნილი წუთები)
    ];
    return timePatterns.some(pattern => pattern.test(str.trim()));
  };

  // ✅ დროის კონვერტაცია წამებში
  const convertTimeToSeconds = (timeString) => {
    const timeParts = timeString.trim().split(":");
    let seconds = 0;

    for (let j = 0; j < timeParts.length; j++) {
      const power = timeParts.length - 1 - j;
      const timeValue = parseInt(timeParts[j], 10);
      
      if (isNaN(timeValue)) {
        console.warn(`⚠️ არავალიდური time part: ${timeParts[j]}`);
        continue;
      }
      
      seconds += timeValue * (60 ** power);
    }

    return seconds;
  };

  // ✅ ტექსტის გასუფთავება
  const cleanText = (text) => {
    return text
      .replace(/^\[.*?\]\s*/, '')     // [Music], [Intro] ტეგები
      .replace(/^\(.*?\)\s*/, '')     // (Background music) ტეგები
      .replace(/\s+/g, ' ')           // მრავალი space → ერთი space
      .trim();
  };

  // ✅ ფორმატის ამოცნობა
  const hasTimestamps = rawData.some(line => isTimestamp(line));
  
  console.log(`🔍 ფორმატი: ${hasTimestamps ? 'Timestamp-იანი' : 'Sequential index'}`);

  if (hasTimestamps) {
    // ✅ ===== TIMESTAMP-იანი ფორმატის დამუშავება =====
    console.log("⏰ Timestamp-იანი ფორმატის დამუშავება...");
    
    for (let i = 0; i < rawData.length; i++) {
      const currentLine = rawData[i].trim();
      
      if (isTimestamp(currentLine)) {
        const timeInSeconds = convertTimeToSeconds(currentLine);
        let textContent = "";
        
        let j = i + 1;
        while (j < rawData.length && !isTimestamp(rawData[j])) {
          const textLine = rawData[j].trim();
          if (textLine) {
            textContent += (textContent ? " " : "") + textLine;
          }
          j++;
        }
        
        const cleanedText = cleanText(textContent);
        
        if (cleanedText) {
          const lineData = {
            time: timeInSeconds, // ✅ რეალური timestamp წამებში
            line: cleanedText,
            isTimestamp: true, // ✅ მარკერი timestamps-ისთვის
          };
          subs.push(lineData);
          console.log(`📄 ${currentLine} → ${timeInSeconds}s: "${cleanedText}"`);
        }
        
        i = j - 1;
      }
    }
    
  } else {
    // ✅ ===== SEQUENTIAL ფორმატის დამუშავება =====
    console.log("📝 Sequential index ფორმატის დამუშავება...");
    
    for (let i = 0; i < rawData.length; i++) {
      const line = rawData[i].trim();
      
      if (!line) continue;
      
      const cleanedText = cleanText(line);
      
      if (cleanedText) {
        const lineData = {
          time: sequentialIndex, // ✅ Sequential index (0, 1, 2...)
          line: cleanedText,
          isTimestamp: false, // ✅ მარკერი sequential-ისთვის
        };
        subs.push(lineData);
        console.log(`📄 Index ${sequentialIndex}: "${cleanedText}"`);
        sequentialIndex++;
      }
    }
  }

  console.log(`✅ დამუშავება დასრულებულია. სულ: ${subs.length} ჩანაწერი`);

  // ✅ Metadata-ს შექმნა
  const metadata = {
    totalSubtitles: subs.length,
    hasTimestamps: hasTimestamps,
    format: hasTimestamps ? 'timed' : 'sequential',
    maxTime: hasTimestamps 
      ? Math.max(...subs.map(s => s.time)) 
      : subs.length - 1,
    minTime: hasTimestamps 
      ? Math.min(...subs.map(s => s.time)) 
      : 0,
    averageLineLength: subs.length > 0 
      ? Math.round(subs.reduce((sum, sub) => sum + sub.line.length, 0) / subs.length)
      : 0,
    totalCharacters: subs.reduce((sum, sub) => sum + sub.line.length, 0),
    processedAt: new Date().toISOString(),
    dataVersion: "2.0",
  };

  console.log("📊 გენერირებული Metadata:", metadata);

  // ✅ ვიდეოს მონაცემების შექმნა
  const processedData = {
    userId: req.userId,
    ...req.body,
    subs: subs,
    metadata: metadata,
  };

  const newVideoData = new VideoData(processedData);

  try {
    const savedVideoData = await newVideoData.save();
    res.status(201).json(savedVideoData);
    console.log("🎉 ვიდეოს მონაცემები წარმატებით შეინახა!");
  } catch (err) {
    console.error("❌ შენახვის შეცდომა:", err);
    next(err);
  }
};

// ✅ დანარჩენი ფუნქციები უცვლელია...
export const deleteVideoData = async (req, res, next) => {
  try {
    const videoData = await VideoData.findById(req.params.id);
    if (videoData.userId !== req.userId)
      return next(createError(403, "You can delete only your VideoData!"));

    await VideoData.findByIdAndDelete(req.params.id);
    res.status(200).send("VideoData has been deleted!");
  } catch (err) {
    next(err);
  }
};

export const getVideoData = async (req, res, next) => {
  console.log("📖 ვიდეოს მონაცემების მოთხოვნა...");
  try {
    const videoData = await VideoData.findById(req.params.id);
    if (!videoData) next(createError(404, "VideoData not found!"));
    res.status(200).send(videoData);
    console.log("✅ ვიდეოს მონაცემები გაიგზავნა");
  } catch (err) {
    next(err);
  }
};

export const getVideoDatas = async (req, res, next) => {
  const q = req.query;
  console.log("📋 ვიდეოების სიის მოთხოვნა:", q);

  const filters = {
    ...(q.userId && { userId: q.userId }),
    ...(q.cat && { cat: q.cat }),
    ...((q.min || q.max) && {
      price: {
        ...(q.min && { $gt: q.min }),
        ...(q.max && { $lt: q.max }),
      },
    }),
    ...(q.search && { title: { $regex: q.search, $options: "i" } }),
  };

  try {
    const videoDatas = await VideoData.find(filters).sort({ [q.sort]: -1 });
    res.status(200).send(videoDatas);
    console.log(`✅ ${videoDatas.length} ვიდეო გაიგზავნა`);
  } catch (err) {
    next(err);
  }
};
