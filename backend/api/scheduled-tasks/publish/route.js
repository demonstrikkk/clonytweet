// server/routes/scheduledTasks.js
import express from 'express';
import dbConnect from '../../../../src/lib/dBconnect.js';
import { ScheduledPost } from '../../../../src/lib/models/ScheduledPost.js';
import { Post } from '../../../../src/lib/models/Post.js';

const router = express.Router();

// GET /api/scheduled-tasks/publish
router.get('/publish', async (req, res) => {
  try {
    await dbConnect();

    const now = new Date();
    const duePosts = await ScheduledPost.find({ scheduledFor: { $lte: now } });

    for (const post of duePosts) {
      const { _id, scheduledFor, __v, ...postData } = post.toObject();
      await Post.create(postData);
      await ScheduledPost.findByIdAndDelete(_id);
    }

    return res.json({ success: true, published: duePosts.length });
  } catch (err) {
    console.error("❌ Failed to publish scheduled posts:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;




// // app/api/scheduled-tasks/publish/route.js
// import { ScheduledPost } from "../../../src/lib/models/ScheduledPost";
// import { Post } from "../../../src/lib/models/Post";
// import dbConnect from "../../../src/lib/dBconnect";


// export const runtime = "nodejs"; // Needed for Vercel Serverless

// export async function GET() {
//   try {
//     await dbConnect();

//     const now = new Date();
//     const duePosts = await ScheduledPost.find({ scheduledFor: { $lte: now } });

//     for (const post of duePosts) {
//       const { _id, scheduledFor, __v, ...postData } = post.toObject();
//       await Post.create(postData);
//       await ScheduledPost.findByIdAndDelete(_id);
//     }

//     return Response.json({ success: true, published: duePosts.length });
//   } catch (err) {
//     console.error("❌ Failed to import.meta scheduled posts:", err.message);
//     return Response.json({ success: false, error: err.message }, { status: 500 });
//   }
// }
