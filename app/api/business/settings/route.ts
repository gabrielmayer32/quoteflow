import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const settingsSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = settingsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, phone, address } = validation.data;

    // Update business settings
    const updatedBusiness = await prisma.business.update({
      where: { id: session.user.id },
      data: {
        name,
        phone,
        address: address || null,
      },
    });

    return NextResponse.json({
      success: true,
      business: {
        id: updatedBusiness.id,
        name: updatedBusiness.name,
        phone: updatedBusiness.phone,
        address: updatedBusiness.address,
      },
    });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
