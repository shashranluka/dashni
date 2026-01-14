import { Storage } from "@google-cloud/storage";
const storage = new Storage({
  keyFilename: "audio-storage-uploader.json", // JSON ფაილის გზა
  projectId: "your-project-id"         // შენი პროექტის ID (არ არის აუცილებელი, თუ JSON-ში წერია)
});
const bucket = storage.bucket("dashni"); // შენი bucket-ის სახელი

export async function uploadAudioToGCS(fileBuffer, filename, mimetype) {
  const blob = bucket.file(`audio/${Date.now()}_${filename}`);
  const blobStream = blob.createWriteStream({
    resumable: false,
    contentType: mimetype,
    public: true,
  });

  return new Promise((resolve, reject) => {
    blobStream.on("finish", () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl);
    });
    blobStream.on("error", reject);
    blobStream.end(fileBuffer);
  });
}