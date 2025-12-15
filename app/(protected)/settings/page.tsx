import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/settings/SettingsForm";

export const runtime = "nodejs";

export default async function SettingsPage() {
  const session = await auth();
  const businessId = session!.user.id;

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      address: true,
      logoUrl: true,
    },
  });

  if (!business) {
    throw new Error("Business not found");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Business Settings</h1>
        <p className="text-gray-600 mt-1">Manage your business profile and preferences</p>
      </div>

      {/* Settings Form */}
      <SettingsForm business={business} />
    </div>
  );
}
