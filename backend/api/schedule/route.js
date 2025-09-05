// server/routes/schedule.js
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import dbConnect from '../../../src/lib/dBconnect.js';
import { ScheduledPost } from '../../../src/lib/models/ScheduledPost.js';

const router = express.Router();

// POST /api/schedule
router.post('/', async (req, res) => {
  const { userEmail, content, scheduledFor } = req.body;

  if (!userEmail || !content || !scheduledFor) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await dbConnect();

    const newScheduled = new ScheduledPost({
      userEmail,
      postId: uuidv4(),
      content,
      scheduledFor: new Date(scheduledFor),
      likes: { count: 0, users: [] },
      retweet: { count: 0, users: [] },
      bookmarks: [],
      comments: [],
      commentCount: 0,
    });

    await newScheduled.save();

    return res.json({ success: true, message: "Post scheduled." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;




// // app/api/schedule/route.js
// import { ScheduledPost } from "../../src/lib/models/ScheduledPost";
// import { v4 as uuidv4 } from "uuid";
// import dbConnect from "../../src/lib/dBconnect";


// export async function POST(req) {
//   const body = await req.json();
//   const { userEmail, content, scheduledFor } = body;

//   await dbConnect();

//   const newScheduled = new ScheduledPost({
//     userEmail,
//     postId: uuidv4(),
//     content,
//     scheduledFor: new Date(scheduledFor),
//     likes: { count: 0, users: [] },
//     retweet: { count: 0, users: [] },
//     bookmarks: [],
//     comments: [],
//     commentCount: 0,
//   });

//   await newScheduled.save();

//   return Response.json({ success: true, message: "Post scheduled." });
// }
