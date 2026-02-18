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
              <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
                Run Smarter. Get Faster.{" "}
                <span className="text-blue-500">Train With Purpose.</span>
              </h1>

              <p className="mt-6 text-lg text-zinc-400 sm:text-xl">
                A custom training system that builds speed, endurance, and durability —
                without burning you out or leaving you stuck on a plateau.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/quiz"
                  className="rounded-full bg-blue-500 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-600"
                >
                  Start the 60 Second Assessment
                </Link>
              </div>

              <p className="mt-6 text-sm text-zinc-500">
                Takes 60 Seconds · No Equipment · No Commitment
              </p>
            </div>

            {/* Hero Images */}
            <HeroCarousel />
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-zinc-900 px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Tired of Running Without a Real Plan?
          </h2>

          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            <div className="rounded-xl bg-zinc-800 p-6 text-left">
              <h3 className="text-xl font-semibold text-blue-500">
                Generic Running Plans
              </h3>
              <p className="mt-3 text-zinc-400">
                Cookie-cutter programs that ignore your fitness level, your
                schedule, and the way your body actually responds to training.
              </p>
            </div>

            <div className="rounded-xl bg-zinc-800 p-6 text-left">
              <h3 className="text-xl font-semibold text-blue-500">
                Training Without Direction
              </h3>
              <p className="mt-3 text-zinc-400">
                Running random distances at random paces with no structure,
                no progression, and no idea if you're actually improving.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            No Guesswork. No Overtraining.{" "}
            <span className="text-blue-500">Just Smarter Running.</span>
          </h2>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-800 p-6">
              <div className="text-4xl">🎯</div>
              <h3 className="mt-4 text-lg font-semibold">Personalized Training</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Based on your unique runner profile and goals
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 p-6">
              <div className="text-4xl">⚖️</div>
              <h3 className="mt-4 text-lg font-semibold">Structured Plans</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Weekly programming with the right mix of runs, recovery, and progression
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 p-6">
              <div className="text-4xl">📈</div>
              <h3 className="mt-4 text-lg font-semibold">Progressive Results</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Faster times and stronger endurance without overtraining
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-zinc-900 px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Discover Your Training Archetype
          </h2>

          <p className="mt-4 text-zinc-400">
            Take the free 60-second assessment and get a personalized running plan
            built for your goals.
          </p>

          <Link
            href="/quiz"
            className="mt-8 inline-block rounded-full bg-blue-500 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-600"
          >
            Start the Assessment
          </Link>
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
