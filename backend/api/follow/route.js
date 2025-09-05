 
import { Router } from "express";
import dbConnect from "../../../src/lib/dBconnect.js";
import UserProfile from "../../../src/lib/models/UserProfile.js";
import redis from "../../src/lib/redis.js";
import { invalidateCache } from "../../../src/lib/cacheInvalidator.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    await dbConnect();

    const { currentUserId, targetUserId } = req.body;

    if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const currentUser = await UserProfile.findById(currentUserId);
    const targetUser = await UserProfile.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ error: "Users not found" });
    }

    const isFollowing = targetUser.followers.includes(currentUserId);

    if (isFollowing) {
      // Unfollow
      targetUser.followers.pull(currentUserId);
    } else {
      // Follow
      targetUser.followers.push(currentUserId);
    }

    await targetUser.save();

    // ✅ Invalidate Redis cache for target user profile
    await invalidateCache(`userprofile:${targetUser.email}`);
    // Optionally: if you're caching currentUser’s followings, clear that too
    await invalidateCache(`userprofile:${currentUser.email}`);

    return res.status(200).json({
      success: true,
      followed: !isFollowing,
      followersCount: targetUser.followers.length,
    });
  } catch (error) {
    console.error("Follow/unfollow error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;




// /* eslint-disable no-undef */
// import { NextResponse } from "next/server";
// import dbConnect from "../../src/lib/dBconnect";
// import UserProfile from "../../src/lib/models/UserProfile";
// import redis from "../../src/lib/redis";
// import { invalidateCache } from "../../src/lib/cacheInvalidator";


// export async function POST(req) {
//   await dbConnect();

//   const { currentUserId, targetUserId } = await req.json();

//   if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
//     return NextResponse.json({ error: "Invalid input" }, { status: 400 });
//   }

//   const currentUser = await UserProfile.findById(email);
//   const targetUser = await UserProfile.findById(targetUserId);

//   if (!currentUser || !targetUser) {
//     return NextResponse.json({ error: "Users not found" }, { status: 404 });
//   }

//   const isFollowing = targetUser.followers.includes(currentUserId);

//   if (isFollowing) {
//     // Unfollow
//     targetUser.followers.pull(currentUserId);
//   } else {
//     // Follow
//     targetUser.followers.push(currentUserId);
//   }

//   await targetUser.save();
//     // ✅ Invalidate Redis cache for target user profile
//   await invalidateCache(`userprofile:${targetUser.email}`);
//   // Optionally: if you're caching currentUser’s followings, clear that too
//   await invalidateCache(`userprofile:${currentUser.email}`);

//   return NextResponse.json({
//     success: true,
//     followed: !isFollowing,
//     followersCount: targetUser.followers.length,
//   });
// }
