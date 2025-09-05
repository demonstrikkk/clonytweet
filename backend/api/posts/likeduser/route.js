// routes/likePost.js
import express from "express";
import dbConnect from "../../../../src/lib/dBconnect.js";
import { Post } from "../../../../src/lib/models/Post.js";
import UserProfile from "../../../../src/lib/models/UserProfile.js";
import { createNotification } from "../../../../src/lib/createNotification.js";

const router = express.Router();

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
      post.likes.users = post.likes.users.filter(u => u !== userEmail);
      post.likes.count -= 1;
    } else {
      post.likes.users.push(userEmail);
      post.likes.count += 1;

      if (post.userEmail !== userEmail) {
        await createNotification({
          userEmail: post.userEmail,      // post owner
          fromUserEmail: userEmail,       // liker
          type: "like",
          postId: post.postId,
        });
      }
    }

    await post.save();

    // Enrich with user info
    const user = await UserProfile.findOne({ email: post.userEmail }).lean();
    const userInfo = user
      ? {
          username: user.username || '',
          userrealname: user.userrealname || '',
          avatar: user.profile?.avatar || null,
        }
      : null;

    const enrichedPost = {
      ...post.toObject(),
      userInfo,
      likedByCurrentUser: post.likes.users.includes(userEmail),
    };

    res.json({ post: enrichedPost });
  } catch (err) {
    console.error("POST /api/posts/like error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;



// // server/app/api/posts/like/route.js
// import { NextResponse } from "next/server";
// import { Post } from "../../../src/lib/models/Post";
// import UserProfile from "../../../src/lib/models/UserProfile";
// import dbConnect from "../../../src/lib/dBconnect";
// import { createNotification } from "../../../src/lib/createNotification";


// export async function POST(req) {
//   try {
//     await dbConnect();
//     const { postId, userEmail } = await req.json();

//     const post = await Post.findOne({ postId });
//     if (!post) {
//       return NextResponse.json({ error: "Post not found" }, { status: 404 });
//     }

//     const hasLiked = post.likes.users.includes(userEmail);
//     if (hasLiked) {
//       post.likes.users = post.likes.users.filter(u => u !== userEmail);
//       post.likes.count -= 1;
//     } else {
//       post.likes.users.push(userEmail);
//       post.likes.count += 1;

// if (post.userEmail !== userEmail) {
//   await createNotification({
//     userEmail: post.userEmail,      // post owner (receiver of notification)
//     fromUserEmail: userEmail,       // person who liked
//     type: "like",
//     postId: post.postId,
//   });
// }


//     }

//     await post.save();

//     // Add userInfo before sending to frontend
//     const user = await UserProfile.findOne({ email: post.userEmail }).lean();
//     const userInfo = user
//       ? {
//           username: user?.username || '',
//           userrealname: user?.userrealname || '',
//           avatar: user.profile?.avatar || null,
//         }
//       : null;

//     const enrichedPost = {
//       ...post.toObject(),
//       userInfo,
//       likedByCurrentUser: post.likes.users.includes(userEmail)
//     };

//     return NextResponse.json({ post: enrichedPost });

//   } catch (err) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }
