// server/routes/postsRetweet.js
import express from 'express';
import dbConnect from '../../../../src/lib/dBconnect.js';
import { Post } from '../../../../src/lib/models/Post.js';
import UserProfile from '../../../../src/lib/models/UserProfile.js';
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
      post.retweet.users = post.retweet.users.filter(u => u !== userEmail);
      post.retweet.count -= 1;
    } else {
      post.retweet.users.push(userEmail);
      post.retweet.count += 1;

      if (post.userEmail !== userEmail) {
        await createNotification({
          userEmail: post.userEmail,      // post owner (receiver)
          fromUserEmail: userEmail,       // person who retweeted
          type: 'retweet',
          postId: post.postId,
        });
      }
    }

    await post.save();

    // Add user info
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
      retweetByCurrentUser: post.retweet.users.includes(userEmail),
    };

    return res.json({ post: enrichedPost });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
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

//     const hasRetweeted = post.retweet.users.includes(userEmail);
//     if (hasRetweeted) {
//       post.retweet.users = post.retweet.users.filter(u => u !== userEmail);
//       post.retweet.count -= 1;
//     } else {
//       post.retweet.users.push(userEmail);
//       post.retweet.count += 1;

// if (post.userEmail !== userEmail) {
//   await createNotification({
//     userEmail: post.userEmail,      // post owner (receiver of notification)
//     fromUserEmail: userEmail,       // person who liked
//     type: "retweet",
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
//       retweetByCurrentUser: post.retweet.users.includes(userEmail)
//     };

//     return NextResponse.json({ post: enrichedPost });

//   } catch (err) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }
