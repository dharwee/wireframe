
// import { NextRequest, NextResponse } from "next/server";
// import { eq } from "drizzle-orm";
// import { db } from "@/configs/db";
// import { usersTable } from "@/configs/schema";

// export async function POST(req: NextRequest) {
//     const { userEmail, userName } = await req.json();

//     // try {
//     const result = await db.select().from(usersTable)
//         .where(eq(usersTable.email, userEmail));

//     if (result?.length == 0) {

//         const result: any = await db.insert(usersTable).values({
//             name: userName,
//             email: userEmail,
//             credits: 0,
//             // @ts-ignore
//         }).returning(usersTable);

//         return NextResponse.json(result[0]);
//     }
//     return NextResponse.json(result[0]);


//     // } catch (e) {
//     //     return NextResponse.json(e)
//     // }
// }


import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/configs/db";
import { usersTable } from "@/configs/schema";

// POST /api/user
export async function POST(req: NextRequest) {
  try {
    const { userEmail, userName } = await req.json();

    console.log("API /api/user called with:", userEmail, userName);

    if (!userEmail || !userName) {
      return NextResponse.json({ error: "Missing email or name" }, { status: 400 });
    }

    // Check if user already exists
    const existingUsers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, userEmail));

    if (existingUsers.length === 0) {
      // Insert new user
      const insertedUsers = await db
        .insert(usersTable)
        .values({
          name: userName,
          email: userEmail,
          credits: 0,
        })
        .returning();

      console.log("Inserted new user:", insertedUsers[0]);
      return NextResponse.json(insertedUsers[0]);
    } else {
      console.log("User already exists:", existingUsers[0]);
      return NextResponse.json(existingUsers[0]);
    }
  } catch (error) {
    console.error("Error in /api/user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
