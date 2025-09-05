import { Router } from "express";
import dbConnect from "../../../../src/lib/dBconnect.js";
import UserProfile from "../../../../src/lib/models/UserProfile.js";

const router = Router();

// GET /api/verify-user?email=<email>
router.get("/", async (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required"
    });
  }

  try {
    await dbConnect();

    const user = await UserProfile.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        userExists: false,
        verified: false,
        user: null
      });
    }

    const isVerified = user.checkpoint === "verified";

    return res.status(200).json({
      success: true,
      userExists: true,
      verified: isVerified,
      user: {
        username: user.username,
        email: user.email,
        avatar: user.profile?.avatar || null,
        name: user.userrealname || ""
      }
    });

  } catch (error) {
    console.error("[VERIFY USER ERROR]", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

export default router;



// import dbConnect from '../../../../src/lib/dBconnect';
// import UserProfile from '../../../../src/lib/models/UserProfile';

// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const email = searchParams.get('email');

//   if (!email) {
//     return new Response(
//       JSON.stringify({ success: false, message: 'Email is required' }),
//       { status: 400 }
//     );
//   }

//   try {
//     await dbConnect();

//     const user = await UserProfile.findOne({ email });

//     if (!user) {
//       return new Response(
//         JSON.stringify({
//           success: true,
//           userExists: false,
//           verified: false,
//           user: null
//         }),
//         { status: 200 }
//       );
//     }

//     const isVerified = user.checkpoint === 'verified';

//     return new Response(
//       JSON.stringify({
//         success: true,
//         userExists: true,
//         verified: isVerified,
//         user: {
//           username: user.username,
//           email: user.email,
//           avatar: user.profile?.avatar || null,
//           name: user.userrealname || ''
//         }
//       }),
//       { status: 200 }
//     );

//   } catch (error) {
//     console.error('[VERIFY USER ERROR]', error);
//     return new Response(
//       JSON.stringify({ success: false, message: 'Server error' }),
//       { status: 500 }
//     );
//   }
// }






// import dbConnect from '../../../src/lib/dBconnect';
// import UserProfile from '../../../src/lib/models/UserProfile';


// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const email = searchParams.get('email');

//   if (!email) {
//     return new Response(JSON.stringify({ success: false, message: 'Email is required' }), { status: 400 });
//   }

//   try {
//     await dbConnect();
//     const user = await UserProfile.findOne({ email });

//     if (!user) {
//       return new Response(JSON.stringify({
//         success: true,
//         userExists: false,
//         verified: false,
//         user: null
//       }), { status: 200 });
//     }

//     const isVerified = user.checkpoint === 'verified';

//     return new Response(JSON.stringify({
//       success: true,
//       userExists: true,
//       verified: isVerified,
//       user: {
//         username: user.username,
//         email: user.email,
//         avatar: user.profile?.avatar,
//         name: user.userrealname
//       }
//     }), { status: 200 });

//   } catch (error) {
//     console.error('[VERIFY USER ERROR]', error);
//     return new Response(JSON.stringify({ success: false, message: 'Server error' }), { status: 500 });
//   }
// }
