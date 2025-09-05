import { Router } from "express";
import dbConnect from "../../../../src/lib/dBconnect.js";
import UserProfile from "../../../../src/lib/models/UserProfile.js";
import { invalidateCache } from "../../../../src/lib/cacheInvalidator.js";
import { createNotification } from "../../../../src/lib/createNotification.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    await dbConnect();

    const { targetEmail, viewerEmail } = req.body;

    if (!targetEmail || !viewerEmail || targetEmail === viewerEmail) {
      return res.status(400).json({ error: "Invalid request" });
    }

    const viewer = await UserProfile.findOne({ email: viewerEmail });
    const target = await UserProfile.findOne({ email: targetEmail });

    if (!viewer || !target) {
      return res.status(404).json({ error: "User not found" });
    }

    // Ensure default structure exists
    target.followers = target.followers || { users: [], count: 0 };
    viewer.following = viewer.following || { users: [], count: 0 };

    const isFollowing = target.followers.users.includes(viewerEmail);

    if (isFollowing) {
      // Unfollow
      target.followers.users = target.followers.users.filter((u) => u !== viewerEmail);
      target.followers.count = Math.max(0, target.followers.count - 1);

      viewer.following.users = viewer.following.users.filter((u) => u !== targetEmail);
      viewer.following.count = Math.max(0, viewer.following.count - 1);
    } else {
      // Follow
      if (!target.followers.users.includes(viewerEmail)) {
        target.followers.users.push(viewerEmail);
        target.followers.count += 1;
      }

      if (!viewer.following.users.includes(targetEmail)) {
        viewer.following.users.push(targetEmail);
        viewer.following.count += 1;
      }

      // ✅ Fire notification on new follow
      await createNotification({
        userEmail: targetEmail,     // receiver of the notification
        fromUserEmail: viewerEmail, // actor who followed
        type: "follow",
      });
    }

    await target.save();
    await viewer.save();

    // ✅ Invalidate caches
    await invalidateCache(`userprofile:${targetEmail}`);
    await invalidateCache(`userprofile:${viewerEmail}`);

    return res.status(200).json({
      following: !isFollowing,
      newFollowerCount: target.followers.count,
      viewerNewFollowingCount: viewer.following.count,
    });
  } catch (error) {
    console.error("Follow API error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;





// import { NextResponse } from "next/server";
// import dbConnect from "../../../src/lib/dBconnect";
// import UserProfile from "../../../src/lib/models/UserProfile";
// import { invalidateCache } from "../../../src/lib/cacheInvalidator";
// import { createNotification } from "../../../src/lib/createNotification";


// export async function POST(req) {
//   await dbConnect();

//   const { targetEmail, viewerEmail } = await req.json();

//   if (!targetEmail || !viewerEmail || targetEmail === viewerEmail) {
//     return NextResponse.json({ error: "Invalid request" }, { status: 400 });
//   }

//   const viewer = await UserProfile.findOne({ email: viewerEmail });
//   const target = await UserProfile.findOne({ email: targetEmail });

//   if (!viewer || !target) {
//     return NextResponse.json({ error: "User not found" }, { status: 404 });
//   }

//   // Ensure default structure exists
//   target.followers = target.followers || { users: [], count: 0 };
//   viewer.following = viewer.following || { users: [], count: 0 };

//   const isFollowing = target.followers.users.includes(viewerEmail);

// if (isFollowing) {
//     // Unfollow
//     target.followers.users = target.followers.users.filter(u => u !== viewerEmail);
//     target.followers.count = Math.max(0, target.followers.count - 1);
    
//     viewer.following.users = viewer.following.users.filter(u => u !== targetEmail);
//     viewer.following.count = Math.max(0, viewer.following.count - 1);
// } else {
//     // Follow
//     if (!target.followers.users.includes(viewerEmail)) {
//         target.followers.users.push(viewerEmail);
//         target.followers.count += 1;
//     }
    
//     if (!viewer.following.users.includes(targetEmail)) {
//         viewer.following.users.push(targetEmail);
//         viewer.following.count += 1;
//     }
//     await createNotification({
//   userEmail: targetEmail,          // receiver of the notification
//   fromUserEmail: viewerEmail,      // actor who followed
//   type: "follow",
// });

// }

// await target.save();
// await viewer.save();

//   await invalidateCache(`userprofile:${targetEmail}`);
//   await invalidateCache(`userprofile:${viewerEmail}`);

// return NextResponse.json({
//     following: !isFollowing,
//     newFollowerCount: target.followers.count,
//     viewerNewFollowingCount: viewer.following.count
// });
// }