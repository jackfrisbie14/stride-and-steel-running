import { NextResponse } from "next/server";

const EXERCISEDB_BASE = "https://exercisedb.dev/api/v1";

// Words that describe equipment/position, not the exercise itself.
const MODIFIER_WORDS = new Set([
  "barbell", "dumbbell", "cable", "machine", "smith", "ez", "kettlebell",
  "band", "resistance", "bodyweight", "weighted", "seated", "standing",
  "incline", "decline", "flat", "single", "one", "alternate", "alternating",
  "lying", "kneeling", "hanging", "close", "grip", "wide", "reverse",
  "with", "on", "the", "a", "an", "of", "and", "or",
]);

/**
 * Check that the ExerciseDB result actually matches the queried exercise.
 * Strips equipment/position modifiers and verifies the core exercise words
 * from the query all appear in the result name.
 */
function isNameMatch(query, resultName) {
  const normalize = (s) =>
    s.toLowerCase().replace(/[-_]/g, " ").replace(/[^a-z0-9\s]/g, "").trim();

  const getCore = (s) =>
    normalize(s)
      .split(/\s+/)
      .map((w) => w.replace(/s$/, "")) // basic plural → singular
      .filter((w) => w.length > 1 && !MODIFIER_WORDS.has(w));

  const queryCore = getCore(query);
  const resultCore = new Set(getCore(resultName));

  if (queryCore.length === 0) return true;

  const matched = queryCore.filter((w) => resultCore.has(w)).length;
  return matched >= queryCore.length; // ALL core query words must appear
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json({ exercises: [] });
  }

  try {
    const res = await fetch(
      `${EXERCISEDB_BASE}/exercises/search?q=${encodeURIComponent(query)}&limit=5&threshold=0.4`,
      { next: { revalidate: 86400 } } // Cache for 24 hours
    );

    if (!res.ok) {
      return NextResponse.json({ exercises: [] });
    }

    const data = await res.json();
    const all = (data.data || []).map((ex) => ({
      id: ex.exerciseId,
      name: ex.name,
      gifUrl: ex.gifUrl,
      targetMuscles: ex.targetMuscles,
      bodyParts: ex.bodyParts,
      equipments: ex.equipments,
      instructions: ex.instructions,
    }));

    // Only return results whose name actually matches the query
    const exercises = all.filter((ex) => isNameMatch(query, ex.name)).slice(0, 1);

    return NextResponse.json({ exercises });
  } catch (error) {
    console.error("ExerciseDB search error:", error);
    return NextResponse.json({ exercises: [] });
  }
}
