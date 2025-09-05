import { Router } from "express";
import dbConnect from "../../../src/lib/dBconnect.js";
import { Notification } from "../../../src/lib/models/Notification.js";
import UserProfile from "../../../src/lib/models/UserProfile.js";
import { Post } from "../../../src/lib/models/Post.js";
import redis from "../../../src/lib/redis.js"; // ✅ Import Redis

const router = Router();

router.get("/", async (req, res) => {
  try {
    await dbConnect();

    const userEmail = (req.query.userEmail || req.query.email || "").toLowerCase();
    if (!userEmail) {
      return res.status(400).json({ error: "userEmail missing" });
    }

    const cacheKey = `notifications:${userEmail}`;

    // ✅ Check Redis cache first
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.status(200).json({ notifications: JSON.parse(cached) });
      }
    } catch (err) {
      console.error("Redis get error:", err);
    }

    // ✅ Fetch notifications from DB
    const notifications = await Notification.find({ userEmail }).sort({ createdAt: -1 });

    // ✅ Enrich notifications with user + post data
    const enriched = await Promise.all(
      notifications.map(async (notif) => {
        const fromUser = await UserProfile.findOne({ email: notif.fromUserEmail }).lean();

        let postPreview = null;
        if (notif.postId) {
          const post = await Post.findOne({ postId: notif.postId }).lean();
          postPreview = post?.content?.text || "[Media Post]";
        }

        return {
          ...notif.toObject(),
          fromUsername: fromUser?.username || "Unknown",
          fromAvatar: fromUser?.profile?.avatar || "/default-avatar.png",
          postPreview,
        };
      })
    );

    // ✅ Cache enriched result for 5 minutes
    try {
      await redis.set(cacheKey, JSON.stringify(enriched), "EX", 300);
    } catch (err) {
      console.error("Redis set error:", err);
    }

    return res.status(200).json({ notifications: enriched });
  } catch (err) {
    console.error("Notification route error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
});

export default router;



// import { NextResponse } from "next/server";
// import dbConnect from "../../src/lib/dBconnect";
// import { Notification } from "../../src/lib/models/Notification";
// import UserProfile from "../../src/lib/models/UserProfile";
// import { Post } from "../../src/lib/models/Post";
// import redis from "../../src/lib/redis"; // ✅ Import Redis


// export async function GET(req) {
//   try {
//     await dbConnect();
//     const { searchParams } = new URL(req.url);
//     const userEmail = searchParams.get("userEmail") || searchParams.get("email");

//     if (!userEmail) {
//       return NextResponse.json({ error: "userEmail missing" }, { status: 400 });
//     }

//     const cacheKey = `notifications:${userEmail}`;
    
//     // ✅ Check Redis cache first
//     const cached = await redis.get(cacheKey);
//     if (cached) {
//       return NextResponse.json({ notifications: JSON.parse(cached) });
//     }

//     const notifications = await Notification.find({ userEmail }).sort({ createdAt: -1 });

//     const enriched = await Promise.all(
//       notifications.map(async (notif) => {
//         const fromUser = await UserProfile.findOne({ email: notif.fromUserEmail }).lean();

//         let postPreview = null;
//         if (notif.postId) {
//           const post = await Post.findOne({ postId: notif.postId }).lean();
//           postPreview = post?.content?.text || "[Media Post]";
//         }

//         return {
//           ...notif.toObject(),
//           fromUsername: fromUser?.username || "Unknown",
//           fromAvatar: fromUser?.profile?.avatar || "/default-avatar.png",
//           postPreview,
//         };
//       })
//     );

//     // ✅ Cache enriched result for 5 minutes
//     await redis.set(cacheKey, JSON.stringify(enriched), 'EX', 300);

//     return NextResponse.json({ notifications: enriched });
//   } catch (err) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }
