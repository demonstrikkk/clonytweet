// routes/followingPosts.js
import express from "express";
import dbConnect from "../../../../src/lib/dBconnect.js";
import { Post } from "../../../../src/lib/models/Post.js";
import UserProfile from "../../../../src/lib/models/UserProfile.js";

const router = express.Router();

// GET /api/posts/following?viewer=...&skip=0&limit=10
router.get("/", async (req, res) => {
  try {
    const viewerEmail = req.query.viewer;
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 10;

    if (!viewerEmail) {
      return res.status(400).json({ error: "Viewer email is required" });
    }

    await dbConnect();

    const viewerProfile = await UserProfile.findOne({ email: viewerEmail });

    if (!viewerProfile || !Array.isArray(viewerProfile.following?.users)) {
      return res.json({ posts: [] });
    }

    const followingEmails = viewerProfile.following.users;

    const posts = await Post.find({ userEmail: { $in: followingEmails } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        const user = await UserProfile.findOne({ email: post.userEmail }).lean();
        const likedUsers = await UserProfile.find(
          { email: { $in: post.likes?.users || [] } },
          "username email"
        ).lean();
        const retweetByUsers = await UserProfile.find(
          { email: { $in: post.retweet?.users || [] } },
          "username email"
        ).lean();

        return {
          ...post,
          userInfo: {
            avatar: user?.profile?.avatar || '',
            username: user?.username || '',
            userrealname: user?.userrealname || '',
            userbio: user?.profile?.bio || '',
          },
          likedByCurrentUser: (post.likes?.users || []).includes(viewerEmail),
          retweetByCurrentUser: (post.retweet?.users || []).includes(viewerEmail),
          likedUsernames: likedUsers.map((u) => u.username),
          retweetUsers: retweetByUsers.map((u) => u.username),
        };
      })
    );

    res.json({ posts: enrichedPosts });

  } catch (err) {
    console.error("GET /api/posts/following error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;


// import { NextResponse } from "next/server";
// import { Post } from "../../../src/lib/models/Post"; // Adjust if needed
// import UserProfile from "../../../src/lib/models/UserProfile"; // Adjust if needed
// import dbConnect from "../../../src/lib/dBconnect"; // Ensure DB connection


// export async function GET(req) {
//   await dbConnect();

//   const { searchParams } = new URL(req.url);
//   const viewerEmail = searchParams.get("viewer");
//   const skip = parseInt(searchParams.get("skip")) || 0;
//   const limit = parseInt(searchParams.get("limit")) || 10;

//   if (!viewerEmail) {
//     return NextResponse.json({ error: "Viewer email is required" }, { status: 400 });
//   }

//   try {
//     const viewerProfile = await UserProfile.findOne({ email: viewerEmail });

//     if (!viewerProfile || !Array.isArray(viewerProfile.following?.users)) {
//       return NextResponse.json({ posts: [] });
//     }

//     const followingEmails = viewerProfile.following.users;

//     const posts = await Post.find({ userEmail: { $in: followingEmails } })
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     const enrichedPosts = await Promise.all(
//       posts.map(async (post) => {
//         const user = await UserProfile.findOne({ email: post.userEmail }).lean();
//         const likedUsers = await UserProfile.find(
//           { email: { $in: post.likes?.users || [] } },
//           "username email"
//         ).lean();
//         const retweetByUsers = await UserProfile.find(
//           { email: { $in: post.retweet?.users || [] } },
//           "username email"
//         ).lean();

//         return {
//           ...post,
//           userInfo: {
//             avatar: user?.profile?.avatar || '',
//             username: user?.username || '',
//             userrealname: user?.userrealname || '',
//             userbio: user?.profile?.bio || '',
//           },
//           likedByCurrentUser: (post.likes?.users || []).includes(viewerEmail),
//           retweetByCurrentUser: (post.retweet?.users || []).includes(viewerEmail),
//           likedUsernames: likedUsers.map((u) => u.username),
//           retweetUsers: retweetByUsers.map((u) => u.username),
//         };
//       })
//     );

//     return NextResponse.json({ posts: enrichedPosts });
//   } catch (error) {
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }
