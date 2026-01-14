import AudioData from "../models/AudioData.model.js";
import { uploadAudioToGCS } from "../utils/cloudStorage.js";

export const createAudioData = async (req, res) => {
    console.log(req.body,"1");
  try {
    const { title, description } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ message: "აუდიო ფაილი აუცილებელია" });
    console.log(req.body,"2");

    const audioUrl = await uploadAudioToGCS(file.buffer, file.originalname, file.mimetype);
    console.log(req.body,"3");

    const audioData = await AudioData.create({
      title,
      description,
      audioUrl,
      createdAt: new Date()
    });

    res.status(201).json(audioData);
  } catch (err) {
    res.status(500).json({ message: "შეცდომა ატვირთვისას", error: err.message });
  }
};

export const deleteAudioData = async (req, res) => {
  try {
    const { id } = req.params;
    await AudioData.findByIdAndDelete(id);
    res.status(200).json({ message: "აუდიო ჩანაწერი წაიშალა" });
  } catch (err) {
    res.status(500).json({ message: "წაშლის შეცდომა", error: err.message });
  }
};

export const getAudioData = async (req, res) => {
  try {
    const { id } = req.params;
    const audioData = await AudioData.findById(id);
    if (!audioData) return res.status(404).json({ message: "აუდიო ჩანაწერი ვერ მოიძებნა" });
    res.status(200).json(audioData);
  } catch (err) {
    res.status(500).json({ message: "მოძებნის შეცდომა", error: err.message });
  }
};

export const getAudioDatas = async (req, res) => {
  try {
    const audioDatas = await AudioData.find().sort({ createdAt: -1 });
    res.status(200).json(audioDatas);
  } catch (err) {
    res.status(500).json({ message: "მონაცემების მიღების შეცდომა", error: err.message });
  }
};