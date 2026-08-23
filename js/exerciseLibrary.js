/**
 * exerciseLibrary.js
 * -----------------------------------------------------------------------
 * ES6 module (Lecture 13-18: import/export) that fetches the exercise
 * name suggestions from data/exercises.json using the Fetch API with
 * async/await (Lecture 13-18: Promises, fetch, JSON).
 *
 * NOTE: because this is fetch()'d as a real HTTP request, the page must
 * be served over http:// (e.g. VS Code "Live Server", or `npx serve .`)
 * rather than opened directly as a file:// URL, or the browser will
 * block it with a CORS error.
 * -----------------------------------------------------------------------
 */
export async function loadExerciseLibrary() {
  try {
    const response = await fetch("data/exercises.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const exercises = await response.json();
    return exercises;
  } catch (err) {
    console.error("Could not load exercise library, using fallback list.", err);
    // Fallback so the app still works if fetch fails (e.g. opened via file://)
    return [
      { name: "Barbell Bench Press", muscle: "Chest" },
      { name: "Back Squat", muscle: "Legs" },
      { name: "Deadlift", muscle: "Back" },
      { name: "Overhead Press", muscle: "Shoulders" },
    ];
  }
}
