// server/routes/getUserProfile.js
import express from 'express';
import dbConnect from '../../../src/lib/dBconnect.js';
import UserProfile from '../../../src/lib/models/UserProfile.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({ error: 'Email query param is required' });
    }

    await dbConnect();

    const user = await UserProfile.findOne({ email }).lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ profile: user });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;



// import { NextResponse } from "next/server";
// import dbConnect from "../../src/lib/dBconnect";
// import UserProfile from "../../src/lib/models/UserProfile";


// export async function GET(req) {
//   try {
//     await dbConnect();
//     const { searchParams } = new URL(req.url);
//     const email = searchParams.get("email");

//     if (!email) {
//       return NextResponse.json({ error: "Email query param is required" }, { status: 400 });
//     }

//     const user = await UserProfile.findOne({ email }).lean();

//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     return NextResponse.json({ profile: user });
//   } catch (err) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }
