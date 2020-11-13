import path from 'path';
import crypto from 'crypto';
import multer from 'multer';

const dirPath = path.resolve(__dirname, '..', '..', 'tmp');
const upload = {
  destination: dirPath,
  storage: multer.diskStorage({
    destination: dirPath,
    filename: (request, file, cb) => {
      const hash = crypto.randomBytes(10).toString('hex');
      const fileName = `${hash}-${file.originalname}`;

      return cb(null, fileName);
    },
  }),
};

export default upload;
