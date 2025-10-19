import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("token");

    return Response.json({ 
      success: true, 
      message: "Logged out successfully", 
      redirectTo: "/login" 
    });
  } catch (e) {
    console.error("Logout error:", e);
    return Response.json({ 
      success: false, 
      error: "Logout failed" 
    }, { status: 500 });
  }
}