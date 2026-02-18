"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const questions = [
  {
    id: 1,
    question: "What type of runner are you?",
    options: [
      "🏃 Beginner — just getting started",
      "🏃‍♂️ Casual — I run a few times a week",
      "🏅 Competitive — I train with purpose and race",
      "🔄 Returning — getting back into it after a break",
    ],
  },
  {
    id: 2,
    question: "What's your main running goal right now?",
    options: [
      "Run a faster 5K",
      "Train for a half marathon or marathon",
      "Improve general fitness through running",
      "Run more consistently without burning out",
    ],
  },
  {
    id: 3,
    question: "How many days per week can you realistically run?",
    options: ["3 days", "4 days", "5 days", "6+ days"],
  },
  {
    id: 4,
    question: "How would you describe your running experience?",
    options: [
      "Beginner (less than 1 year)",
      "Intermediate (1–3 years)",
      "Advanced (3+ years)",
      "On and off / inconsistent",
    ],
  },
  {
    id: 5,
    question: "What's been your biggest challenge with running?",
    options: [
      "Getting faster / improving speed",
      "Building endurance for longer distances",
      "Staying consistent with training",
      "Dealing with injuries or pain",
      "Staying motivated",
    ],
  },
  {
    id: 6,
    question: "Do you have a race coming up?",
    options: [
      "Yes — within 3 months",
      "Yes — 3–6 months out",
      "Not right now, but eventually",
      "I don't race — I just run for me",
    ],
  },
  {
    id: 7,
    question: "What would success look like in 12 weeks?",
    options: [
      "PR a race or hit a new time goal",
      "Run farther than I ever have",
      "Run consistently 3-5 times per week",
      "Enjoy running more and look forward to it",
    ],
  },
  {
    id: 8,
    type: "gender",
    question: "How do you identify?",
    options: [
      "Man",
      "Woman",
      "Non-binary",
      "Prefer to self-describe",
      "Prefer not to say",
    ],
  },
  {
    id: 9,
    type: "height-weight",
    question: "What's your height and weight?",
  },
  {
    id: 10,
    question: "What's your primary race distance?",
    options: [
      "5K",
      "10K",
      "Half Marathon",
      "Marathon",
      "Ultra Marathon",
      "No specific distance — I just like to run",
    ],
  },
];

function AnalyzingScreen({ onComplete }) {
  const [step, setStep] = useState(0);
  const steps = [
    "Analyzing your responses...",
    "Determining your running profile...",
    "Building your training schedule...",
    "Finalizing your running plan...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(onComplete, 800);
          return prev;
        }
      });
    }, 600);

    return () => clearInterval(interval);
  }, [onComplete, steps.length]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="mb-8">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>

      <h2 className="text-2xl font-bold mb-8">Building Your Plan</h2>

      <div className="w-full max-w-sm space-y-3">
        {steps.map((stepText, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 transition-all duration-300 ${
              index <= step ? "opacity-100" : "opacity-30"
            }`}
          >
            {index < step ? (
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : index === step ? (
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-zinc-600 flex-shrink-0" />
            )}
            <span className={index <= step ? "text-white" : "text-zinc-500"}>
              {stepText}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-10 w-full max-w-sm">
        <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-1000"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </main>
  );
}

function HeightWeightQuestion({ onSubmit }) {
  const [unit, setUnit] = useState("imperial");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [cm, setCm] = useState("");
  const [lbs, setLbs] = useState("");
  const [kg, setKg] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Slider values (stored as numbers for sliders)
  const [heightInches, setHeightInches] = useState(70); // 5'10" default
  const [heightCm, setHeightCm] = useState(178);
  const [weightLbs, setWeightLbs] = useState(155);
  const [weightKg, setWeightKg] = useState(70);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSubmit = () => {
    let height, weight;
    if (unit === "imperial") {
      if (isMobile) {
        const ft = Math.floor(heightInches / 12);
        const inch = heightInches % 12;
        height = `${ft}'${inch}"`;
        weight = `${weightLbs} lbs`;
      } else {
        height = `${feet}'${inches}"`;
        weight = `${lbs} lbs`;
      }
    } else {
      if (isMobile) {
        height = `${heightCm} cm`;
        weight = `${weightKg} kg`;
      } else {
        height = `${cm} cm`;
        weight = `${kg} kg`;
      }
    }
    onSubmit({ height, weight, unit });
  };

  const isValid = isMobile
    ? true // Sliders always have valid values
    : unit === "imperial"
      ? feet && inches && lbs
      : cm && kg;

  // Helper to display height from inches
  const formatHeightFromInches = (totalInches) => {
    const ft = Math.floor(totalInches / 12);
    const inch = totalInches % 12;
    return `${ft}'${inch}"`;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="mb-8 text-3xl font-bold sm:text-4xl">
        Take Our Quiz to Get Your{" "}
        <span className="text-blue-500">Custom Running Plan!</span>
      </h1>

      <div className="mb-8 w-full max-w-md">
        <div className="h-2 rounded-full bg-zinc-800">
          <div
            className="h-2 rounded-full bg-blue-500 transition-all"
            style={{ width: `${(9 / 10) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-zinc-500">Question 9 of 10</p>
      </div>

      <h2 className="max-w-xl text-2xl font-bold sm:text-3xl mb-8">
        What's your height and weight?
      </h2>

      {/* Unit Toggle */}
      <div className="flex gap-2 mb-8 p-1 bg-zinc-800 rounded-lg">
        <button
          onClick={() => setUnit("imperial")}
          className={`px-4 py-2 rounded-md transition-colors ${
            unit === "imperial" ? "bg-blue-500 text-white" : "text-zinc-400"
          }`}
        >
          Imperial (ft/lbs)
        </button>
        <button
          onClick={() => setUnit("metric")}
          className={`px-4 py-2 rounded-md transition-colors ${
            unit === "metric" ? "bg-blue-500 text-white" : "text-zinc-400"
          }`}
        >
          Metric (cm/kg)
        </button>
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Height */}
        <div>
          <label className="block text-left text-sm text-zinc-400 mb-2">Height</label>
          {isMobile ? (
            // Mobile: Slider
            <div className="space-y-3">
              <div className="text-center text-2xl font-bold text-blue-500">
                {unit === "imperial" ? formatHeightFromInches(heightInches) : `${heightCm} cm`}
              </div>
              <input
                type="range"
                min={unit === "imperial" ? 48 : 120}
                max={unit === "imperial" ? 84 : 220}
                value={unit === "imperial" ? heightInches : heightCm}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (unit === "imperial") {
                    setHeightInches(val);
                  } else {
                    setHeightCm(val);
                  }
                }}
                className="w-full h-3 rounded-full appearance-none cursor-pointer bg-zinc-700 accent-blue-500"
              />
              <div className="flex justify-between text-xs text-zinc-500">
                <span>{unit === "imperial" ? "4'0\"" : "120 cm"}</span>
                <span>{unit === "imperial" ? "7'0\"" : "220 cm"}</span>
              </div>
            </div>
          ) : (
            // Desktop: Text inputs
            <>
              {unit === "imperial" ? (
                <div className="flex gap-3">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="number"
                        value={feet}
                        onChange={(e) => setFeet(e.target.value)}
                        placeholder="5"
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-4 text-center text-xl focus:border-blue-500 focus:outline-none"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">ft</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="number"
                        value={inches}
                        onChange={(e) => setInches(e.target.value)}
                        placeholder="10"
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-4 text-center text-xl focus:border-blue-500 focus:outline-none"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">in</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="number"
                    value={cm}
                    onChange={(e) => setCm(e.target.value)}
                    placeholder="178"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-4 text-center text-xl focus:border-blue-500 focus:outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">cm</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Weight */}
        <div>
          <label className="block text-left text-sm text-zinc-400 mb-2">Weight</label>
          {isMobile ? (
            // Mobile: Slider
            <div className="space-y-3">
              <div className="text-center text-2xl font-bold text-blue-500">
                {unit === "imperial" ? `${weightLbs} lbs` : `${weightKg} kg`}
              </div>
              <input
                type="range"
                min={unit === "imperial" ? 80 : 35}
                max={unit === "imperial" ? 350 : 160}
                value={unit === "imperial" ? weightLbs : weightKg}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (unit === "imperial") {
                    setWeightLbs(val);
                  } else {
                    setWeightKg(val);
                  }
                }}
                className="w-full h-3 rounded-full appearance-none cursor-pointer bg-zinc-700 accent-blue-500"
              />
              <div className="flex justify-between text-xs text-zinc-500">
                <span>{unit === "imperial" ? "80 lbs" : "35 kg"}</span>
                <span>{unit === "imperial" ? "350 lbs" : "160 kg"}</span>
              </div>
            </div>
          ) : (
            // Desktop: Text input
            <>
              {unit === "imperial" ? (
                <div className="relative">
                  <input
                    type="number"
                    value={lbs}
                    onChange={(e) => setLbs(e.target.value)}
                    placeholder="155"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-4 text-center text-xl focus:border-blue-500 focus:outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">lbs</span>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="number"
                    value={kg}
                    onChange={(e) => setKg(e.target.value)}
                    placeholder="70"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-4 text-center text-xl focus:border-blue-500 focus:outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">kg</span>
                </div>
              )}
            </>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className="w-full rounded-xl bg-blue-500 px-6 py-4 font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>

      <Link href="/welcome" className="mt-8 text-sm text-zinc-500 hover:text-zinc-300">
        ← Back to Home
      </Link>
    </main>
  );
}

export default function Quiz() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showAnalyzing, setShowAnalyzing] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Create account
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      // Sign in with credentials
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error("Failed to sign in");
      }

      // Submit quiz answers to generate personalized workouts
      try {
        const quizRes = await fetch("/api/quiz/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, answers }),
        });
        if (quizRes.ok) {
          const quizData = await quizRes.json();
          if (quizData.archetype) {
            localStorage.setItem("quizArchetype", quizData.archetype);
          }
        }
      } catch (quizErr) {
        console.error("Quiz submit error:", quizErr);
      }

      router.push("/results");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (answer) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    const questionId = questions[currentQuestion].id;

    // Store gender answer for results page
    if (questionId === 8 && typeof window !== "undefined") {
      localStorage.setItem("quizGender", answer);
    }

    // Store goal answer for results page
    if (questionId === 10 && typeof window !== "undefined") {
      localStorage.setItem("quizGoal", answer);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Last question - show analyzing screen
      setShowAnalyzing(true);
    }
  };

  const handleHeightWeightSubmit = (data) => {
    const newAnswers = [...answers, data];
    setAnswers(newAnswers);

    // Store height/weight data for results page
    if (typeof window !== "undefined") {
      localStorage.setItem("quizHeightWeight", JSON.stringify(data));
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowAnalyzing(true);
    }
  };

  const handleAnalyzingComplete = () => {
    setShowAnalyzing(false);
    setShowSignIn(true);
  };

  // Show analyzing screen
  if (showAnalyzing) {
    return <AnalyzingScreen onComplete={handleAnalyzingComplete} />;
  }

  // Show sign-in gate after quiz completion
  if (showSignIn) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
          <svg
            className="h-10 w-10 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold sm:text-4xl">
          Your Running Plan is Ready!
        </h1>

        <p className="mt-4 max-w-md text-zinc-400">
          Create an account to discover your running archetype and access your personalized training plan.
        </p>

        <div className="mt-10 w-full max-w-sm">
          {!showEmailForm ? (
            <>
              <button
                onClick={() => {
                  // Store quiz answers in localStorage before OAuth redirect
                  if (typeof window !== "undefined") {
                    localStorage.setItem("quizAnswers", JSON.stringify(answers));
                  }
                  signIn("google", { callbackUrl: "/results" });
                }}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-6 py-4 font-semibold text-zinc-900 transition-colors hover:bg-zinc-100"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-zinc-800" />
                <span className="text-sm text-zinc-500">or</span>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>

              <button
                onClick={() => setShowEmailForm(true)}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-4 font-semibold transition-colors hover:border-blue-500 hover:bg-zinc-800"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Sign up with Email
              </button>
            </>
          ) : (
            <>
              <form onSubmit={handleEmailSignup} className="flex flex-col gap-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name (optional)"
                  className="rounded-lg bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className="rounded-lg bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min 8 characters)"
                  required
                  minLength={8}
                  className="rounded-lg bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </button>
              </form>

              <button
                onClick={() => setShowEmailForm(false)}
                className="mt-4 text-sm text-zinc-500 hover:text-zinc-300"
              >
                ← Back to other options
              </button>
            </>
          )}

          <p className="mt-6 text-sm text-zinc-500">
            Already have an account?{" "}
            <Link href="/?callbackUrl=/results" className="text-blue-500 hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <Link href="/welcome" className="mt-10 text-sm text-zinc-500 hover:text-zinc-300">
          ← Back to Home
        </Link>
      </main>
    );
  }

  const question = questions[currentQuestion];

  // Height/Weight question
  if (question.type === "height-weight") {
    return <HeightWeightQuestion onSubmit={handleHeightWeightSubmit} />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      {/* Header */}
      <h1 className="mb-8 text-3xl font-bold sm:text-4xl">
        Take Our Quiz to Get Your{" "}
        <span className="text-blue-500">Custom Running Plan!</span>
      </h1>

      {/* Progress bar */}
      <div className="mb-8 w-full max-w-md">
        <div className="h-2 rounded-full bg-zinc-800">
          <div
            className="h-2 rounded-full bg-blue-500 transition-all"
            style={{
              width: `${((currentQuestion + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
        <p className="mt-2 text-sm text-zinc-500">
          Question {currentQuestion + 1} of {questions.length}
        </p>
      </div>

      <h2 className="max-w-xl text-2xl font-bold sm:text-3xl">
        {question.question}
      </h2>

      <div className="mt-8 flex w-full max-w-md flex-col gap-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(option)}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-4 text-left transition-colors hover:border-blue-500 hover:bg-zinc-800"
          >
            {option}
          </button>
        ))}
      </div>

      <Link href="/welcome" className="mt-8 text-sm text-zinc-500 hover:text-zinc-300">
        ← Back to Home
      </Link>
    </main>
  );
}
