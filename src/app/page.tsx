"use client";

import dynamic from "next/dynamic";
import BookingSidebar from "@/components/BookingSidebar";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Dynamically import the Map component to avoid server-side issues with Leaflet
const Map = dynamic(() => import("@/components/Map"), {
  loading: () => <div className="h-full w-full bg-slate-100 animate-pulse" />,
  ssr: false,
});

export default function Home() {
  return (
    <main className="flex h-screen w-full bg-white overflow-hidden font-sans">
      
      {/* 1. Far Left Menu Strip */}
      <aside className="w-[60px] bg-black text-white flex flex-col items-center py-6 z-20 flex-shrink-0">
        <button className="transform -rotate-90 mt-12 text-sm font-bold tracking-widest uppercase hover:text-gray-300 transition-colors whitespace-nowrap">
          Menu
        </button>
        <div className="mt-4">
           <ChevronRight className="h-6 w-6" />
        </div>
      </aside>

      {/* 2. Booking Form Sidebar */}
      <div className="w-[420px] flex-shrink-0 bg-white shadow-xl z-10 overflow-hidden flex flex-col">
        <BookingSidebar />
      </div>

      {/* 3. Main Map Area */}
      <div className="flex-1 relative bg-slate-100">
        <Map />
        
        {/* Pricing Information Tab */}
        <div className="absolute top-1/2 right-0 transform -translate-y-1/2 z-[1000]">
          <button className="bg-black text-white py-4 px-1 rounded-l-lg hover:bg-gray-800 transition-colors shadow-lg">
             <span className="block transform -rotate-90 whitespace-nowrap text-sm font-bold tracking-wide">
               Pricing Information
             </span>
          </button>
        </div>
      </div>

    </main>
  );
}