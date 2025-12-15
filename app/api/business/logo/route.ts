import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { uploadToR2AndReturnKey, generateFileKey, isR2Configured, deleteFromR2 } from "@/lib/r2";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("logo") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP images are allowed." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    const businessId = session.user.id;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const useR2 = isR2Configured();

    let logoRef: string;

    if (useR2) {
      // Upload to R2 and store as r2:key
      const key = generateFileKey(file.name, "logos");
      const storedKey = await uploadToR2AndReturnKey(buffer, key, file.type);
      logoRef = `r2:${storedKey}`;
    } else {
      // Fallback to local storage
      const uploadsDir = join(process.cwd(), "public", "uploads", "logos");
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (error) {
        // Directory already exists, ignore error
      }

      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const extension = file.name.split(".").pop();
      const filename = `${businessId}-${timestamp}-${randomString}.${extension}`;
      const filepath = join(uploadsDir, filename);

      await writeFile(filepath, buffer);
      logoRef = `/uploads/logos/${filename}`;
    }

    // Get current business to check for existing logo
    const currentBusiness = await prisma.business.findUnique({
      where: { id: businessId },
      select: { logoUrl: true },
    });

    // Delete old logo if exists
    if (currentBusiness?.logoUrl) {
      try {
        if (currentBusiness.logoUrl.startsWith("r2:")) {
          // Extract key from r2:key format
          const oldKey = currentBusiness.logoUrl.slice(3);
          await deleteFromR2(oldKey);
        } else if (currentBusiness.logoUrl.startsWith("/uploads/")) {
          const oldPath = join(process.cwd(), "public", currentBusiness.logoUrl);
          await unlink(oldPath).catch(() => {}); // Ignore errors if file doesn't exist
        }
      } catch (error) {
        console.error("Error deleting old logo:", error);
        // Continue even if deletion fails
      }
    }

    // Update business with new logo reference
    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: { logoUrl: logoRef },
      select: {
        id: true,
        logoUrl: true,
      },
    });

    return NextResponse.json({
      success: true,
      logoUrl: updatedBusiness.logoUrl,
      storageType: useR2 ? "r2" : "local",
    });
  } catch (error) {
    console.error("Logo upload error:", error);
    return NextResponse.json(
      { error: "An error occurred while uploading the logo" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const businessId = session.user.id;
    const useR2 = isR2Configured();

    // Get current business
    const currentBusiness = await prisma.business.findUnique({
      where: { id: businessId },
      select: { logoUrl: true },
    });

    if (!currentBusiness?.logoUrl) {
      return NextResponse.json(
        { error: "No logo to delete" },
        { status: 404 }
      );
    }

    // Delete file from storage
    try {
      if (currentBusiness.logoUrl.startsWith("r2:")) {
        const key = currentBusiness.logoUrl.slice(3);
        await deleteFromR2(key);
      } else if (currentBusiness.logoUrl.startsWith("/uploads/")) {
        const filepath = join(process.cwd(), "public", currentBusiness.logoUrl);
        await unlink(filepath).catch(() => {}); // Ignore errors if file doesn't exist
      }
    } catch (error) {
      console.error("Error deleting logo file:", error);
      // Continue even if deletion fails
    }

    // Update business to remove logo URL
    await prisma.business.update({
      where: { id: businessId },
      data: { logoUrl: null },
    });

    return NextResponse.json({
      success: true,
      message: "Logo deleted successfully",
    });
  } catch (error) {
    console.error("Logo deletion error:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the logo" },
      { status: 500 }
    );
  }
}
