// filepath: /Users/luka/dev/dashni/backend/middleware/upload.js
import multer from "multer";
export default multer({ storage: multer.memoryStorage() });