/* eslint-disable no-undef */
// server/routes/upload.js
import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Buffer } from 'buffer';

const router = express.Router();
const upload = multer(); // For parsing multipart/form-data

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file received' });
  }

  const buffer = req.file.buffer;

  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ resource_type: 'auto' }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(buffer);
    });

    return res.status(200).json({
      secure_url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;



// import { v2 as cloudinary } from 'cloudinary';
// import { NextResponse } from 'next/server';
// import { Buffer } from 'buffer';


// cloudinary.config({
//   cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
//   api_key: import.meta.env.CLOUDINARY_API_KEY,
//   api_secret: import.meta.env.CLOUDINARY_API_SECRET,
// });

// export async function POST(req) {
//   const formData = await req.formData();
//   const file = formData.get('file');

//   if (!file) {
//     return NextResponse.json({ error: 'No file received' }, { status: 400 });
//   }

//   const arrayBuffer = await file.arrayBuffer();
//   const buffer = Buffer.from(arrayBuffer);

//   try {
//     const result = await new Promise((resolve, reject) => {
//       cloudinary.uploader.upload_stream({ resource_type: "auto" }, (error, result) => {
//         if (error) reject(error);
//         else resolve(result);
//       }).end(buffer);
//     });

//     return NextResponse.json({
//       secure_url: result.secure_url,
//       public_id: result.public_id,
//     });
//   } catch (err) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }
