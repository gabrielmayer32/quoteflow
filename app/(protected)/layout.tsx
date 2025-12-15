import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { redirect } from "next/navigation";

// Force Node.js runtime for Prisma compatibility
export const runtime = "nodejs";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const business = await prisma.business.findUnique({
    where: { id: session.user.id },
    select: { name: true, logoUrl: true },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        businessName={business?.name}
        logoUrl={business?.logoUrl ?? undefined}
      />
      <main className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
