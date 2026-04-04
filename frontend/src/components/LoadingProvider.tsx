"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react"; // Import Lucide spinner icon

export default function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-transparent">
          <div className="flex items-center justify-center bg-white p-6 rounded-full shadow-lg animate-float">
            <Loader2 className="w-12 h-12 text-[#3F856C] animate-spin" />
          </div>
        </div>
      )}

      <div className="opacity-100 transition-opacity duration-300">
        {children}
      </div>
    </>
  );
}
