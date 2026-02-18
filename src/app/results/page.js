"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import PricingSection from "@/components/PricingSection";
import { archetypes } from "@/lib/archetypes";

// Calculate BMI
function calculateBMI(heightData, weightData, unit) {
  let heightInMeters, weightInKg;

  if (unit === "imperial") {
    // Parse height like "5'10""
    const feet = parseFloat(heightData.split("'")[0]) || 0;
    const inches = parseFloat(heightData.split("'")[1]?.replace('"', '')) || 0;
    const totalInches = feet * 12 + inches;
    heightInMeters = totalInches * 0.0254;

    // Parse weight like "175 lbs"
    weightInKg = parseFloat(weightData) * 0.453592;
  } else {
    // Metric
    heightInMeters = parseFloat(heightData) / 100;
    weightInKg = parseFloat(weightData);
  }

  if (heightInMeters > 0 && weightInKg > 0) {
    return weightInKg / (heightInMeters * heightInMeters);
  }
  return null;
}

// Get BMI category
function getBMICategory(bmi) {
  if (bmi < 18.5) return { label: "Underweight", color: "text-blue-400" };
  if (bmi < 25) return { label: "Normal", color: "text-green-400" };
  if (bmi < 30) return { label: "Overweight", color: "text-yellow-400" };
  return { label: "Obese", color: "text-red-400" };
}

// Calculate daily calories using Mifflin-St Jeor equation
function calculateCalories(heightData, weightData, unit, activityLevel = 1.55) {
  let heightInCm, weightInKg;

  if (unit === "imperial") {
    const feet = parseFloat(heightData.split("'")[0]) || 0;
    const inches = parseFloat(heightData.split("'")[1]?.replace('"', '')) || 0;
    heightInCm = (feet * 12 + inches) * 2.54;
    weightInKg = parseFloat(weightData) * 0.453592;
  } else {
    heightInCm = parseFloat(heightData);
    weightInKg = parseFloat(weightData);
  }

  // Assume average age of 30 and calculate for both genders, use average
  const age = 30;
  const bmrMale = 10 * weightInKg + 6.25 * heightInCm - 5 * age + 5;
  const bmrFemale = 10 * weightInKg + 6.25 * heightInCm - 5 * age - 161;
  const avgBMR = (bmrMale + bmrFemale) / 2;

  // Activity multiplier for "moderately active" (runners)
  const tdee = avgBMR * activityLevel;

  return {
    maintenance: Math.round(tdee),
    cutting: Math.round(tdee - 500),
    bulking: Math.round(tdee + 300),
  };
}

function MetricCard({ icon, label, value, subtext, color = "text-blue-500" }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center">
      <span className="text-2xl mb-2 block">{icon}</span>
      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {subtext && <p className="text-xs text-zinc-500 mt-1">{subtext}</p>}
    </div>
  );
}

export default function Results() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [metrics, setMetrics] = useState(null);
  const [archetypeLabel, setArchetypeLabel] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/quiz");
    }
    // For Google OAuth users: submit stored quiz answers after redirect
    if (status === "authenticated" && session?.user?.email && typeof window !== "undefined") {
      const storedAnswers = localStorage.getItem("quizAnswers");
      if (storedAnswers) {
        const answers = JSON.parse(storedAnswers);
        fetch("/api/quiz/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email, answers }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.archetype) {
              localStorage.setItem("quizArchetype", data.archetype);
              setArchetypeLabel(data.archetype);
            }
            localStorage.removeItem("quizAnswers");
          })
          .catch((err) => console.error("Quiz submit error:", err));
      }
    }
  }, [status, router, session]);

  // Load quiz data from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const heightWeightData = localStorage.getItem("quizHeightWeight");
      const savedArchetype = localStorage.getItem("quizArchetype");
      if (savedArchetype) {
        setArchetypeLabel(savedArchetype);
      }

      if (heightWeightData) {
        try {
          const data = JSON.parse(heightWeightData);
          const bmi = calculateBMI(data.height, data.weight, data.unit);
          const calories = calculateCalories(data.height, data.weight, data.unit);

          setMetrics({
            bmi,
            bmiCategory: bmi ? getBMICategory(bmi) : null,
            calories,
            height: data.height,
            weight: data.weight,
          });
        } catch (e) {
          console.error("Error parsing quiz data:", e);
        }
      }

    }
  }, []);

  if (status === "loading") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500" />
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-12 text-center">
      <div className="relative mb-6 h-32 w-32 overflow-hidden rounded-full border-4 border-blue-500">
        <Image
          src="/tripicture.jpg"
          alt="Runner"
          fill
          className="object-cover"
        />
      </div>

      <h1 className="text-2xl font-bold sm:text-3xl">
        Your Running Archetype:{" "}
        <span className="text-blue-500">{archetypeLabel || "The Balanced Athlete"}</span>
      </h1>

      {/* Archetype Summary */}
      {(() => {
        const match = Object.values(archetypes).find(a => a.label === archetypeLabel);
        const description = match?.description;
        return description ? (
          <p className="mt-4 max-w-md text-zinc-400">{description}</p>
        ) : null;
      })()}

      {/* Personalized Metrics */}
      {metrics && (
        <div className="mt-8 w-full max-w-lg">
          <h2 className="text-lg font-semibold mb-4 text-zinc-300">Your Personal Stats</h2>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {metrics.bmi && (
              <MetricCard
                icon="📊"
                label="BMI"
                value={metrics.bmi.toFixed(1)}
                subtext={metrics.bmiCategory?.label}
                color={metrics.bmiCategory?.color}
              />
            )}
            <MetricCard
              icon="🎯"
              label="Daily Calories"
              value={metrics.calories?.maintenance?.toLocaleString()}
              subtext="Maintenance"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-center">
              <p className="text-xs text-zinc-500 mb-1">Fat Loss</p>
              <p className="text-lg font-bold text-green-400">
                {metrics.calories?.cutting?.toLocaleString()}
              </p>
              <p className="text-xs text-zinc-600">cal/day</p>
            </div>
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-center">
              <p className="text-xs text-zinc-500 mb-1">Maintain</p>
              <p className="text-lg font-bold text-blue-400">
                {metrics.calories?.maintenance?.toLocaleString()}
              </p>
              <p className="text-xs text-zinc-600">cal/day</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-center">
              <p className="text-xs text-zinc-500 mb-1">Performance</p>
              <p className="text-lg font-bold text-blue-400">
                {metrics.calories?.bulking?.toLocaleString()}
              </p>
              <p className="text-xs text-zinc-600">cal/day</p>
            </div>
          </div>

          {/* BMI Scale */}
          {metrics.bmi && (
            <div className="mt-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900">
              <p className="text-xs text-zinc-500 mb-2">BMI Scale</p>
              <div className="relative h-3 rounded-full bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 to-red-500">
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-zinc-900 shadow-lg"
                  style={{
                    left: `${Math.min(Math.max((metrics.bmi - 15) / 25 * 100, 0), 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-zinc-600 mt-1">
                <span>15</span>
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
                <span>40</span>
              </div>
            </div>
          )}
        </div>
      )}

      <p className="mt-6 max-w-xl text-zinc-400">
        Based on your answers, you're ready for a structured running plan
        tailored to your goals and lifestyle.
      </p>

      <div className="mt-6 max-w-md space-y-3 text-left">
        <div className="flex items-start gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-zinc-300">Personalized weekly training schedule</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-zinc-300">Speed, easy, and recovery runs balanced for you</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-zinc-300">Progress tracking dashboard</p>
        </div>
      </div>

      {/* Pricing Section */}
      <PricingSection />

      <Link href="/welcome" className="mt-12 mb-8 text-sm text-zinc-500 hover:text-zinc-300">
        ← Back to Home
      </Link>
    </main>
  );
}
