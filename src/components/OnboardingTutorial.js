"use client";

import { useState, useEffect, useRef } from "react";

const TUTORIAL_STEPS = [
  {
    target: null,
    title: "Welcome to Stride & Steel Running!",
    content: "Let's take a quick tour of your personalized running dashboard.",
    position: "center",
  },
  {
    target: "[data-tour='workouts']",
    title: "Your Weekly Runs",
    content: "Each card is a day's workout. Tap any card to expand it and see the full details with pace, duration, and instructions.",
    tip: "Green = running, Blue = speed work, Purple = recovery",
    position: "top",
  },
  {
    target: "[data-tour='workout-card']",
    title: "Expand for Details",
    content: "Click a workout to see every exercise. For speed days, you'll see intervals, paces, and recovery times.",
    position: "top",
  },
  {
    target: "[data-tour='workout-card']",
    title: "Track Your Runs",
    content: "After each run, log how you felt. Your feedback helps us adjust your training for next week.",
    position: "top",
  },
  {
    target: "[data-tour='workout-card']",
    title: "Pre & Post Check-ins",
    content: "Before each workout, rate your energy, soreness, and motivation. After, rate the difficulty. This feedback drives your adaptive training!",
    position: "top",
  },
  {
    target: "[data-tour='stats']",
    title: "Adaptive Training",
    content: "Your training isn't static — it evolves weekly based on your check-in feedback. Feeling crushed? We dial it back. Feeling strong? We push harder.",
    position: "bottom",
  },
  {
    target: "[data-tour='race-goal']",
    title: "Set a Race Goal",
    content: "Training for an event? Add your race date and distance here. We'll periodize your training to help you peak on race day with automatic tapering.",
    position: "bottom",
  },
  {
    target: "[data-tour='customization']",
    title: "Customize Your Training",
    content: "Adjust your training days and experience level. Your plan updates automatically.",
    position: "top",
  },
  {
    target: null,
    title: "You're All Set!",
    content: "That's everything! Your first run is waiting — tap a card to get started. After your first full month, we'll check in and you can earn discounts by referring friends.",
    position: "center",
  },
];

export default function OnboardingTutorial({ show }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, [show]);

  useEffect(() => {
    if (!isOpen) return;

    const step = TUTORIAL_STEPS[currentStep];
    if (step.target) {
      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);

        // Scroll element into view if needed
        element.scrollIntoView({ behavior: "smooth", block: "center" });

        // Recalculate after scroll
        setTimeout(() => {
          const newRect = element.getBoundingClientRect();
          setTargetRect(newRect);
        }, 300);
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }
  }, [currentStep, isOpen]);

  // Handle window resize
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      const step = TUTORIAL_STEPS[currentStep];
      if (step.target) {
        const element = document.querySelector(step.target);
        if (element) {
          setTargetRect(element.getBoundingClientRect());
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentStep, isOpen]);

  const handleComplete = async () => {
    setIsOpen(false);
    try {
      await fetch("/api/user/tour-complete", { method: "POST" });
    } catch (e) {
      console.error("Failed to save tour completion:", e);
    }
  };

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isOpen) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
  const isFirstStep = currentStep === 0;
  const isCentered = step.position === "center" || !targetRect;

  // Calculate tooltip position
  const getTooltipStyle = () => {
    if (isCentered || !targetRect) {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const padding = 16;
    const tooltipWidth = 320;
    const windowWidth = window.innerWidth;

    let top, left;

    if (step.position === "top") {
      // Position above the element
      top = targetRect.top - padding - 12;
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
    } else if (step.position === "bottom") {
      // Position below the element
      top = targetRect.bottom + padding + 12;
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
    }

    // Keep tooltip within viewport
    if (left < padding) left = padding;
    if (left + tooltipWidth > windowWidth - padding) {
      left = windowWidth - tooltipWidth - padding;
    }

    // If tooltip would go above viewport, put it below instead
    if (top < padding && step.position === "top") {
      top = targetRect.bottom + padding + 12;
    }

    return {
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      width: `${tooltipWidth}px`,
      transform: step.position === "top" ? "translateY(-100%)" : "translateY(0)",
    };
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay with spotlight cutout */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - 8}
                y={targetRect.top - 8}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.85)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Highlight border around target */}
      {targetRect && (
        <div
          className="absolute border-2 border-blue-500 rounded-xl pointer-events-none animate-pulse"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="z-10 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden"
        style={getTooltipStyle()}
      >
        {/* Arrow */}
        {targetRect && step.position === "top" && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-900 border-r border-b border-zinc-700 rotate-45" />
        )}
        {targetRect && step.position === "bottom" && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-900 border-l border-t border-zinc-700 rotate-45" />
        )}

        {/* Progress bar */}
        <div className="h-1 bg-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
          />
        </div>

        <div className="p-5">
          {/* Step counter */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-zinc-500">
              Step {currentStep + 1} of {TUTORIAL_STEPS.length}
            </span>
            {!isLastStep && (
              <button
                onClick={handleSkip}
                className="text-xs text-zinc-600 hover:text-zinc-400"
              >
                Skip tour
              </button>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold mb-2">{step.title}</h3>

          {/* Content */}
          <p className="text-sm text-zinc-400 mb-3">{step.content}</p>

          {/* Tip */}
          {step.tip && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2 mb-4">
              <p className="text-xs text-blue-300">
                <span className="font-semibold">Tip:</span> {step.tip}
              </p>
            </div>
          )}

          {/* Step dots */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {TUTORIAL_STEPS.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  index === currentStep
                    ? "bg-blue-500"
                    : index < currentStep
                    ? "bg-blue-500/50"
                    : "bg-zinc-700"
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            {!isFirstStep && (
              <button
                onClick={handlePrev}
                className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-400 text-sm hover:bg-zinc-800 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 py-2.5 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors"
            >
              {isLastStep ? "Start Training!" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
