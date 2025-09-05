// server/routes/updateProfile.js
import express from 'express';
import dbConnect from '../../../src/lib/dBconnect.js';
import UserProfile from '../../../src/lib/models/UserProfile.js';
import bcrypt from 'bcryptjs';
import supabase from '../../../src/lib/supabaseClient.js';

const router = express.Router();

router.post('/', async (req, res) => {
  await dbConnect();

  try {
    // Extract Supabase token from Authorization header
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    // Verify user session with Supabase
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user?.email) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    const email = user.email;
    const { displayName, avatar, bio, location, password } = req.body;

    const updateFields = {
      'profile.displayName': displayName,
      'profile.avatar': avatar,
      'profile.bio': bio,
      'profile.location': location,
    };

    if (password && password.length >= 6) {
      const hashed = await bcrypt.hash(password, 10);
      updateFields.password = hashed;
    }

    const updatedUser = await UserProfile.findOneAndUpdate(
      { email },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('UpdateProfile error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;



// import { NextResponse } from "next/server";
// import dbConnect from "../../src/lib/dBconnect";
// import UserProfile from "../../src/lib/models/UserProfile";
// import bcrypt from "bcryptjs";
// import  supabase  from "../../src/lib/supabaseClient";


// export async function POST(req) {
//   await dbConnect();

//   // Extract Supabase token from Authorization header
//   const authHeader = req.headers.get("authorization") || "";
//   const token = authHeader.split(" ")[1]; // Bearer <token>

//   if (!token) {
//     return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });
//   }

//   // Verify user session with Supabase
//   const { data: { user }, error: userError } = await supabase.auth.getUser(token);

//   if (userError || !user?.email) {
//     return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
//   }

//   const email = user.email;

//   try {
//     const { displayName, avatar, bio, location, password } = await req.json();

//     const updateFields = {
//       "profile.displayName": displayName,
//       "profile.avatar": avatar,
//       "profile.bio": bio,
//       "profile.location": location,
//     };

//     if (password && password.length >= 6) {
//       const hashed = await bcrypt.hash(password, 10);
//       updateFields.password = hashed;
//     }

//     const updatedUser = await UserProfile.findOneAndUpdate(
//       { email },
//       { $set: updateFields },
//       { new: true }
//     );

//     if (!updatedUser) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     return NextResponse.json({ message: "Profile updated successfully" });
//   } catch (err) {
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }
