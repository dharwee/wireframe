import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// POST /api/user
export async function POST(req: NextRequest) {
  try {
    const { userEmail, userName } = await req.json();

    console.log("API /api/user called with:", userEmail, userName);

    if (!userEmail || !userName) {
      return NextResponse.json(
        { error: "Missing email or name" },
        { status: 400 }
      );
    }

   
    const { data: existingUsers, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("email", userEmail)
      .limit(1);

    if (fetchError) throw fetchError;

    if (!existingUsers || existingUsers.length === 0) {
      // 🔹 Insert new user
      const { data: insertedUsers, error: insertError } = await supabase
        .from("users")
        .insert([
          {
            name: userName,
            email: userEmail,
            credits: 0,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      console.log("Inserted new user:", insertedUsers);
      return NextResponse.json(insertedUsers);
    } else {
      console.log("User already exists:", existingUsers[0]);
      return NextResponse.json(existingUsers[0]);
    }
  } catch (error: any) {
    console.error("Error in /api/user:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
