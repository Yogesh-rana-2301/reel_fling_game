import { NextResponse } from "next/server";

// Tell Next.js this route is dynamic
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "hCaptcha token is required" },
        { status: 400 }
      );
    }

    const secret = process.env.HCAPTCHA_SECRET;

    if (!secret) {
      console.error("Missing HCAPTCHA_SECRET environment variable");
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 }
      );
    }

    // Verify the token with hCaptcha's verification endpoint
    const verificationUrl = "https://hcaptcha.com/siteverify";
    const formData = new URLSearchParams();
    formData.append("secret", secret);
    formData.append("response", token);

    const response = await fetch(verificationUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (data.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "hCaptcha verification failed",
          errors: data["error-codes"],
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error verifying hCaptcha:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
