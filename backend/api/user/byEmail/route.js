// server/routes/getUserByEmail.js
import express from 'express';
import dbConnect from '../../../../src/lib/dBconnect.js';
import UserProfile from '../../../../src/lib/models/UserProfile.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    await dbConnect();

    const user = await UserProfile.findOne({ email }).lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      username: user.username || '',
      userrealname: user.userrealname || '',
      avatar: user.profile?.avatar || '',
    });

  } catch (err) {
    console.error('Get user by email error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;




// // app/api/user/byEmail/route.js
// import { NextResponse } from 'next/server';
// import dbConnect from '../../../src/lib/dBconnect';
// import UserProfile from '../../../src/lib/models/UserProfile';


// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const email = searchParams.get('email');

//   if (!email) {
//     return NextResponse.json({ error: 'Email required' }, { status: 400 });
//   }

//   await dbConnect();
//   const user = await UserProfile.findOne({ email }).lean();

//   if (!user) {
//     return NextResponse.json({ error: 'User not found' }, { status: 404 });
//   }

//   return NextResponse.json({
//     username: user.username || '',
//     userrealname: user.userrealname || '',
//     avatar: user.profile?.avatar || '',
//   });
// }
