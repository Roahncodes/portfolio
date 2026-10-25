/**
 * The guestbook's only server-side store.
 *
 * New reviews are written with `status: "pending"` and are invisible to the
 * public API until the owner changes that field to `"approved"` in the MongoDB
 * Atlas Data Explorer. There is no browser storage and no seeded content.
 */

import { MongoClient, ObjectId, type Collection } from "mongodb";

import {
  REVIEW_COLORS,
  REVIEW_LIMITS,
  REVIEW_RATINGS,
  type Review,
  type ReviewRating,
} from "@/content/reviews";

const DB_NAME = process.env.MONGODB_DB?.trim() || "portfolio";
const COLLECTION_NAME = "reviews";
const PUBLIC_LIMIT = 60;

type ReviewStatus = "pending" | "approved" | "rejected";

interface ReviewDocument {
  _id?: ObjectId;
  name: string;
  role: string;
  rating: ReviewRating;
  comment: string;
  color: string;
  status: ReviewStatus;
  createdAt: Date;
  approvedAt: Date | null;
}

type ReviewInput = Pick<
  ReviewDocument,
  "name" | "role" | "rating" | "comment" | "color"
>;

export class ReviewsNotConfiguredError extends Error {
  constructor() {
    super("MONGODB_URI is not configured.");
    this.name = "ReviewsNotConfiguredError";
  }
}

export class ReviewValidationError extends Error {
  constructor(message = "Invalid review submission.") {
    super(message);
    this.name = "ReviewValidationError";
  }
}

/**
 * A failed connection must not be cached forever: a cold Atlas cluster or a
 * temporary DNS failure should recover on the next request, not poison the
 * whole deployment until it redeploys.
 */
const globalForMongo = globalThis as typeof globalThis & {
  __portfolioMongoClient?: Promise<MongoClient>;
  __portfolioReviewIndexes?: Promise<void>;
};

function mongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) throw new ReviewsNotConfiguredError();

  if (!globalForMongo.__portfolioMongoClient) {
    const client = new MongoClient(uri, {
      appName: "rohan-portfolio",
      maxPoolSize: 8,
      serverSelectionTimeoutMS: 8_000,
      connectTimeoutMS: 8_000,
    });

    globalForMongo.__portfolioMongoClient = client.connect().catch(async (error) => {
      globalForMongo.__portfolioMongoClient = undefined;
      await client.close().catch(() => undefined);
      throw error;
    });
  }

  return globalForMongo.__portfolioMongoClient;
}

async function reviewsCollection(): Promise<Collection<ReviewDocument>> {
  const client = await mongoClient();
  const collection = client
    .db(DB_NAME)
    .collection<ReviewDocument>(COLLECTION_NAME);

  if (!globalForMongo.__portfolioReviewIndexes) {
    globalForMongo.__portfolioReviewIndexes = collection
      .createIndexes([
        {
          key: { status: 1, approvedAt: -1, createdAt: -1 },
          name: "public_feed",
        },
      ])
      .then(() => undefined)
      .catch((error) => {
        // The index is an optimisation, not a correctness requirement. A
        // read-only database user should still be able to render the board.
        console.warn(
          "[reviews] could not create the public-feed index:",
          error instanceof Error ? error.message : "unknown error"
        );
      });
  }

  await globalForMongo.__portfolioReviewIndexes;
  return collection;
}

export function isReviewsConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI?.trim());
}

function normalizeText(value: unknown, label: string, min: number, max: number): string {
  if (typeof value !== "string") {
    throw new ReviewValidationError(`${label} is required.`);
  }

  const text = value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length < min) {
    throw new ReviewValidationError(
      min === 1 ? `${label} is required.` : `${label} must be at least ${min} characters.`
    );
  }
  if (text.length > max) {
    throw new ReviewValidationError(`${label} must be ${max} characters or fewer.`);
  }

  return text;
}

function optionalText(value: unknown, label: string, max: number): string {
  if (value == null || value === "") return "";
  if (typeof value !== "string") {
    throw new ReviewValidationError(`${label} must be text.`);
  }

  const text = value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return "";
  if (text.length > max) {
    throw new ReviewValidationError(`${label} must be ${max} characters or fewer.`);
  }

  return text;
}

function parseReviewInput(input: unknown): ReviewInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new ReviewValidationError("Send the review as a JSON object.");
  }

  const record = input as Record<string, unknown>;

  const rating = record.rating;
  if (
    typeof rating !== "string" ||
    !REVIEW_RATINGS.includes(rating as ReviewRating)
  ) {
    throw new ReviewValidationError("Choose one of the four review stamps.");
  }

  const color = record.color;
  if (
    typeof color !== "string" ||
    !REVIEW_COLORS.some((option) => option.hex === color)
  ) {
    throw new ReviewValidationError("Choose one of the available vinyl markers.");
  }

  return {
    name: normalizeText(record.name, "Name", 1, REVIEW_LIMITS.name),
    role: optionalText(record.role, "Role", REVIEW_LIMITS.role),
    rating: rating as ReviewRating,
    comment: normalizeText(record.comment, "Review", 1, REVIEW_LIMITS.comment),
    color,
  };
}

function toReview(doc: ReviewDocument): Review | null {
  if (!doc._id) return null;

  const rating = REVIEW_RATINGS.includes(doc.rating) ? doc.rating : null;
  if (!rating) return null;

  const fallbackColor = REVIEW_COLORS[0].hex;
  const color = REVIEW_COLORS.some((option) => option.hex === doc.color)
    ? doc.color
    : fallbackColor;

  const approvedAt = doc.approvedAt instanceof Date ? doc.approvedAt : null;
  const createdAt = doc.createdAt instanceof Date ? doc.createdAt : approvedAt;

  return {
    id: doc._id.toString(),
    name: doc.name,
    role: doc.role ?? "",
    rating,
    comment: doc.comment,
    color,
    createdAt: (approvedAt ?? createdAt ?? new Date()).toISOString(),
  };
}

/** Approved reviews only — pending and rejected documents never leave the server. */
export async function listApprovedReviews(): Promise<Review[]> {
  const collection = await reviewsCollection();

  const docs = await collection
    .find({ status: "approved" })
    .sort({ approvedAt: -1, createdAt: -1 })
    .limit(PUBLIC_LIMIT)
    .toArray();

  return docs
    .map((doc) => toReview(doc))
    .filter((review): review is Review => review !== null);
}

/** Insert a submission in the moderation queue. Returns the new document id. */
export async function createPendingReview(input: unknown): Promise<string> {
  const data = parseReviewInput(input);
  const collection = await reviewsCollection();

  const result = await collection.insertOne({
    ...data,
    status: "pending",
    createdAt: new Date(),
    approvedAt: null,
  });

  return result.insertedId.toString();
}
