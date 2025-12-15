import { NextRequest, NextResponse } from "next/server";
import { getPublicR2Url, getSignedR2Url, isR2Configured } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { refs } = (await req.json()) as { refs: string[] };

    if (!Array.isArray(refs)) {
      return NextResponse.json({ error: "refs must be an array" }, { status: 400 });
    }

    const useSigned = process.env.R2_USE_SIGNED_URLS === "true";

    const urls = await Promise.all(
      refs.map(async (ref) => {
        // pass-through for local files
        if (typeof ref !== "string") return null;
        if (!ref.startsWith("r2:")) return ref;

        const key = ref.slice(3);
        if (!isR2Configured()) return null;

        // private bucket => signed
        if (useSigned) return await getSignedR2Url(key, 60 * 10);

        // public bucket/custom domain => direct
        return getPublicR2Url(key);
      })
    );

    // DO NOT filter nulls here, keep index alignment
    return NextResponse.json({ urls });
  } catch (e) {
    console.error("media-url error:", e);
    return NextResponse.json({ error: "Failed to resolve media URLs" }, { status: 500 });
  }
}
