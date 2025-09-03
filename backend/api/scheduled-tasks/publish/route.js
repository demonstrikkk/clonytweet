// app/api/scheduled-tasks/publish/route.js
import { ScheduledPost } from "../../../src/lib/models/ScheduledPost";
import { Post } from "../../../src/lib/models/Post";
import dbConnect from "../../../src/lib/dBconnect";


export const runtime = "nodejs"; // Needed for Vercel Serverless

export async function GET() {
  try {
    await dbConnect();

    const now = new Date();
    const duePosts = await ScheduledPost.find({ scheduledFor: { $lte: now } });

    for (const post of duePosts) {
      const { _id, scheduledFor, __v, ...postData } = post.toObject();
      await Post.create(postData);
      await ScheduledPost.findByIdAndDelete(_id);
    }

    return Response.json({ success: true, published: duePosts.length });
  } catch (err) {
    console.error("❌ Failed to import.meta scheduled posts:", err.message);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
