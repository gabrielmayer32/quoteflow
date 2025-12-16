import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { z } from "zod";
import { uploadToR2AndReturnKey, generateFileKey, isR2Configured } from "@/lib/r2";
import { sendNewRequestNotifications } from "@/lib/email";

export const runtime = "nodejs";
// app/api/intake/route.ts
export const maxDuration = 60;             // optional (Vercel/host dependent)
export const dynamic = "force-dynamic";    // optional, if you want to avoid caching behavior

// Increase max upload size for file uploads

const intakeSchema = z.object({
  businessId: z.string().cuid(),
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email("A valid email is required"),
  clientPhone: z.string().min(1, "Phone number is required"),
  clientAddress: z.string().min(1, "Service location is required"),
  problemDesc: z.string().min(10, "Please provide more details about the problem"),
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract form fields
    const rawData = {
      businessId: formData.get("businessId") as string,
      clientName: formData.get("clientName") as string,
      clientEmail: formData.get("clientEmail") as string,
      clientPhone: formData.get("clientPhone") as string,
      clientAddress: formData.get("clientAddress") as string,
      problemDesc: formData.get("problemDesc") as string,
    };

    // Validate form data
    const validation = intakeSchema.safeParse(rawData);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      businessId,
      clientName,
      clientEmail,
      clientPhone,
      clientAddress,
      problemDesc,
    } = validation.data;

    // Verify business exists
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Process uploaded files
    const files = formData.getAll("files") as File[];
    const mediaUrls: string[] = [];
    const useR2 = isR2Configured();

    if (files.length > 0) {
      if (useR2) {
        for (const file of files) {
          if (file.size > 0) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const key = generateFileKey(file.name, "requests");
            const storedKey = await uploadToR2AndReturnKey(buffer, key, file.type);

            mediaUrls.push(`r2:${storedKey}`);
          }
        }
      } else {
        // Fallback to local storage
        const uploadsDir = join(process.cwd(), "public", "uploads");
        try {
          await mkdir(uploadsDir, { recursive: true });
        } catch (error) {
          // Directory already exists, ignore error
        }

        for (const file of files) {
          if (file.size > 0) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Generate unique filename
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(7);
            const extension = file.name.split(".").pop();
            const filename = `${timestamp}-${randomString}.${extension}`;
            const filepath = join(uploadsDir, filename);

            // Write file to disk
            await writeFile(filepath, buffer);

            // Store relative URL
            mediaUrls.push(`/uploads/${filename}`);
          }
        }
      }
    }

    // Create request in database
    const newRequest = await prisma.request.create({
      data: {
        businessId,
        clientName,
        clientEmail,
        clientPhone,
        clientAddress,
        problemDesc,
        mediaUrls,
        status: "NEW",
      },
    });

    await sendNewRequestNotifications({
      business: {
        name: business.name,
        email: business.email,
      },
      request: {
        id: newRequest.id,
        clientName,
        clientEmail,
        clientPhone,
        clientAddress,
        problemDesc,
      },
    });

    return NextResponse.json({
      success: true,
      requestId: newRequest.id,
      storageType: useR2 ? "r2" : "local",
    });
  } catch (error) {
    console.error("Intake submission error:", error);
    return NextResponse.json(
      { error: "An error occurred while submitting your request" },
      { status: 500 }
    );
  }
}
