// server/routes/repostsByUser.js
import express from 'express';
import dbConnect from '../../../src/lib/dBconnect.js';
import { Post } from '../../../src/lib/models/Post.js';
import UserProfile from '../../../src/lib/models/UserProfile.js';

const router = express.Router();

// GET /api/posts/repostsbyuser?email=...
router.get('/', async (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ error: "Missing email" });
  }

  try {
    await dbConnect();

    // Find reposts by the user
    const reposts = await Post.find({ "retweet.users": email }).sort({ createdAt: -1 }).lean();

    // Enrich each repost with user profile
    const enrichedReposts = await Promise.all(
      reposts.map(async (post) => {
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
          retweetByCurrentUser: post.retweet?.users?.includes(email),
        };
      })
    );

    return res.json({ reposts: enrichedReposts });
  } catch (err) {
    console.error("Error fetching reposts:", err);
    return res.status(500).json({ error: "Failed to fetch reposts" });
  }
});

export default router;




// // /app/api/posts/repostsbyuser/route.js
// import { NextResponse } from 'next/server';
// import dbConnect from '../../src/lib/dBconnect';
// import { Post } from '../../src/lib/models/Post';
// import UserProfile from '../../src/lib/models/UserProfile'; // make sure this is correct


// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const email = searchParams.get("email");

//   if (!email) {
//     return NextResponse.json({ error: "Missing email" }, { status: 400 });
//   }

//   try {
//     await dbConnect();

//     // Find reposts by the user
//     const reposts = await Post.find({ "retweet.users": email }).sort({ createdAt: -1 }).lean();

//     // Enrich each repost with user profile
//     const enrichedReposts = await Promise.all(
//       reposts.map(async (post) => {
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
//           retweetByCurrentUser: post.retweet?.users?.includes(email),
//         };
//       })
//     );

//     return NextResponse.json({ reposts: enrichedReposts });
//   } catch (err) {
//     console.error("Error fetching reposts:", err);
//     return NextResponse.json({ error: "Failed to fetch reposts" }, { status: 500 });
//   }
// }
