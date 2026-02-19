import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="px-6 py-12 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left">
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-4">
                AI-Powered Running Plans
              </p>
              <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
                Stop Running the Same Pace{" "}
                <span className="text-blue-500">Every Single Day.</span>
              </h1>

              <p className="mt-6 text-lg text-zinc-400 sm:text-xl">
                Get a weekly training plan built around your goals, your schedule,
                and the science of how runners actually get faster — in 60 seconds.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/quiz"
                  className="rounded-full bg-blue-500 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Get Your Free Running Plan
                </Link>
              </div>

              <p className="mt-6 text-sm text-zinc-500">
                Free · 60 seconds · No credit card required
              </p>
            </div>

            {/* Hero Images */}
            <HeroCarousel />
          </div>
        </div>
      </section>

      {/* "You know the feeling" Section */}
      <section className="bg-zinc-900 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold sm:text-4xl">
            Sound Familiar?
          </h2>

          <div className="mt-12 space-y-4 max-w-2xl mx-auto">
            {[
              "You run 3-4 times a week but your pace hasn't improved in months",
              "You want to train for a race but don't know how to structure your weeks",
              "You alternate between doing too much and doing nothing",
              "You've Googled \"half marathon training plan\" and gotten 50 different answers",
              "You know you should do speed work but have no idea where to start",
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl bg-zinc-800/50 border border-zinc-800 p-4"
              >
                <span className="mt-0.5 text-blue-400 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                </span>
                <p className="text-zinc-300">{item}</p>
              </div>
            ))}
          </div>

          <p className="text-center mt-8 text-zinc-500 text-sm">
            You don't need more motivation. You need a plan that actually fits you.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Your Plan in{" "}
            <span className="text-blue-500">3 Steps</span>
          </h2>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-800 p-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 text-xl font-bold">
                1
              </div>
              <h3 className="mt-4 text-lg font-semibold">Tell Us About You</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Your experience, goals, and how many days you can train. Takes 60 seconds.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 p-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 text-xl font-bold">
                2
              </div>
              <h3 className="mt-4 text-lg font-semibold">Get Your Archetype</h3>
              <p className="mt-2 text-sm text-zinc-400">
                We identify your runner profile — Speed Demon, Distance Runner, Racer, or Everyday Runner.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 p-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 text-xl font-bold">
                3
              </div>
              <h3 className="mt-4 text-lg font-semibold">Train This Week</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Get a structured weekly plan — intervals, tempo runs, easy days, and recovery built in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Week Preview */}
      <section className="bg-zinc-900 px-6 py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-3xl font-bold sm:text-4xl mb-4">
            Here's What a Week Looks Like
          </h2>
          <p className="text-center text-zinc-500 mb-10 text-sm">
            Sample plan for a 5-day runner training for a half marathon
          </p>

          <div className="space-y-3">
            {[
              { day: "Monday", type: "Speed", title: "Interval Run", desc: "6x800m at 5K pace with 400m recovery jog", color: "text-red-400", bg: "bg-red-500/10" },
              { day: "Tuesday", type: "Easy", title: "Easy Run", desc: "40 min at conversational pace", color: "text-green-400", bg: "bg-green-500/10" },
              { day: "Wednesday", type: "Speed", title: "Tempo Run", desc: "20 min warm-up, 20 min at threshold, 10 min cool-down", color: "text-red-400", bg: "bg-red-500/10" },
              { day: "Thursday", type: "Recovery", title: "Yoga for Runners", desc: "Hip openers, hamstring stretches, foam rolling", color: "text-blue-400", bg: "bg-blue-500/10" },
              { day: "Saturday", type: "Easy", title: "Long Run", desc: "90 min at easy pace, last 10 min at marathon pace", color: "text-green-400", bg: "bg-green-500/10" },
            ].map((w, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-800/30 p-4"
              >
                <div className="w-20 flex-shrink-0">
                  <p className="text-xs text-zinc-500">{w.day}</p>
                  <span className={`text-xs font-medium ${w.color} ${w.bg} px-2 py-0.5 rounded-full`}>
                    {w.type}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{w.title}</p>
                  <p className="text-xs text-zinc-500 truncate">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center mt-6 text-xs text-zinc-600">
            Your plan will be different — tailored to your archetype, experience, and goals.
          </p>
        </div>
      </section>

      {/* What You Get */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Not Another Generic Plan
          </h2>
          <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
            Every plan adapts to how you train. Change your schedule, adjust intensity,
            or set a race goal — your workouts update automatically.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 text-left max-w-2xl mx-auto">
            {[
              { title: "AI Race Plans", desc: "Set a race date and distance. Get a periodized plan with base building, peak weeks, and taper." },
              { title: "Adjustable Everything", desc: "Change training days, intensity, or experience level anytime. Your plan regenerates instantly." },
              { title: "The Right Mix", desc: "Speed work, easy runs, long runs, and recovery — balanced based on your runner archetype." },
              { title: "Exercise Demos", desc: "Tap any exercise for form tips, step-by-step instructions, and video demos." },
            ].map((f, i) => (
              <div key={i} className="rounded-xl border border-zinc-800 p-5">
                <h3 className="font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-zinc-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-zinc-900 px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Your First Plan is Free
          </h2>

          <p className="mt-4 text-zinc-400">
            See your runner archetype and get a sample training week.
            No credit card. No commitment. Just a better way to run.
          </p>

          <Link
            href="/quiz"
            className="mt-8 inline-block rounded-full bg-blue-500 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Your Free Running Plan
          </Link>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-zinc-600">
            <span>60 second quiz</span>
            <span className="h-3 w-px bg-zinc-700" />
            <span>Personalized results</span>
            <span className="h-3 w-px bg-zinc-700" />
            <span>No credit card</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-8">
        <div className="mx-auto max-w-4xl text-center text-sm text-zinc-500">
          <p>&copy; {new Date().getFullYear()} Stride & Steel Running. All rights reserved.</p>
          <div className="mt-6 text-xs text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            <p className="font-semibold text-zinc-500 mb-2">Disclaimer</p>
            <p>
              Stride & Steel Running provides general fitness information and AI-generated training plans for educational purposes only. This content is not medical advice and is not intended to diagnose, treat, cure, or prevent any condition or disease. Always consult a qualified healthcare provider or certified fitness professional before beginning any exercise program, especially if you have pre-existing health conditions, injuries, or concerns.
            </p>
            <p className="mt-2">
              By using this service, you acknowledge that all physical activity carries inherent risks of injury. Stride & Steel Running, its owners, employees, and affiliates assume no liability for any injuries, damages, or losses resulting from the use of information or training plans provided through this platform. You participate in any suggested workouts entirely at your own risk.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
