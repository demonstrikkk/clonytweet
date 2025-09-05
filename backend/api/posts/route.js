// server/routes/posts.js
import express from 'express';
import dbConnect from '../../../src/lib/dBconnect.js';
import { Post } from '../../../src/lib/models/Post.js';
import UserProfile from '../../../src/lib/models/UserProfile.js';

const router = express.Router();

// GET /api/posts?viewer=...&skip=...&limit=...
router.get('/', async (req, res) => {
  try {
    await dbConnect();

    const viewer = req.query.viewer;
    const skip = parseInt(req.query.skip || '0', 10);
    const limit = parseInt(req.query.limit || '10', 10);

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        const user = await UserProfile.findOne({ email: post.userEmail }).lean();

        const bookmarkedByCurrentUser = post.bookmarks?.some(
          (b) => b.users.includes(viewer)
        );

        const likedUsers = await UserProfile.find(
          { email: { $in: post.likes.users } },
          'username email'
        ).lean();

        const retweetByUsers = await UserProfile.find(
          { email: { $in: post.retweet?.users || [] } },
          'username email'
        ).lean();

        return {
          ...post,
          userInfo: {
            avatar: user?.profile?.avatar || '',
            username: user?.username || '',
            userrealname: user?.userrealname || '',
            userbio: user?.profile?.bio || '',
          },
          likedByCurrentUser: post.likes.users.includes(viewer),
          likedUsernames: likedUsers.map((u) => u.username),
          retweetByCurrentUser: (post.retweet?.users || []).includes(viewer),
          retweetUsers: retweetByUsers.map((u) => u.username),
          bookmarkedByCurrentUser,
        };
      })
    );

    res.json({ posts: enrichedPosts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


// // server/app/api/posts/route.js
// import { NextResponse } from "next/server";
// import { Post } from "../../src//lib/models/Post";
// import UserProfile from "../../src/lib/models/UserProfile";
// import dbConnect from "../../src/lib/dBconnect";


// export async function GET(req) {
//   await dbConnect();
//   const { searchParams } = new URL(req.url);

//   const viewer = searchParams.get("viewer");
//   const skip = parseInt(searchParams.get("skip") || "0", 10);
//   const limit = parseInt(searchParams.get("limit") || "10", 10);

//   const posts = await Post.find()
//     .sort({ createdAt: -1 })
//     .skip(skip)
//     .limit(limit)
//     .lean();

//   const enrichedPosts = await Promise.all(
//     posts.map(async (post) => {
//       const user = await UserProfile.findOne({ email: post.userEmail }).lean();
//       const bookmarkedByCurrentUser = post.bookmarks?.some(b => b.users.includes(viewer));
//       const likedUsers = await UserProfile.find({
//         email: { $in: post.likes.users }
//       }, 'username email').lean();

//         const retweetByUsers = await UserProfile.find(
//                 { email: { $in: post.retweet?.users || [] } },
//                 "username email"
//               ).lean();
   
//       return {
//         ...post,
//         userInfo: {
//           avatar: user?.profile?.avatar || '',
//           username: user?.username || '',
//           userrealname: user?.userrealname || '',
//           userbio: user?.profile?.bio || '',
//         },
//         likedByCurrentUser: post.likes.users.includes(viewer),
//         likedUsernames: likedUsers.map(u => u.username),
//                   retweetByCurrentUser: (post.retweet?.users || []).includes(viewer),

//           retweetUsers: retweetByUsers.map((u) => u.username),

//         bookmarkedByCurrentUser,
//         // bookmarkedByCurrentUser: post.bookmarks.users.includes(viewer),
//       };
//     })
//   );

//   return NextResponse.json({ posts: enrichedPosts });
// }
