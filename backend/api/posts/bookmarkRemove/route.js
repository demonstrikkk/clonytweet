
// import { Post } from "../../../src/lib/models/Post";
// import dbConnect from "../../../src/lib/dBconnect";


// export async function POST(req) {
//   try {
//     const body = await req.json();
//     const { postId, userEmail, collectionName = 'default' } = body;

//     await dbConnect();

//     const post = await Post.findOne({ postId });
//     if (!post) {
//       return new Response(JSON.stringify({ message: 'Post not found' }), {
//         status: 404,
//       });
//     }

//     await post.removeBookmark(userEmail, collectionName);

//     return new Response(JSON.stringify({
//       success: true,
//       bookmarks: post.bookmarks,
//     }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" }
//     });

//   } catch (err) {
//     return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
//       status: 500,
//     });
//   }
// }

// routes/removeBookmark.js

import express from "express";

import { Post } from "../../../../src/lib/models/Post.js";
import dbConnect from "../../../../src/lib/dBconnect.js";

const router = express.Router();

// POST /api/removeBookmark
router.post("/", async (req, res) => {
  try {
    const { postId, userEmail, collectionName = "default" } = req.body;

    if (!postId || !userEmail) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    await dbConnect();

    const post = await Post.findOne({ postId });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Assuming you defined removeBookmark as a schema method on Post
    await post.removeBookmark(userEmail, collectionName);

    return res.status(200).json({
      success: true,
      bookmarks: post.bookmarks,
    });
  } catch (err) {
    console.error("Error in POST /api/removeBookmark:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
