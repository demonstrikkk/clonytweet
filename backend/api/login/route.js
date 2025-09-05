import { Router } from "express";
import dbConnect from "../../../src/lib/dBconnect.js";
import UserProfile from "../../../src/lib/models/UserProfile.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    await dbConnect();

    const { username, password } = req.body; // ✅ Express parses JSON automatically

    if (!username || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    const user = await UserProfile.findOne({ username }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    console.log("Stored password:", user.password);

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    return res.status(200).json({
      message: "Login successful",
      user: {
        email: user.email,
        username: user.username,
        userrealname: user.userrealname,
        avatar: user.profile?.avatar || "",
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;





// import dbConnect from "../../src/lib/dBconnect";
// import UserProfile from "../../src/lib/models/UserProfile";

// import { NextResponse } from "next/server";


// export async function POST(req) {
//   try {
//     await dbConnect();

//     const { username, password } = await req.json();  // ✅ expect flat body
    
    
//     if (!username || !password) {
//         return NextResponse.json({ message: "Missing credentials" }, { status: 400 });
//     }
    
//     const user = await UserProfile.findOne({ username }).select('+password');
    
//     if (!user) {
//         return NextResponse.json({ message: "User not found" }, { status: 401 });
//     }
//     ("Stored password:", user.password);

//     if (user.password !== password) {
//       return NextResponse.json({ message: "Invalid password" }, { status: 401 });
//     }
 

//     return NextResponse.json({
//       message: "Login successful",
//       user: {
//         email: user.email,
//         username: user.username,
//         userrealname: user.userrealname,
//         avatar: user.profile?.avatar || "",
//         role: user.role,
//       },
//     });
//   } catch (err) {
//     return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
//   }
// }



