"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const images = [
  { src: "/tripicture.jpg", alt: "Athlete running in triathlon" },
  { src: "/tripicture2.jpg", alt: "Athlete with medal after race" },
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance carousel on mobile
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Mobile Carousel - visible on small screens */}
      <div className="relative md:hidden">
        <div className="relative mx-auto h-[450px] w-[280px] overflow-hidden rounded-2xl">
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="mt-4 flex justify-center gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-blue-500" : "bg-zinc-600"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Desktop Side-by-Side - visible on medium screens and up */}
      <div className="hidden md:flex justify-center gap-4">
        <div className="relative h-[500px] w-[240px] overflow-hidden rounded-2xl">
          <Image
            src="/tripicture.jpg"
            alt="Athlete running in triathlon"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative mt-12 h-[500px] w-[240px] overflow-hidden rounded-2xl">
          <Image
            src="/tripicture2.jpg"
            alt="Athlete with medal after race"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </>
  );
}
