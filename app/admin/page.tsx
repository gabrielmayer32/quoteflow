"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Business {
  id: string;
  email: string;
  name: string;
  phone: string;
  paymentStatus: "PAID" | "UNPAID";
  emailVerified: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const response = await fetch("/api/admin/payment-status");
      const data = await response.json();
      if (data.success) {
        setBusinesses(data.businesses);
      }
    } catch (error) {
      console.error("Failed to fetch businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePaymentStatus = async (businessId: string, currentStatus: string) => {
    setUpdating(businessId);
    try {
      const newStatus = currentStatus === "PAID" ? "UNPAID" : "PAID";
      const response = await fetch("/api/admin/payment-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, paymentStatus: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        // Update local state
        setBusinesses((prev) =>
          prev.map((b) =>
            b.id === businessId ? { ...b, paymentStatus: newStatus as "PAID" | "UNPAID" } : b
          )
        );
      }
    } catch (error) {
      console.error("Failed to update payment status:", error);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Business Payment Management
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Toggle payment status for businesses
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email Verified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {businesses.map((business) => (
                  <tr key={business.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {business.name}
                      </div>
                      <div className="text-sm text-gray-500">{business.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{business.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {business.emailVerified ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {business.paymentStatus === "PAID" ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          PAID
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          UNPAID
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(business.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => togglePaymentStatus(business.id, business.paymentStatus)}
                        disabled={updating === business.id}
                        className={`px-3 py-1 rounded font-medium transition-colors ${
                          business.paymentStatus === "PAID"
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-green-600 hover:bg-green-700 text-white"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {updating === business.id
                          ? "Updating..."
                          : business.paymentStatus === "PAID"
                          ? "Mark Unpaid"
                          : "Mark Paid"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {businesses.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-500">
              No businesses found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
