"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMediaUrl } from "@/lib/hooks/useMediaUrl";
import { cn } from "@/lib/utils";

interface HeaderProps {
  businessName?: string;
  logoUrl?: string;
}

export function Header({ businessName, logoUrl }: HeaderProps) {
  const resolvedLogoUrl = useMediaUrl(logoUrl);
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Home" },
    { href: "/requests", label: "Requests" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <header className="border-b bg-white sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center space-x-2">
          {resolvedLogoUrl ? (
            <img
              src={resolvedLogoUrl}
              alt={businessName || "Business"}
              className="h-8 w-8 object-contain"
            />
          ) : (
            <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {businessName?.charAt(0) || "F"}
              </span>
            </div>
          )}
          <span className="font-semibold text-lg">
            {businessName || "FlowQuote"}
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Log out
        </Button>
      </div>
    </header>
  );
}
