// server/routes/searchUsers.js
import express from 'express';
import dbConnect from '../../../src/lib/dBconnect.js';
import UserProfile from '../../../src/lib/models/UserProfile.js';

const router = express.Router();

// GET /api/search-users?q=...&currentUserEmail=...
router.get('/', async (req, res) => {
  try {
    await dbConnect();

    const query = req.query.q;
    const currentUserEmail = req.query.currentUserEmail;

    if (!query) return res.json([]);

    const users = await UserProfile.find({
      email: { $ne: currentUserEmail },
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { userrealname: { $regex: query, $options: 'i' } }
      ]
    }).select('email username userrealname profile.avatar').lean();

    const formattedUsers = users.map(u => ({
      email: u.email,
      username: u.username,
      userrealname: u.userrealname,
      avatar_url: u.profile?.avatar || '/default-avatar.png',
    }));

    return res.json(formattedUsers);
  } catch (err) {
    console.error("SearchUsers route error", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;




// import dbConnect from '../../src/lib/dBconnect';
// import UserProfile from '../../src/lib/models/UserProfile';
// import { NextResponse } from 'next/server';


// export async function GET(req) {
//   try {
//     await dbConnect();

//     const { searchParams } = new URL(req.url);
//     const query = searchParams.get('q');
//     const currentUserEmail = searchParams.get('currentUserEmail');

//     if (!query) return NextResponse.json([]);

//     const users = await UserProfile.find({
//       email: { $ne: currentUserEmail },
//       $or: [
//         { username: { $regex: query, $options: 'i' } },
//         { userrealname: { $regex: query, $options: 'i' } }
//       ]
//     }).select('email username userrealname profile.avatar');

//     return NextResponse.json(
//       users.map((u) => ({
//         email: u.email,
//         username: u.username,
//         userrealname: u.userrealname,
//         avatar_url: u.profile?.avatar || '/default-avatar.png',
//       }))
//     );

//   } catch (err) {
//     console.error("SearchUsers route error", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }
