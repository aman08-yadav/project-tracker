const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { uploadFile, getProjectFiles, getFiles, deleteFile, downloadFile, reviewFile, getPendingFiles } = require('../controllers/fileController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Multer storage using fs module (diskStorage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || 'uploads');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf', 'text/plain', 'image/jpeg', 'image/png',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip', 'text/csv',
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed. Supported: PDF, TXT, images, Word, Excel, ZIP, CSV'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

router.use(authMiddleware);

router.post('/upload', upload.single('file'), uploadFile);
router.get('/', getFiles);
router.get('/pending', roleMiddleware('faculty'), getPendingFiles);
router.get('/project/:id', getProjectFiles);
router.get('/download/:id', downloadFile);
router.patch('/:id/review', roleMiddleware('faculty'), reviewFile);
router.delete('/:id', deleteFile);

module.exports = router;
