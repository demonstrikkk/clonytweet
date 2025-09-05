// server/routes/schedule.js
import express from 'express';
import dbConnect from '../../../../src/lib/dBconnect.js';
import { ScheduledPost } from '../../../../src/lib/models/ScheduledPost.js';

const router = express.Router();

// PUT /api/schedule/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const body = req.body;

  try {
    await dbConnect();

    const updated = await ScheduledPost.findOneAndUpdate(
      { postId: id },
      { ...body },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Not found" });
    }

    return res.json({ success: true, updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/schedule/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await dbConnect();
    await ScheduledPost.findOneAndDelete({ postId: id });

    return res.json({ success: true, message: "Scheduled post deleted." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;



// // app/api/schedule/[id]/route.js
// import { ScheduledPost } from "../../../src/lib/models/ScheduledPost";
// import dbConnect from "../../../src/lib/dBconnect";


// export async function PUT(req, { params }) {
//   const body = await req.json();
//   await dbConnect();

//   const updated = await ScheduledPost.findOneAndUpdate(
//     { postId: params.id },
//     { ...body },
//     { new: true }
//   );

//   if (!updated) {
//     return Response.json({ error: "Not found" }, { status: 404 });
//   }

//   return Response.json({ success: true, updated });
// }

// export async function DELETE(_, { params }) {
//   await dbConnect();
//   await ScheduledPost.findOneAndDelete({ postId: params.id });

//   return Response.json({ success: true, message: "Scheduled post deleted." });
// }
