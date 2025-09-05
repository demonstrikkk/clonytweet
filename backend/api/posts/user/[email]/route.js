// server/routes/postsByUser.js
import express from 'express';
import dbConnect from '../../../../../src/lib/dBconnect.js';
import { Post } from '../../../../../src/lib/models/Post.js';

const router = express.Router();

// GET /api/posts/user/:email
router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    await dbConnect();

    const userPosts = await Post.find({ userEmail: email }).sort({ createdAt: -1 });

    return res.json({ success: true, posts: userPosts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch user posts' });
  }
});

export default router;



// // server/app/api/posts/user/[email]/route.js



// import { Post } from "../../../../src//lib/models/Post";
// import { NextResponse } from "next/server";


// export async function GET(_, { params }) {
//   const { email } = params;

//   if (!email) {
//     return NextResponse.json({ error: "Missing email" }, { status: 400 });
//   }

//   try {
//     const userPosts = await Post.find({ userEmail: email }).sort({ createdAt: -1 });

//     return NextResponse.json({ success: true, posts: userPosts });
//   } catch (error) {
//     return NextResponse.json({ error: "Failed to fetch user posts" }, { status: 500 });
//   }
// }
