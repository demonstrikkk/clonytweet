/* eslint-disable no-undef */
import { Router } from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";


const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Supabase admin client
const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "" // Service Role Key
);

// ✅ POST /upload
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file provided." });
    }

    const fileExtension = file.originalname.split(".").pop();
    const fileName = `${Date.now()}.${fileExtension}`;
    const filePath = `public/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from("group-images") // bucket name
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabaseAdmin.storage
      .from("group-images")
      .getPublicUrl(filePath);

    return res.status(200).json({ publicUrl: data.publicUrl });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to upload media.",
      details: error.message,
    });
  }
});

export default router;

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
//       .from('group-images') // The bucket name we created
//       .upload(filePath, file);

//     if (uploadError) {
//       throw uploadError;
//     }

//     // Get the public URL of the uploaded file
//     const { data } = supabaseAdmin.storage
//       .from('group-images')
//       .getPublicUrl(filePath);

//     return NextResponse.json({ publicUrl: data.publicUrl });

//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Failed to upload media.', details: error.message },
//       { status: 500 }
//     );
//   }
// }