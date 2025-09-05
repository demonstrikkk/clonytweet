/* eslint-disable no-undef */
import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "No email provided" });
    }

    // ✅ Sign a custom Supabase JWT with your service role key
    const token = jwt.sign(
      {
        sub: email,
        email,
        role: "authenticated",
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
      },
      process.env.SUPABASE_JWT_SECRET // 🔑 use process.env in Node
    );

    return res.status(200).json({ token });
  } catch (err) {
    console.error("JWT generation error:", err);
    return res.status(500).json({ error: "Unexpected error" });
  }
});

export default router;



// // import { createServerClient } from '@supabase/ssr';
// import jwt from 'jsonwebtoken';


// export async function POST(req) {
//   try {
//     const { email } = await req.json();

//     if (!email) {
//       return new Response(JSON.stringify({ error: 'No email provided' }), { status: 400 });
//     }

//     // Sign a custom Supabase JWT with your service role key
//     const token = jwt.sign(
//       {
//         sub: email,
//         email,
//         role: 'authenticated',
//         exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
//       },
//       import.meta.env.SUPABASE_JWT_SECRET
//     );

//     return new Response(JSON.stringify({ token }), { status: 200 });
//   } catch (err) {
//     return new Response(JSON.stringify({ error: 'Unexpected error' }), { status: 500 });
//   }
// }


