// routes/deleteCollection.js
import express from "express";
import dbConnect from "../../../../src/lib/dBconnect.js";
import { Post } from "../../../../src/lib/models/Post.js";

const router = express.Router();

// DELETE /api/posts/deleteCollection?userEmail=...&collectionName=...
router.delete("/", async (req, res) => {
  try {
    const { userEmail, collectionName } = req.query;

    if (!userEmail || !collectionName) {
      return res.status(400).json({ error: "Missing params" });
    }

    await dbConnect();

    // Step 1: Remove the user from all bookmarks with this collection
    await Post.updateMany(
      { "bookmarks.collectionName": collectionName },
      {
        $pull: {
          "bookmarks.$[elem].users": userEmail,
        },
      },
      {
        arrayFilters: [{ "elem.collectionName": collectionName }],
      }
    );

    // Step 2: Remove bookmark entries where collectionName === target and users array is empty
    const posts = await Post.find({ "bookmarks.collectionName": collectionName });

    for (const post of posts) {
      post.bookmarks = post.bookmarks.filter(b => {
        // Keep bookmark if it's not the target collection OR it has users
        return !(b.collectionName === collectionName && b.users.length === 0);
      });
      await post.save();
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("DELETE /api/posts/deleteCollection error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;






// // DELETE /api/posts/deleteCollection?userEmail=...&collectionName=...
// import { Post } from "../../../src/lib/models/Post";
// import dbConnect from "../../../src/lib/dBconnect";


// export async function DELETE(req) {
//   const { searchParams } = new URL(req.url);
//   const userEmail = searchParams.get("userEmail");
//   const collectionName = searchParams.get("collectionName");

//   if (!userEmail || !collectionName) {
//     return new Response("Missing params", { status: 400 });
//   }

//   await dbConnect();

//   // Step 1: Remove the user from all bookmarks with this collection
//   await Post.updateMany(
//     { "bookmarks.collectionName": collectionName },
//     {
//       $pull: {
//         "bookmarks.$[elem].users": userEmail,
//       },
//     },
//     {
//       arrayFilters: [{ "elem.collectionName": collectionName }],
//     }
//   );

//   // Step 2: Remove bookmark entries where collectionName === target and users array is empty
//   const posts = await Post.find({ "bookmarks.collectionName": collectionName });

//   for (const post of posts) {
//     post.bookmarks = post.bookmarks.filter(b => {
//       // Keep bookmark if it's not the target collection OR it has users
//       return !(b.collectionName === collectionName && b.users.length === 0);
//     });
//     await post.save();
//   }

//   return new Response(JSON.stringify({ success: true }), { status: 200 });
// }
