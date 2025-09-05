// routes/comments.js
import express from "express";
import dbConnect from "../../../../src/lib/dBconnect.js";
import { Post } from "../../../../src/lib/models/Post.js";
import { createNotification } from "../../../../src/lib/createNotification.js";
import { supabase } from "../../../../src/lib/supabaseClient.js";
import crypto from "crypto";

const router = express.Router();

// GET /api/comments?postId=...
router.get("/", async (req, res) => {
  try {
    const { postId } = req.query;

    if (!postId) {
      return res.status(400).json({ error: "Post ID is required" });
    }

    await dbConnect();

    const post = await Post.findOne({ postId }).select("comments");
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.status(200).json({ comments: post.comments });
  } catch (err) {
    console.error("GET /api/comments error:", err);
    return res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// POST /api/comments
router.post("/", async (req, res) => {
  try {
    await dbConnect();

    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized: No token" });

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user?.email) return res.status(401).json({ error: "Unauthorized: Invalid token" });

    const {
      postId,
      type,
      commentId,
      replyId,
      text,
      media,
      username,
      avatar,
    } = req.body;

    if (!postId) return res.status(400).json({ error: "Post ID is required" });

    const post = await Post.findOne({ postId });
    if (!post) return res.status(404).json({ error: "Post not found" });

    const userEmail = user.email;

    if (type === "ADD_COMMENT") {
      if (!text && !media) return res.status(400).json({ error: "Text or media is required" });

      const comment = {
        commentId: crypto.randomUUID(),
        user: userEmail,
        username: username || user.user_metadata?.name || "Anonymous",
        avatar: avatar || user.user_metadata?.avatar_url || "/default-avatar.png",
        text,
        media: media || null,
        likes: [],
        replies: [],
        timestamp: new Date(),
      };

      await Post.findOneAndUpdate(
        { postId },
        { $push: { comments: comment }, $inc: { commentCount: 1 } },
        { new: true, runValidators: true }
      );

      // Notify post owner if different
      if (post.userEmail && post.userEmail !== userEmail) {
        await createNotification({
          userEmail: post.userEmail,
          fromUserEmail: userEmail,
          type: "comment",
          postId,
        });
      }

      return res.status(201).json(comment);
    }

    if (type === "ADD_REPLY") {
      if (!commentId || !text) return res.status(400).json({ error: "Comment ID and text are required" });

      const reply = {
        replyId: crypto.randomUUID(),
        user: userEmail,
        username: username || user.user_metadata?.name || "Anonymous",
        avatar: avatar || user.user_metadata?.avatar_url || "/default-avatar.png",
        text,
        media: media || null,
        likes: [],
        timestamp: new Date(),
      };

      const updated = await Post.findOneAndUpdate(
        { postId, "comments.commentId": commentId },
        { $push: { "comments.$.replies": reply } },
        { new: true, runValidators: true }
      );

      return res.status(201).json({ comments: updated.comments });
    }

    if (type === "TOGGLE_LIKE_COMMENT" || type === "TOGGLE_LIKE_REPLY") {
      if (!post) return res.status(404).json({ error: "Post not found" });

      if (type === "TOGGLE_LIKE_COMMENT") {
        const comment = post.comments.find((c) => c.commentId === commentId);
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        const index = comment.likes.indexOf(userEmail);
        if (index >= 0) comment.likes.splice(index, 1);
        else comment.likes.push(userEmail);
      }

      if (type === "TOGGLE_LIKE_REPLY") {
        const comment = post.comments.find((c) => c.commentId === commentId);
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        const reply = comment.replies.find((r) => r.replyId === replyId);
        if (!reply) return res.status(404).json({ error: "Reply not found" });

        const index = reply.likes.indexOf(userEmail);
        if (index >= 0) reply.likes.splice(index, 1);
        else reply.likes.push(userEmail);
      }

      await post.save();
      return res.status(200).json({ comments: post.comments });
    }

    return res.status(400).json({ error: "Invalid action type" });
  } catch (err) {
    console.error("POST /api/comments error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;



// import { NextResponse } from 'next/server';
// import dbConnect from '../../../src/lib/dBconnect';
// import { Post } from '../../../src/lib/models/Post';
// import { createNotification } from '../../../src/lib/createNotification';
// import { supabase } from '../../../src/lib/supabaseClient';


// export async function GET(req) {
//   await dbConnect();
//   const { searchParams } = new URL(req.url);
//   const postId = searchParams.get('postId');

//   if (!postId) {
//     return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
//   }

//   try {
//     // Only selecting comments
//     const post = await Post.findOne({ postId }).select('comments');

//     if (!post) {
//       return NextResponse.json({ error: 'Post not found' }, { status: 404 });
//     }

//     return NextResponse.json({ comments: post.comments });
//   } catch (error) {
//     return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
//   }
// }

// export async function POST(req) {
//   await dbConnect();

//   // Supabase expects access token in Authorization header: Bearer <token>
//   // Extract token from headers
//   const authHeader = req.headers.get('authorization') || '';
//   const token = authHeader.split(' ')[1]; // 'Bearer <token>'

//   if (!token) {
//     return NextResponse.json({ error: 'Unauthorized: No token' }, { status: 401 });
//   }

//   // Verify session with Supabase
//   const { data: { user }, error: userError } = await supabase.auth.getUser(token);

//   if (userError || !user?.email) {
//     return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
//   }

//   try {
//     const {
//       postId,
//       type,
//       commentId,
//       replyId,
//       text,
//       media,
//       username,
//       avatar,
//     } = await req.json();

//     if (!postId) {
//       return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
//     }

//     if (type === 'ADD_COMMENT') {
//       if (!text && !media) {
//         return NextResponse.json({ error: 'Text or media is required' }, { status: 400 });
//       }

//       const comment = {
//         commentId: crypto.randomUUID(),
//         user: user.email,
//         username: username || user.user_metadata?.name || 'Anonymous',
//         avatar: avatar || user.user_metadata?.avatar_url || '/default-avatar.png',
//         text,
//         media: media || null,
//         likes: [],
//         replies: [],
//         timestamp: new Date(),
//       };

//       const updated = await Post.findOneAndUpdate(
//         { postId },
//         {
//           $push: { comments: comment },
//           $inc: { commentCount: 1 },
//         },
//         { new: true, runValidators: true }
//       );

//       const postDoc = await Post.findOne({ postId });
//       if (!postDoc) {
//         return NextResponse.json({ error: 'Post not found' }, { status: 404 });
//       }

//       const receiverEmail = postDoc.userEmail;

//       if (receiverEmail && receiverEmail !== user.email) {
//         await createNotification({
//           userEmail: receiverEmail,
//           fromUserEmail: user.email,
//           type: 'comment',
//           postId,
//         });
//       }

//       return NextResponse.json(comment, { status: 201 });
//     }

//     if (type === 'ADD_REPLY') {
//       if (!commentId || !text) {
//         return NextResponse.json({ error: 'Comment ID and text are required' }, { status: 400 });
//       }

//       const reply = {
//         replyId: crypto.randomUUID(),
//         user: user.email,
//         username: username || user.user_metadata?.name || 'Anonymous',
//         avatar: avatar || user.user_metadata?.avatar_url || '/default-avatar.png',
//         text,
//         media: media || null,
//         likes: [],
//         timestamp: new Date(),
//       };

//       const updated = await Post.findOneAndUpdate(
//         { postId, 'comments.commentId': commentId },
//         { $push: { 'comments.$.replies': reply } },
//         { new: true, runValidators: true }
//       );

//       return NextResponse.json({ comments: updated.comments }, { status: 201 });
//     }

//     if (type === 'TOGGLE_LIKE_COMMENT' || type === 'TOGGLE_LIKE_REPLY') {
//       const post = await Post.findOne({ postId });
//       if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

//       const userEmail = user.email;

//       if (type === 'TOGGLE_LIKE_COMMENT') {
//         const comment = post.comments.find((c) => c.commentId === commentId);
//         if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 });

//         const index = comment.likes.indexOf(userEmail);
//         if (index >= 0) comment.likes.splice(index, 1);
//         else comment.likes.push(userEmail);
//       }

//       if (type === 'TOGGLE_LIKE_REPLY') {
//         const comment = post.comments.find((c) => c.commentId === commentId);
//         if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 });

//         const reply = comment.replies.find((r) => r.replyId === replyId);
//         if (!reply) return NextResponse.json({ error: 'Reply not found' }, { status: 404 });

//         const index = reply.likes.indexOf(userEmail);
//         if (index >= 0) reply.likes.splice(index, 1);
//         else reply.likes.push(userEmail);
//       }

//       await post.save();
//       return NextResponse.json({ comments: post.comments }, { status: 200 });
//     }

//     return NextResponse.json({ error: 'Invalid action type' }, { status: 400 });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: 'Server error' }, { status: 500 });
//   }
// }
