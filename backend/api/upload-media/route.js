/* eslint-disable no-undef */
// server/routes/uploadMedia.js
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';

const router = express.Router();
const upload = multer(); // For handling multipart/form-data

// Initialize Supabase admin client (Service Role Key)
const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file provided.' });
    }

    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${Date.now()}.${fileExtension}`;
    const filePath = `public/${fileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('chat-media')
      .upload(filePath, file.buffer);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabaseAdmin.storage.from('chat-media').getPublicUrl(filePath);

    return res.status(200).json({ publicUrl: data.publicUrl });
  } catch (err) {
    console.error('Error uploading media:', err);
    return res.status(500).json({ error: 'Failed to upload media', details: err.message });
  }
});

export default router;





// // app/api/upload-media/route.js
// import { createClient } from '@supabase/supabase-js';
// import { NextResponse } from 'next/server';


// // Initialize the admin client for secure server-side operations
// const supabaseAdmin = createClient(
//   import.meta.env.NEXT_PUBLIC_SUPABASE_URL || '',
//   import.meta.env.SUPABASE_SERVICE_ROLE_KEY || '' // Use the Service Role Key here
// );

// export async function POST(request) {
//   try {
//     const formData = await request.formData();
//     const file = formData.get('file');

//     if (!file) {
//       return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
//     }

//     const fileExtension = file.name.split('.').pop();
//     const fileName = `${Date.now()}.${fileExtension}`;
//     const filePath = `public/${fileName}`;

//     // Upload file to Supabase Storage
//     const { error: uploadError } = await supabaseAdmin.storage
//       .from('chat-media') // The bucket name we created
//       .upload(filePath, file);

//     if (uploadError) {
//       throw uploadError;
//     }

//     // Get the public URL of the uploaded file
//     const { data } = supabaseAdmin.storage
//       .from('chat-media')
//       .getPublicUrl(filePath);

//     return NextResponse.json({ publicUrl: data.publicUrl });

//   } catch (error) {
//     console.error('Error uploading media:', error);
//     return NextResponse.json(
//       { error: 'Failed to upload media.', details: error.message },
//       { status: 500 }
//     );
//   }
// }