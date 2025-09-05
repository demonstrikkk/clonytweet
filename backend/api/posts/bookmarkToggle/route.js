// routes/bookmarkToggle.js
import express from "express";
import { Post } from "../../../../src/lib/models/Post.js";
import dbConnect from "../../../../src/lib/dBconnect.js";

const router = express.Router();

// POST /api/bookmarkToggle
router.post("/", async (req, res) => {
  try {
    const { postId, userEmail, collectionName = "default" } = req.body;

    if (!postId || !userEmail) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    await dbConnect();

    const post = await Post.findOne({ postId });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user already bookmarked this post in that collection
    const existing = post.bookmarks.find(
      (b) => b.collectionName === collectionName && b.users.includes(userEmail)
    );

    if (existing) {
      // Remove bookmark
      post.bookmarks = post.bookmarks
        .map((b) => {
          if (b.collectionName === collectionName) {
            return {
              ...b.toObject(),
              users: b.users.filter((email) => email !== userEmail),
            };
          }
          return b;
        })
        .filter((b) => b.users.length > 0);
    } else {
      // Add bookmark
      const collection = post.bookmarks.find((b) => b.collectionName === collectionName);
      if (collection) {
        collection.users.push(userEmail);
      } else {
        post.bookmarks.push({ collectionName, users: [userEmail] });
      }
    }

    await post.save();

    const updatedBookmarks = post.bookmarks;
    const bookmarked = post.bookmarks.some((b) => b.users.includes(userEmail));

    return res.status(200).json({
      success: true,
      bookmarked,
      bookmarks: updatedBookmarks,
    });
  } catch (error) {
    console.error("Error in POST /api/bookmarkToggle:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;




// // app/api/posts/bookmarkToggle/route.js
// import { Post } from '../../../src/lib/models/Post';
// import dbConnect from '../../../src/lib/dBconnect';


// export async function POST(req) {
//   try {
//     const body = await req.json();
//     const { postId, userEmail, collectionName = 'default' } = body;

//     await dbConnect();
//     const post = await Post.findOne({ postId });
//     if (!post) {
//       return new Response(JSON.stringify({ message: 'Post not found' }), { status: 404 });
//     }

//     // Check if user already bookmarked this post in that collection
//     const existing = post.bookmarks.find(
//       b => b.collectionName === collectionName && b.users.includes(userEmail)
//     );

//     let updatedBookmarks;

//     if (existing) {
//       // Remove bookmark
//       post.bookmarks = post.bookmarks.map(b => {
//         if (b.collectionName === collectionName) {
//           return {
//             ...b.toObject(),
//             users: b.users.filter(email => email !== userEmail)
//           };
//         }
//         return b;
//       }).filter(b => b.users.length > 0);
//     } else {
//       // Add bookmark
//       const collection = post.bookmarks.find(b => b.collectionName === collectionName);
//       if (collection) {
//         collection.users.push(userEmail);
//       } else {
//         post.bookmarks.push({ collectionName, users: [userEmail] });
//       }
//     }

//     await post.save();

//     updatedBookmarks = post.bookmarks;
//     const bookmarked = post.bookmarks.some(
//       b => b.users.includes(userEmail)
//     );

//     return new Response(JSON.stringify({
//       success: true,
//       bookmarked,
//       bookmarks: updatedBookmarks
//     }), { status: 200 });

//   } catch (error) {
//     return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
//   }
// }


