// server/routes/topUsers.js
import express from 'express';
import dbConnect from '../../../src/lib/dBconnect.js';
import UserProfile from '../../../src/lib/models/UserProfile.js';

const router = express.Router();

// GET /api/top-users
router.get('/', async (req, res) => {
  try {
    await dbConnect();

    const fixedUserId = "demonstrikk"; // Replace with fixed user _id or email
    const limit = 10;

    const topUsers = await UserProfile.find({}).lean();

    // Add followerCount and sort descending
    const sortedUsers = topUsers
      .map(user => ({ ...user, followerCount: Array.isArray(user.followers) ? user.followers.length : 0 }))
      .sort((a, b) => b.followerCount - a.followerCount);

    // Ensure fixed user is included
    const fixedUser = sortedUsers.find(user => user.profile?.displayName?.toString() === fixedUserId);

    let filtered = sortedUsers.filter(user => user._id.toString() !== fixedUserId).slice(0, limit - 1);

    if (fixedUser) filtered.unshift(fixedUser);

    res.json(filtered.slice(0, limit));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;



// import { NextResponse } from "next/server";
// import dbConnect from "../../src/lib/dBconnect";
// import UserProfile from "../../src/lib/models/UserProfile";


// export async function GET() {
//   await dbConnect();

//   const fixedUserId = "demonstrikk"; // Replace with the fixed user _id or email
//   const limit = 10;

//   const topUsers = await UserProfile.find({})
//     .sort({ followers: -1 }) // followers is an array, so sort by length manually later
//     .lean();

//   const sortedUsers = topUsers
//     .map(user => ({ ...user, followerCount: user.followers.length }))
//     .sort((a, b) => b.followerCount - a.followerCount);

//   const fixedUser = sortedUsers.find(user => user.profile.displayName.toString() === fixedUserId);
//   let filtered = sortedUsers.filter(user => user._id.toString() !== fixedUserId).slice(0, limit - 1);

//   if (fixedUser) filtered.unshift(fixedUser); // Ensure fixed user is included

//   return NextResponse.json(filtered.slice(0, limit));
// }
