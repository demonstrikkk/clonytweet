// server/routes/postsRetweet.js
import express from 'express';
import dbConnect from '../../../../src/lib/dBconnect.js';
import { Post } from '../../../../src/lib/models/Post.js';
import { createNotification } from '../../../../src/lib/createNotification.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    await dbConnect();
    const { postId, userEmail } = req.body;

    if (!postId || !userEmail) {
      return res.status(400).json({ error: 'postId and userEmail are required' });
    }

    const post = await Post.findOne({ postId });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const hasRetweeted = post.retweet.users.includes(userEmail);

    if (hasRetweeted) {
      // Remove user from retweet list
      post.retweet.users = post.retweet.users.filter(email => email !== userEmail);
    } else {
      // Add user to retweet list
      post.retweet.users.push(userEmail);

      if (post.userEmail !== userEmail) {
        await createNotification({
          userEmail: post.userEmail,      // post owner (receiver)
          fromUserEmail: userEmail,       // person who retweeted
          type: 'retweet',
          postId: post.postId,
        });
      }
    }

    // Update retweet count
    post.retweet.count = post.retweet.users.length;
    await post.save();

    return res.json({
      message: hasRetweeted ? 'Unretweet' : 'Retweet',
      retweeted: !hasRetweeted,
      newCount: post.retweet.count,
      retweetUsers: post.retweet.users,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
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

//   const hasRetweeted = post.retweet.users.includes(userEmail);

//   if (hasRetweeted) {
//     // Unlike: remove userEmail
//     post.retweet.users = post.retweet.users.filter(email => email !== userEmail);
//   } else {
//     // Like: add userEmail
//     post.retweet.users.push(userEmail);
//     if (post.userEmail !== userEmail) {
//       await createNotification({
//         userEmail: post.userEmail,      // post owner (receiver of notification)
//         fromUserEmail: userEmail,       // person who liked
//         type: "retweet",
//         postId: post.postId,
//       });
//     }
//   }

//   // Update like count
//   post.retweet.count = post.retweet.users.length;
//   await post.save();

//   return NextResponse.json({
//     message: hasRetweeted ? "Unretweet" : "retweet",
//     retweeted: !hasRetweeted,
//     newCount: post.retweet.count,
//     retweetUsers: post.retweet.users,
//   });
// }
