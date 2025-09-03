import { NextResponse } from "next/server";
import dbConnect from "../../../src/lib/dBconnect";
import { NewsCache } from "../../../src/lib/models/NewsCache";
import UserProfile from "../../../src/lib/models/UserProfile";


export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) return NextResponse.json({ hasPreferences: false });

  await dbConnect();

  const user = await UserProfile.findOne({ email });

  const hasPreferences = user?.newsPreferences?.length > 0;

  return NextResponse.json({ hasPreferences });
}
