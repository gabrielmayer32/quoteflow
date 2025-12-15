"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

interface RequestFiltersProps {
  currentStatus?: string;
  stats: {
    NEW: number;
    REVIEWING: number;
    QUOTED: number;
    APPROVED: number;
  };
}

const filters = [
  { value: "ALL", label: "All Requests", color: "gray" },
  { value: "NEW", label: "New", color: "blue" },
  { value: "REVIEWING", label: "Reviewing", color: "yellow" },
  { value: "QUOTED", label: "Quoted", color: "purple" },
  { value: "APPROVED", label: "Approved", color: "green" },
  { value: "REJECTED", label: "Rejected", color: "red" },
  { value: "SCHEDULED", label: "Scheduled", color: "indigo" },
  { value: "COMPLETED", label: "Completed", color: "gray" },
];

export function RequestFilters({ currentStatus = "ALL", stats }: RequestFiltersProps) {
  const pathname = usePathname();

  const getCount = (status: string): number | undefined => {
    if (status === "ALL") return undefined;
    return stats[status as keyof typeof stats];
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {filters.map((filter) => {
          const isActive = currentStatus === filter.value;
          const count = getCount(filter.value);

          return (
            <Link
              key={filter.value}
              href={`${pathname}${filter.value !== "ALL" ? `?status=${filter.value}` : ""}`}
              className="flex-shrink-0"
            >
              <Button
                variant={isActive ? "default" : "outline"}
                size="sm"
                className="whitespace-nowrap"
              >
                {filter.label}
                {count !== undefined && count > 0 && (
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
