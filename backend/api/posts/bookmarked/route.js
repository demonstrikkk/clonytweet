// routes/bookmarks.js

import express from "express";
import { Post } from "../../../../src/lib/models/Post";
import UserProfile from "../../../../src/lib/models/UserProfile"; // Assuming this is your user model
import dbConnect from "../../../../src/lib/dBconnect";

const router = express.Router();

// GET /api/bookmarks?userEmail=...&collectionName=...
router.get("/", async (req, res) => {
  try {
    const { userEmail, collectionName } = req.query;

    if (!userEmail) {
      return res.status(400).json({ error: "Missing userEmail" });
    }

    await dbConnect();

    // 🧠 Filter for bookmarked posts
    const filter = {
      bookmarks: {
        $elemMatch: {
          users: userEmail,
          ...(collectionName ? { collectionName } : {}),
        },
      },
    };

    const posts = await Post.find(filter).lean();

    // 🧠 Enrich each post
    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        const creator = await UserProfile.findOne({ email: post.userEmail }).lean();

        const likedUsers = await UserProfile.find(
          { email: { $in: post.likes?.users || [] } },
          "username"
        ).lean();

        return {
          ...post,
          userInfo: {
            username: creator?.username || "",
            userrealname: creator?.userrealname || "",
            avatar: creator?.profile?.avatar || null,
            email: creator?.email || "",
          },
          likedByCurrentUser: post.likes?.users?.includes(userEmail) || false,
          likedUsernames: likedUsers.map((u) => u.username),
          bookmarkedByCurrentUser: true,
        };
      })
    );

    return res.status(200).json({ posts: enrichedPosts });
  } catch (err) {
    console.error("Error in GET /api/bookmarks:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;



// import { Post } from "../../../src/lib/models/Post";
// import UserProfile from "../../../src/lib/models/UserProfile"; // Assuming this is your user model
// import dbConnect from "../../../src/lib/dBconnect";


// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const userEmail = searchParams.get("userEmail");
//     const collectionName = searchParams.get("collectionName");

//     if (!userEmail) {
//       return new Response(JSON.stringify({ error: "Missing userEmail" }), { status: 400 });
//     }

//     await dbConnect();

//     // Filter for bookmarked posts
//     const filter = {
//       bookmarks: {
//         $elemMatch: {
//           users: userEmail,
//           ...(collectionName ? { collectionName } : {}),
//         },
//       },
//     };

//     const posts = await Post.find(filter).lean();

//     // For each post, enrich with userInfo, likes, and bookmark status
//     const enrichedPosts = await Promise.all(
//       posts.map(async (post) => {
//         // 🧠 Get the user who created the post
//         const creator = await UserProfile.findOne({ email: post.userEmail }).lean();

//         // 🧠 Get usernames of those who liked the post
//         const likedUsers = await UserProfile.find({
//           email: { $in: post.likes?.users || [] }
//         }, 'username').lean();

//         return {
//           ...post,
//           userInfo: {
//             username: creator?.username || '',
//             userrealname: creator?.userrealname || '',
//             avatar: creator?.profile?.avatar || null,
//             email: creator?.email || '',
//           },
//           likedByCurrentUser: post.likes?.users?.includes(userEmail) || false,
//           likedUsernames: likedUsers.map(u => u.username),
//           bookmarkedByCurrentUser: true,
//         };
//       })
//     );

//     return new Response(JSON.stringify({ posts: enrichedPosts }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });

//   } catch (err) {
//     return new Response(JSON.stringify({ error: "Internal Server Error" }), {
//       status: 500,
//     });
//   }
// }

