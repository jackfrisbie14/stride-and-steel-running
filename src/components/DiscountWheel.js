"use client";

import { useState, useEffect } from "react";

const SEGMENTS = [
  { label: "10% OFF", discount: 10, color: "#3b82f6" },
  { label: "20% OFF", discount: 20, color: "#2563eb" },
  { label: "30% OFF", discount: 30, color: "#3b82f6" },
  { label: "40% OFF", discount: 40, color: "#2563eb" },
  { label: "50% OFF", discount: 50, color: "#3b82f6" },
  { label: "60% OFF", discount: 60, color: "#2563eb" },
];

export default function DiscountWheel({ onComplete }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [showWheel, setShowWheel] = useState(true);

  // Check if already spun
  useEffect(() => {
    const savedDiscount = localStorage.getItem("ss_wheel_discount");
    if (savedDiscount) {
      setResult(JSON.parse(savedDiscount));
      setHasSpun(true);
      setShowWheel(false);
      onComplete?.(JSON.parse(savedDiscount));
    }
  }, []);

  const spin = () => {
    if (isSpinning || hasSpun) return;

    setIsSpinning(true);

    // Weighted random - favor middle discounts
    const weights = [15, 25, 30, 20, 8, 2]; // 10%, 20%, 30%, 40%, 50%, 60%
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    let selectedIndex = 0;

    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        selectedIndex = i;
        break;
      }
    }

    const segmentAngle = 360 / SEGMENTS.length;
    const targetAngle = 360 - (selectedIndex * segmentAngle + segmentAngle / 2);
    const spins = 5; // Number of full rotations
    const finalRotation = spins * 360 + targetAngle;

    setRotation(finalRotation);

    setTimeout(() => {
      const selectedSegment = SEGMENTS[selectedIndex];
      setResult(selectedSegment);
      setHasSpun(true);
      setIsSpinning(false);

      // Save to localStorage
      localStorage.setItem("ss_wheel_discount", JSON.stringify(selectedSegment));
      onComplete?.(selectedSegment);
    }, 4000);
  };

  if (!showWheel && result) {
    return null; // Wheel is hidden after spin, discount shown in pricing
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {!hasSpun && (
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold mb-2">🎰 Spin for Your Discount!</h3>
          <p className="text-zinc-400">Try your luck and save on your plan</p>
        </div>
      )}

      <div className="relative">
        {/* Wheel Container */}
        <div className="relative w-72 h-72 mx-auto">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
            <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-white drop-shadow-lg" />
          </div>

          {/* Wheel */}
          <div
            className="w-full h-full rounded-full border-4 border-white shadow-2xl overflow-hidden transition-transform duration-[4000ms] ease-out"
            style={{
              transform: `rotate(${rotation}deg)`,
              background: `conic-gradient(${SEGMENTS.map(
                (seg, i) =>
                  `${seg.color} ${(i / SEGMENTS.length) * 100}% ${((i + 1) / SEGMENTS.length) * 100}%`
              ).join(", ")})`,
            }}
          >
            {/* Segment Labels */}
            {SEGMENTS.map((segment, index) => {
              const angle = (index * 360) / SEGMENTS.length + 360 / SEGMENTS.length / 2;
              return (
                <div
                  key={index}
                  className="absolute w-full h-full flex items-center justify-center"
                  style={{
                    transform: `rotate(${angle}deg)`,
                  }}
                >
                  <span
                    className="absolute text-white font-bold text-sm drop-shadow-md"
                    style={{
                      transform: `translateY(-100px) rotate(0deg)`,
                    }}
                  >
                    {segment.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Center Button */}
          <button
            onClick={spin}
            disabled={isSpinning || hasSpun}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full font-bold text-sm transition-all ${
              isSpinning
                ? "bg-zinc-600 text-zinc-400 cursor-not-allowed"
                : hasSpun
                ? "bg-green-500 text-white"
                : "bg-white text-blue-500 hover:scale-105 shadow-lg cursor-pointer"
            }`}
          >
            {isSpinning ? "..." : hasSpun ? "✓" : "SPIN"}
          </button>
        </div>

        {/* Result */}
        {result && !isSpinning && (
          <div className="mt-6 text-center animate-bounce">
            <div className="inline-block rounded-xl bg-green-500/20 border border-green-500/30 px-6 py-4">
              <p className="text-green-400 font-bold text-2xl">🎉 You won {result.label}!</p>
              <p className="text-zinc-400 text-sm mt-1">Applied to your plan below</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
