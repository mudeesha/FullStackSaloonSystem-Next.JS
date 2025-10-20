// Let's create a simple debug endpoint to test the token
// app/api/auth/debug/route.ts
import { NextResponse } from "next/server"
import { verifyJwt } from "@/lib/auth-edge"

export async function GET(request: Request) {
  try {
    const token = request.headers.get("cookie")?.match(/token=([^;]+)/)?.[1]
    
    if (!token) {
      return NextResponse.json({ error: "No token found" })
    }

    console.log("Token:", token)
    console.log("Token length:", token.length)
    
    // Try to manually decode the JWT to see the structure
    try {
      const parts = token.split('.')
      if (parts.length === 3) {
        const header = JSON.parse(Buffer.from(parts[0], 'base64').toString())
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
        console.log("JWT Header:", header)
        console.log("JWT Payload:", payload)
        
        return NextResponse.json({
          tokenExists: true,
          tokenLength: token.length,
          header,
          payload,
          verifyJwtResult: await verifyJwt(token)
        })
      }
    } catch (decodeError) {
      console.log("Manual decode error:", decodeError)
      return NextResponse.json({ 
        error: "Token decode failed",
        decodeError: decodeError.message 
      })
    }

    return NextResponse.json({ error: "Unexpected token format" })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({ error: "Debug failed" })
  }
}