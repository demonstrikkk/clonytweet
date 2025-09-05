// routes/getPost.js
import express from "express";
import dbConnect from "../../../../src/lib/dBconnect.js";
import { Post } from "../../../../src/lib/models/Post.js";
import UserProfile from "../../../../src/lib/models/UserProfile.js";

const router = express.Router();

// GET /api/getPost?postId=...
router.get("/", async (req, res) => {
  try {
    const { postId } = req.query;

    if (!postId) {
      return res.status(400).json({ error: "postId missing" });
    }

    await dbConnect();

    const post = await Post.findOne({ postId });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const user = await UserProfile.findOne({ email: post.userEmail }).lean();
    const userInfo = user
      ? {
          username: user.username || "",
          userrealname: user.userrealname || "",
          avatar: user.profile?.avatar || "/default-avatar.png",
        }
      : null;

    const enrichedPost = {
      ...post.toObject(),
      userInfo,
    };

    return res.status(200).json({ post: enrichedPost });
  } catch (err) {
    console.error("Error in GET /api/getPost:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;




// import { NextResponse } from "next/server";
// import dbConnect from "../../../src/lib/dBconnect";
// import { Post } from "../../../src/lib/models/Post";
// import UserProfile from "../../../src/lib/models/UserProfile";


// export async function GET(req) {
//   try {
//     await dbConnect();
//     const { searchParams } = new URL(req.url);
//     const postId = searchParams.get("postId");

//     if (!postId) {
//       return NextResponse.json({ error: "postId missing" }, { status: 400 });
//     }

//     const post = await Post.findOne({ postId });
//     if (!post) {
//       return NextResponse.json({ error: "Post not found" }, { status: 404 });
//     }

//     const user = await UserProfile.findOne({ email: post.userEmail }).lean();
//     const userInfo = user
//       ? {
//           username: user.username || "",
//           userrealname: user.userrealname || "",
//           avatar: user.profile?.avatar || "/default-avatar.png",
//         }
//       : null;

//     const enrichedPost = {
//       ...post.toObject(),
//       userInfo,
//     };

//     return NextResponse.json({ post: enrichedPost });
//   } catch (err) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }
