// server/routes/userProfiles.js
import express from 'express';
import dbConnect from '../../../src/lib/dBconnect.js';
import UserProfile from '../../../src/lib/models/UserProfile.js';

const router = express.Router();

// POST /api/user/profiles
router.post('/', async (req, res) => {
  try {
    const { peers } = req.body;

    if (!Array.isArray(peers) || peers.length === 0) {
      return res.status(400).json({ error: 'peers array is required' });
    }

    await dbConnect();
    const profiles = await UserProfile.find({ email: { $in: peers } }).lean();

    res.json(profiles);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

export default router;



// import dbConnect from "../../src/lib/dBconnect";
// import UserProfile from "../../src/lib/models/UserProfile";


// export async function POST(req) {
//   try {
//     const { peers } = await req.json();
//     await dbConnect();
//     const profiles = await UserProfile.find({ email: { $in: peers } }).lean();
//     return Response.json(profiles);
//   } catch (err) {
//     return Response.json([], { status: 500 });
//   }
// }
