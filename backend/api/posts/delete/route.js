// routes/posts.js (or a separate file like routes/postsDelete.js)
import express from "express";
import dbConnect from "../../../../src/lib/dBconnect.js";
import { Post } from "../../../../src/lib/models/Post.js";

const router = express.Router();

// DELETE /api/posts?postId=...&email=...
router.delete("/", async (req, res) => {
  try {
    const { postId, email } = req.query;

    if (!postId || !email) {
      return res.status(400).json({ error: "Missing postId or email" });
    }

    await dbConnect();

    const post = await Post.findOne({ postId });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Only allow deletion if the email matches the post owner
    if (post.userEmail !== email) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await Post.deleteOne({ postId });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("DELETE /api/posts error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;




// import { Post } from "../../../src/lib/models/Post";
// import dbConnect from "../../../src/lib/dBconnect";


// export async function DELETE(req) {
//   const { searchParams } = new URL(req.url);
//   const postId = searchParams.get("postId");
//   const email = searchParams.get("email");

//   if (!postId || !email) {
//     return new Response("Missing postId or email", { status: 400 });
//   }

//   await dbConnect();

//   const post = await Post.findOne({ postId });

//   if (!post) {
//     return new Response("Post not found", { status: 404 });
//   }

//   if (email !== email) {
//     return new Response("Unauthorized", { status: 403 });
//   }

//   await Post.deleteOne({ postId });

//   return new Response(JSON.stringify({ success: true }), { status: 200 });
// }
