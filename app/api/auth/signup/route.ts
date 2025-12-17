import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sendEmailVerification } from "@/lib/email";
import crypto from "crypto";

// Force Node.js runtime for Prisma compatibility
export const runtime = "nodejs";

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  businessName: z.string().min(1, "Business name is required"),
  phone: z.string().min(1, "Phone number is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, businessName, phone } = validation.data;

    // Check if business already exists
    const existingBusiness = await prisma.business.findUnique({
      where: { email },
    });

    if (existingBusiness) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); // 24 hours from now

    // Create business
    const business = await prisma.business.create({
      data: {
        email,
        passwordHash,
        name: businessName,
        phone,
        emailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpiry: tokenExpiry,
      },
    });

    // Send verification email
    try {
      await sendEmailVerification({
        email,
        businessName,
        verificationToken,
      });
    } catch (error) {
      console.error("Failed to send verification email:", error);
      // Don't fail signup if email fails to send
    }

    return NextResponse.json({
      success: true,
      businessId: business.id,
      message: "Account created! Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An error occurred during signup" },
      { status: 500 }
    );
  }
}
