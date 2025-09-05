// server/routes/getUser.js
import express from 'express';
import dbConnect from '../../../../src/lib/dBconnect.js';
import UserProfile from '../../../../src/lib/models/UserProfile.js';

const router = express.Router();

router.get('/:email', async (req, res) => {
  try {
    await dbConnect();

    const emailParam = req.params.email;
    const decodedEmail = decodeURIComponent(emailParam);

    const user = await UserProfile.findOne({ email: decodedEmail }).lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      email: user.email,
      username: user.username,
      followers: user.followers || { count: 0, users: [] },
      following: user.following || { count: 0, users: [] },
      realname: user.realname,
      avatar: user.profile?.avatar || null,
      bio: user.profile?.bio || null,
      location: user.profile?.location || null,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error('Get user error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;



// import { NextResponse } from "next/server";
// import dbConnect from "../../../src/lib/dBconnect";
// import UserProfile from "../../../src/lib/models/UserProfile";


// export async function GET(req, context) {
//   await dbConnect();

//   const { email } = await context.params;  // ✅ await the params
//   const decodedEmail = decodeURIComponent(email);

//   const user = await UserProfile.findOne({ email: decodedEmail }).lean();

//   if (!user) {
//     return NextResponse.json({ error: "User not found" }, { status: 404 });
//   }

//   return NextResponse.json({
//     email: user.email,
//     username: user.username,
//     followers: user.followers || { count: 0, users: [] },
//     following: user.following || { count: 0, users: [] },
//     realname: user.realname,
//     avatar: user.profile?.avatar,
//     bio: user.profile?.bio,
//     location: user.profile?.location,
//     createdAt:user.createdAt,
    

//   });
// }
