import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { IntakeForm } from "@/components/intake/IntakeForm";

export const runtime = "nodejs";

interface IntakePageProps {
  params: Promise<{
    businessId: string;
  }>;
}

export default async function IntakePage({ params }: IntakePageProps) {
  const { businessId } = await params;

  // Verify business exists
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: {
      id: true,
      name: true,
      logoUrl: true,
      phone: true,
    },
  });

  if (!business) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            {business.logoUrl ? (
              <img
                src={business.logoUrl}
                alt={business.name}
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {business.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{business.name}</h1>
              <p className="text-sm text-gray-600">Service Request Form</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-sm border p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Request a Service Quote
            </h2>
            <p className="text-gray-600">
              Fill in the details below and we'll get back to you with a quote as soon as possible.
            </p>
          </div>

          <IntakeForm businessId={businessId} />
        </div>

        {/* Contact Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Need help? Contact us at{" "}
            <a
              href={`tel:${business.phone}`}
              className="text-blue-600 hover:underline font-medium"
            >
              {business.phone}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
