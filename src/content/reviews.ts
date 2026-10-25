/**
 * The one description of a guestbook review.
 *
 * Kept outside `lib/reviews.ts` so the client can import the labels, limits and
 * colours without pulling the MongoDB driver into the browser bundle.
 */

export const REVIEW_RATINGS = [
  "masterpiece",
  "heavy-repeat",
  "deep-cut",
  "clean-execution",
] as const;

export type ReviewRating = (typeof REVIEW_RATINGS)[number];

export const REVIEW_RATING_META: Record<ReviewRating, { label: string }> = {
  masterpiece: { label: "Certified Masterpiece" },
  "heavy-repeat": { label: "On Heavy Repeat" },
  "deep-cut": { label: "Deep Cut" },
  "clean-execution": { label: "Clean Execution" },
};

export const REVIEW_COLORS = [
  { label: "Emerald", hex: "#4ade80" },
  { label: "Cyan", hex: "#38bdf8" },
  { label: "Violet", hex: "#c084fc" },
  { label: "Amber", hex: "#fbbf24" },
  { label: "Rose", hex: "#f43f5e" },
] as const;

export const REVIEW_LIMITS = {
  name: 40,
  role: 50,
  comment: 300,
} as const;

/** A published review, as returned by `GET /api/reviews`. */
export interface Review {
  id: string;
  name: string;
  role: string;
  rating: ReviewRating;
  comment: string;
  color: string;
  /** When the review was approved, ISO-8601 — or when it was submitted if the
   *  approval timestamp was never filled in. */
  createdAt: string;
}
