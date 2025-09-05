// server/routes/createUser.js
import express from 'express';
import dbConnect from '../../../../src/lib/dBconnect.js';
import UserProfile from '../../../../src/lib/models/UserProfile.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.post('/', async (req, res) => {
  await dbConnect();

  try {
    const {
      email,
      name,
      image,
      username,
      password,
      bio,
    } = req.body;

    if (!email || !username || !password || !name) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let user = await UserProfile.findOne({ email });

    if (user) {
      // Update existing user
      user.username = username;
      user.password = password; // TODO: hash in production
      user.userrealname = name;
      user.checkpoint = 'verified';
      user.profile.bio = bio || '';
      user.profile.avatar = image || '';
      user.profile.displayName = name;

      await user.save();
    } else {
      // Create new user
      const newUser = new UserProfile({
        email,
        userId: uuidv4(),
        userrealname: name,
        username,
        password, // TODO: hash in production
        checkpoint: 'verified',
        profile: {
          displayName: name,
          avatar: image || '',
          bio: bio || '',
        },
      });

      await newUser.save();
    }

    return res.status(200).json({ message: 'User saved successfully' });
  } catch (error) {
    console.error('Error in POST /api/users/create-user:', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

export default router;




// import { NextResponse } from 'next/server';
// import dbConnect from '../../../src/lib/dBconnect';
// import UserProfile from '../../../src/lib/models/UserProfile';
// import { v4 as uuidv4 } from 'uuid';


// export async function POST(req) {
//   await dbConnect();
//   // const { data: session, status } = useSession();
//   try {
//     const body = await req.json();
//     const {
//       email,
//       name,
//       image,
//       username,
//       password,
//       bio,
     
//     } = body;


//     let user = await UserProfile.findOne({ email });

//     if (user) {
//       // Update existing user
//       user.username = username;
//       user.password = password; // Hash in production!
//       user.userrealname = name;
//       user.checkpoint = 'verified';
//       user.profile.bio = bio;
//       user.profile.avatar = image;
//       user.profile.displayName = name;
      
      

//       await user.save();
//     } else {
//       // Create new user
//       const newUser = new UserProfile({
//         email,
//         userId: uuidv4(),
//         userrealname: name,
//         username,
//         password,
//         checkpoint: 'verified',
//         profile: {
//           displayName: name,
//           avatar: image,
//           bio,
        
         
//         },
//       });

//       await newUser.save();
//     }

//     return NextResponse.json({ message: 'User saved successfully' }, { status: 200 });
//   } catch (error) {
//     console.error('Error in POST /api/users/create-user:', error);
//     return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
//   }
// }
