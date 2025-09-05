// server/routes/searchUsers.js
import express from 'express';
import dbConnect from '../../../src/lib/dBconnect.js';
import UserProfile from '../../../src/lib/models/UserProfile.js';

const router = express.Router();

// GET /api/search-users?q=...
router.get('/', async (req, res) => {
  await dbConnect();

  const query = req.query.q?.toLowerCase();

  if (!query) {
    return res.status(200).json([]);
  }

  const regex = new RegExp(`^${query}`, 'i');

  try {
    const users = await UserProfile.find({
      $or: [
        { username: { $regex: regex } },
        { userrealname: { $regex: regex } },
      ],
    }).lean();

    // Prioritize results where username starts with query
    const sortedUsers = users.sort((a, b) => {
      const aStartsWith = a.username.toLowerCase().startsWith(query);
      const bStartsWith = b.username.toLowerCase().startsWith(query);

      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      return 0;
    });

    return res.json(sortedUsers);
  } catch (err) {
    console.error('Failed to fetch users:', err);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;




// import { NextResponse } from 'next/server';
// import dbConnect from '../../src/lib/dBconnect';
// import UserProfile from '../../src/lib/models/UserProfile';


// export async function GET(req) {
//   await dbConnect();

//   const { searchParams } = new URL(req.url);
//   const query = searchParams.get('q')?.toLowerCase();

//   if (!query) {
//     return NextResponse.json([], { status: 200 });
//   }

//   const regex = new RegExp(`^${query}`, 'i');

//   try {
//     const users = await UserProfile.find({
//       $or: [
//         { username: { $regex: regex } },
//         { userrealname: { $regex: regex } },
//       ],
//     });

//     const sortedUsers = users.sort((a, b) => {
//       const aStartsWith = a.username.toLowerCase().startsWith(query);
//       const bStartsWith = b.username.toLowerCase().startsWith(query);

//       if (aStartsWith && !bStartsWith) return -1;
//       if (!aStartsWith && bStartsWith) return 1;
//       return 0;
//     });

//     return NextResponse.json(sortedUsers);
//   } catch (err) {
//     return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
//   }
// }
