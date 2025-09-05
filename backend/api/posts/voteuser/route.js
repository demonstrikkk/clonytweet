// server/routes/pollVote.js
import express from 'express';
import dbConnect from '../../../../src/lib/dBconnect.js';
import { Post } from '../../../../src/lib/models/Post.js';

const router = express.Router();

// POST /api/posts/pollVote
router.post('/', async (req, res) => {
  try {
    await dbConnect();

    const { postId, userEmail, selectedOption } = req.body;

    if (!postId || !userEmail || !selectedOption) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const post = await Post.findOne({ postId });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const pollOptions = post.content.poll.options;

    // Remove user's previous vote, if any
    for (let option of pollOptions) {
      if (option.voters?.includes(userEmail)) {
        option.votes = Math.max(0, option.votes - 1); // prevent negative votes
        option.voters = option.voters.filter(email => email !== userEmail);
      }
    }

    // Add vote to the selected option
    const selected = pollOptions.find(o => o.text === selectedOption);
    if (!selected) {
      return res.status(400).json({ error: 'Option not found' });
    }

    selected.votes += 1;
    if (!selected.voters) selected.voters = [];
    selected.voters.push(userEmail);

    await post.save();

    return res.json({ success: true, post });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


// import { NextResponse } from "next/server";
// import { Post } from "../../../src/lib/models/Post";
// import dbConnect from "../../../src/lib/dBconnect";


// export async function POST(req) {
//   try {
//     await dbConnect();

//     const { postId, userEmail, selectedOption } = await req.json();

//     const post = await Post.findOne({ postId });
//     if (!post) {
//       return NextResponse.json({ error: "Post not found" }, { status: 404 });
//     }

//     const pollOptions = post.content.poll.options;

//     // Remove user's previous vote, if any
//     for (let option of pollOptions) {
//       if (option.voters?.includes(userEmail)) {
//         option.votes = Math.max(0, option.votes - 1); // prevent negative
//         option.voters = option.voters.filter(email => email !== userEmail);
//       }
//     }

//     // Add vote to the selected option
//     const selected = pollOptions.find(o => o.text === selectedOption);
//     if (!selected) {
//       return NextResponse.json({ error: "Option not found" }, { status: 400 });
//     }

//     selected.votes += 1;
//     if (!selected.voters) selected.voters = [];
//     selected.voters.push(userEmail);

//     await post.save();

//     return NextResponse.json({ post });

//   } catch (err) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }
