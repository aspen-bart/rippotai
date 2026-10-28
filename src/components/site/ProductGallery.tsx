"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({ images }: { images: { src: string; alt: string }[] }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  if (!images.length) return <div className="aspect-square rounded-[2rem] bg-paper-2" />;
  const img = images[active];
  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {images.length > 1 && (
        <ul className="flex gap-3 overflow-x-auto md:w-20 md:flex-col [scrollbar-width:none]">
          {images.map((im, i) => (
            <li key={im.src}>
              <button
                onClick={() => setActive(i)}
                className={`relative block h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white transition ${i === active ? "ring-2 ring-forest ring-offset-2 ring-offset-paper" : "opacity-70 hover:opacity-100"}`}
                aria-label={`${i + 1}`}
              >
                <Image src={im.src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div
        className="relative aspect-square flex-1 cursor-zoom-in overflow-hidden rounded-[2rem] bg-white"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onMouseLeave={() => setZoom(null)}
      >
        <Image
          key={img.src}
          src={img.src}
          alt={img.alt}
          fill
          priority
          sizes="(min-width:1024px) 55vw, 100vw"
          className="object-cover transition-transform duration-300 animate-[fadeIn_.5s_ease]"
          style={zoom ? { transform: "scale(1.8)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
        />
        {images.length > 1 && (
          <span className="absolute bottom-4 right-4 rounded-full bg-paper/90 px-3 py-1 text-xs text-forest">
            {active + 1} / {images.length}
          </span>
        )}
      </div>
    </div>
  );
}
