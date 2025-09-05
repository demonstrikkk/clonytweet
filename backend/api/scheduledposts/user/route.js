// server/routes/scheduledPosts.js
import express from 'express';
import dbConnect from '../../../../src/lib/dBconnect.js';
import { ScheduledPost } from '../../../../src/lib/models/ScheduledPost.js';
import UserProfile from '../../../../src/lib/models/UserProfile.js';

const router = express.Router();

// GET /api/scheduled-posts?email=...
router.get('/', async (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ error: "Missing email" });
  }

  try {
    await dbConnect();

    // Find scheduled posts by the user
    const scheduleposts = await ScheduledPost.find({ userEmail: email })
      .sort({ scheduledFor: -1 })
      .lean();

    // Enrich each scheduled post with user profile
    const enrichedscheduleposts = await Promise.all(
      scheduleposts.map(async (post) => {
        const user = await UserProfile.findOne({ email: post.userEmail }).lean();
        return {
          ...post,
          userInfo: user
            ? {
                username: user.username || '',
                userrealname: user.userrealname || '',
                avatar: user.profile?.avatar || null,
              }
            : null,
        };
      })
    );

    return res.json({ scheduleposts: enrichedscheduleposts });
  } catch (err) {
    console.error("Error fetching scheduleposts:", err);
    return res.status(500).json({ error: "Failed to fetch scheduleposts" });
  }
});

export default router;




// import dbConnect from '../../../src/lib/dBconnect';
// import { ScheduledPost } from '../../../src/lib/models/ScheduledPost';
// import { NextResponse } from 'next/server';
// import UserProfile from '../../../src/lib/models/UserProfile';



// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const email = searchParams.get("email");

//   if (!email) {
//     return NextResponse.json({ error: "Missing email" }, { status: 400 });
//   }

//   try {
//     await dbConnect();

//     // Find scheduleposts by the user
//     const scheduleposts = await ScheduledPost.find({ userEmail: email }).sort({ scheduledFor: -1 }).lean();

//     const enrichedscheduleposts = await Promise.all(
//       scheduleposts.map(async (post) => {
//         const user = await UserProfile.findOne({ email: post.userEmail }).lean();
//         return {
//           ...post,
//           userInfo: user
//             ? {
//                 username: user.username || '',
//                 userrealname: user.userrealname || '',
//                 avatar: user.profile?.avatar || null,
//               }
//             : null,
//         };
//       })
//     );

//     return NextResponse.json({ scheduleposts: enrichedscheduleposts });
//   } catch (err) {
//     console.error("Error fetching scheduleposts:", err);
//     return NextResponse.json({ error: "Failed to fetch scheduleposts" }, { status: 500 });
//   }
// }
