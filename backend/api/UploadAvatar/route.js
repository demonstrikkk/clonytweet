// server/routes/uploadAvatar.js
import express from 'express';
import cloudinary from '../../../src/lib/cloudinary.js';
import multer from 'multer';
import { Buffer } from 'buffer';

const router = express.Router();
const upload = multer(); // For parsing multipart/form-data

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const buffer = Buffer.from(file.buffer);
    const base64String = buffer.toString('base64');
    const dataUri = `data:${file.mimetype};base64,${base64String}`;

    const uploadRes = await cloudinary.uploader.upload(dataUri, {
      folder: 'avatars',
      transformation: [
        { width: 300, height: 300, crop: 'fill', gravity: 'face' },
      ],
    });

    return res.status(200).json({ url: uploadRes.secure_url });
  } catch (err) {
    console.error('Cloudinary error:', err);
    return res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;



// import { NextResponse } from "next/server";
// import cloudinary from "../../src/lib/cloudinary";
// import { Buffer } from "buffer";


// export async function POST(req) {
//   const data = await req.formData();
//   const file = data.get("file");

//   if (!file) {
//     return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
//   }

//   const buffer = Buffer.from(await file.arrayBuffer());
//   const base64String = buffer.toString("base64");
//   const dataUri = `data:${file.type};base64,${base64String}`;

//   try {
//     const uploadRes = await cloudinary.uploader.upload(dataUri, {
//       folder: "avatars",
//       transformation: [{ width: 300, height: 300, crop: "fill", gravity: "face" }],
//     });

//     return NextResponse.json({ url: uploadRes.secure_url });
//   } catch (err) {
//     console.error("Cloudinary error:", err);
//     return NextResponse.json({ error: "Upload failed" }, { status: 500 });
//   }
// }
