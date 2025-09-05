// routes/likePost.js
import express from "express";
import dbConnect from "../../../../src/lib/dBconnect.js";
import { Post } from "../../../../src/lib/models/Post.js";
import { createNotification } from "../../../../src/lib/createNotification.js";

const router = express.Router();

// POST /api/posts/like
router.post("/", async (req, res) => {
  try {
    const { postId, userEmail } = req.body;

    if (!postId || !userEmail) {
      return res.status(400).json({ error: "postId and userEmail are required" });
    }

    await dbConnect();

    const post = await Post.findOne({ postId });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const hasLiked = post.likes.users.includes(userEmail);

    if (hasLiked) {
      // Unlike
      post.likes.users = post.likes.users.filter(email => email !== userEmail);
    } else {
      // Like
      post.likes.users.push(userEmail);

      if (post.userEmail !== userEmail) {
        await createNotification({
          userEmail: post.userEmail,    // receiver
          fromUserEmail: userEmail,     // liker
          type: "like",
          postId: post.postId,
        });
      }
    }

    // Update count
    post.likes.count = post.likes.users.length;
    await post.save();

    res.json({
      message: hasLiked ? "Unliked" : "Liked",
      liked: !hasLiked,
      newCount: post.likes.count,
      likedUsers: post.likes.users,
    });

  } catch (err) {
    console.error("POST /api/posts/like error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;



// // server/app/api/posts/like/route.js
// import { NextResponse } from "next/server";
// import dbConnect from "../../../src/lib/dBconnect";
// import { Post } from "../../../src/lib/models/Post";
// import { createNotification } from "../../../src/lib/createNotification";


// export async function POST(req) {
//   await dbConnect();
//   const { postId, userEmail } = await req.json();

//   const post = await Post.findOne({ postId });

//   if (!post) {
//     return NextResponse.json({ error: "Post not found" }, { status: 404 });
//   }

//   const hasLiked = post.likes.users.includes(userEmail);

//   if (hasLiked) {
//     // Unlike: remove userEmail
//     post.likes.users = post.likes.users.filter(email => email !== userEmail);
//   } else {
//     // Like: add userEmail
//     post.likes.users.push(userEmail);
//     if (post.userEmail !== userEmail) {
//       await createNotification({
//         userEmail: post.userEmail,      // post owner (receiver of notification)
//         fromUserEmail: userEmail,       // person who liked
//         type: "like",
//         postId: post.postId,
//       });
//     }
//   }

//   // Update like count
//   post.likes.count = post.likes.users.length;
//   await post.save();

//   return NextResponse.json({
//     message: hasLiked ? "Unliked" : "Liked",
//     liked: !hasLiked,
//     newCount: post.likes.count,
//     likedUsers: post.likes.users,
//   });
// }
