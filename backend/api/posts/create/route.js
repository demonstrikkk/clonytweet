// routes/posts.js
import express from "express";
import dbConnect from "../../../../src/lib/dBconnect.js";
import { Post } from "../../../../src/lib/models/Post.js";
import UserProfile from "../../../../src/lib/models/UserProfile.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// POST /api/posts
router.post("/", async (req, res) => {
  try {
    await dbConnect();

    const { userEmail, text, media, poll } = req.body;

    if (!userEmail) {
      return res.status(400).json({ error: "userEmail is required" });
    }

    const newPost = new Post({
      postId: uuidv4(),
      userEmail,
      content: {
        text,
        media,
        poll: poll
          ? {
              question: poll.question,
              options: poll.options.map(opt => ({ text: opt.text, votes: 0 })),
              votedUsers: [],
            }
          : null,
      },
      likes: { count: 0, users: [] },
      bookmarks: [],
      comments: [],
      commentCount: 0,
    });

    await newPost.save();

    const savedPost = await Post.findOne({ postId: newPost.postId }).lean();
    const user = await UserProfile.findOne({ email: userEmail }).lean();

    return res.status(201).json({
      success: true,
      post: {
        ...savedPost,
        userInfo: {
          avatar: user?.profile?.avatar || '',
          username: user?.username || '',
          userrealname: user?.profile?.displayName || '',
          userbio: user?.profile?.bio || '',
        },
        likedByCurrentUser: false,
      },
    });

  } catch (err) {
    console.error("POST /api/posts error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;


// import { NextResponse } from "next/server";
// import { Post } from "../../../src/lib/models/Post";
// import UserProfile from "../../../src/lib/models/UserProfile";
// import dbConnect from "../../../src/lib/dBconnect";
// import { v4 as uuidv4 } from "uuid";


// export async function POST(req) {
//   await dbConnect();
//   const { userEmail, text, media, poll } = await req.json();

//   const newPost = new Post({
//     postId: uuidv4(),
//     userEmail,
//     content: {
//       text,
//       media,
//       poll: poll
//         ? {
//             question: poll.question,
//             options: poll.options.map(opt => ({ text: opt.text, votes: 0 })),
//             votedUsers: [],
//           }
//         : null,
//     },
//     likes: { count: 0, users: [] },
//     bookmarks: [],
//     comments: [],
//     commentCount: 0,
//   });

//   await newPost.save();

//   const savedPost = await Post.findOne({ postId: newPost.postId }).lean();
//   const user = await UserProfile.findOne({ email: userEmail }).lean();

//   return NextResponse.json({
//     success: true,
//     post: {
//       ...savedPost,
//       userInfo: {
//         avatar: user?.profile?.avatar || '',
//         username: user?.username || '',
//         userrealname: user?.profile?.displayName || '',
//         userbio : user?.profile?.bio || '',
//       },
//       likedByCurrentUser: false,
//     },
//   });
// }



