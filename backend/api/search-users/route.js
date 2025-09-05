




// import dbConnect from '../../src/lib/dBconnect';
// import UserProfile from '../../src/lib/models/UserProfile';


// export async function GET(req) {
//   try {
//     await dbConnect();

//     const { searchParams } = new URL(req.url);
//     const query = searchParams.get('q');
//     const currentUserEmail = searchParams.get('currentUserEmail');

//     if (!query) return Response.json({ users: [] });

//     const users = await UserProfile.find({
//       email: { $ne: currentUserEmail },
//       username: { $regex: query, $options: 'i' },
//     }).select({
//       email: 1,
//       username: 1,
//       'profile.displayName': 1,
//       'profile.avatar': 1
//     });

//     // make sure userrealname is mapped correctly
//     const formattedUsers = users.map(u => ({
//       email: u.email,
//       username: u.username,
//       avatar: u.profile?.avatar || null,
//       userrealname: u.profile?.displayName || null
//     }));

//     return Response.json({ users: formattedUsers });
//   } catch (error) {
//     console.error('Search error:', error);
//     return new Response('Server error', { status: 500 });
//   }
// }

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

    if (!query) return res.json({ users: [] });

    const users = await UserProfile.find({
      email: { $ne: currentUserEmail },
      username: { $regex: query, $options: 'i' },
    }).select({
      email: 1,
      username: 1,
      'profile.displayName': 1,
      'profile.avatar': 1
    }).lean();

    const formattedUsers = users.map(u => ({
      email: u.email,
      username: u.username,
      avatar: u.profile?.avatar || null,
      userrealname: u.profile?.displayName || null
    }));

    return res.json({ users: formattedUsers });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
