"use client";

import { useEffect, useMemo, useState } from "react";

import {
  CheckIcon,
  DiscIcon,
  GuestbookIcon,
  SparkIcon,
  StarIcon,
} from "@/components/icons";
import {
  REVIEW_COLORS,
  REVIEW_LIMITS,
  REVIEW_RATING_META,
  type Review,
  type ReviewRating,
} from "@/content/reviews";
import { sound } from "@/lib/audio";

type LoadState = "loading" | "ready" | "unconfigured" | "error";
type SubmitState = "idle" | "submitting" | "success" | "error";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

function formatReviewDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "Recently" : dateFormatter.format(date);
}

function safeColor(color: string): string {
  return REVIEW_COLORS.some((option) => option.hex === color)
    ? color
    : REVIEW_COLORS[0].hex;
}

function ratingMeta(rating: ReviewRating) {
  return REVIEW_RATING_META[rating] ?? REVIEW_RATING_META["heavy-repeat"];
}

type ReviewsResult =
  | { state: "ready"; reviews: Review[] }
  | { state: "unconfigured" }
  | { state: "error" };

async function requestReviews(signal?: AbortSignal): Promise<ReviewsResult> {
  try {
    const response = await fetch("/api/reviews", {
      cache: "no-store",
      signal,
    });
    const payload = (await response.json().catch(() => null)) as
      | { reviews?: Review[]; error?: string }
      | null;

    if (response.status === 503 && payload?.error === "not-configured") {
      return { state: "unconfigured" };
    }

    if (!response.ok || !Array.isArray(payload?.reviews)) {
      return { state: "error" };
    }

    return { state: "ready", reviews: payload.reviews };
  } catch {
    return { state: "error" };
  }
}

export function GuestbookSection() {
  const [entries, setEntries] = useState<Review[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [rating, setRating] = useState<ReviewRating>("heavy-repeat");
  const [comment, setComment] = useState("");
  const [color, setColor] = useState<string>(REVIEW_COLORS[0].hex);

  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    void (async () => {
      const result = await requestReviews(controller.signal);
      if (controller.signal.aborted) return;

      if (result.state === "ready") {
        setEntries(result.reviews);
        setLoadState("ready");
      } else {
        setEntries([]);
        setLoadState(result.state);
      }
    })();

    return () => controller.abort();
  }, []);

  const handleRetry = async () => {
    setLoadState("loading");
    const result = await requestReviews();

    if (result.state === "ready") {
      setEntries(result.reviews);
      setLoadState("ready");
    } else {
      setEntries([]);
      setLoadState(result.state);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitState === "submitting") return;

    const trimmedName = name.trim();
    const trimmedComment = comment.trim();
    if (!trimmedName || !trimmedComment) return;

    setSubmitState("submitting");
    setSubmitError("");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          role: role.trim(),
          rating,
          comment: trimmedComment,
          color,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { message?: string; error?: string }
        | null;

      if (!response.ok) {
        setSubmitState("error");
        setSubmitError(
          payload?.message || "That review could not be saved. Try again."
        );
        return;
      }

      sound.playNeedleDrop();
      sound.playChime();

      setSubmitState("success");
      setName("");
      setRole("");
      setComment("");
      setRating("heavy-repeat");
      setColor(REVIEW_COLORS[0].hex);
      setIsFormOpen(false);
    } catch {
      setSubmitState("error");
      setSubmitError(
        "Could not reach the guestbook. Check your connection and try again."
      );
    }
  };

  const filteredEntries = useMemo(() => {
    if (selectedFilter === "all") return entries;
    return entries.filter((entry) => entry.rating === selectedFilter);
  }, [entries, selectedFilter]);

  const canSign = loadState === "ready";
  const signLabel =
    loadState === "unconfigured"
      ? "Guestbook Not Connected"
      : isFormOpen
        ? "Close Sign Form"
        : "Sign the Guestbook";

  return (
    <section className="section guestbook-section" id="guestbook">
      <div className="section-head" style={{ marginBottom: 24 }}>
        <div>
          <span className="mono-sm eyebrow-accent">
            <GuestbookIcon size={13} />
            I WAS HERE · VISITOR GUESTBOOK
          </span>
          <h2 className="display display-lg" style={{ marginTop: 8 }}>
            Drop off a review.
          </h2>
        </div>
        <p className="body-copy" style={{ margin: 0, maxWidth: "42ch" }}>
          Sign the sleeve with a review, feedback, or a quick hello. Every note is read
          and approved before it goes up.
        </p>
      </div>

      {/* Guestbook Stats & Quick Trigger */}
      <div className="guestbook-stats-bar">
        <div className="guestbook-stat-item">
          <span className="guestbook-stat-val">
            {loadState === "ready" ? entries.length : "—"}
          </span>
          <span className="guestbook-stat-lbl">Signatures</span>
        </div>
        <div className="guestbook-stat-item">
          <div className="guestbook-stars">
            <StarIcon size={12} filled />
            <StarIcon size={12} filled />
            <StarIcon size={12} filled />
            <StarIcon size={12} filled />
            <StarIcon size={12} filled />
          </div>
          <span className="guestbook-stat-lbl">Read &amp; approved</span>
        </div>
        <div className="guestbook-stat-item">
          <span className="mono-sm text-dim">● TAPE LOG 2026</span>
          <span className="guestbook-stat-lbl">Master Vinyl Board</span>
        </div>

        <button
          type="button"
          className="btn btn-primary guestbook-sign-trigger"
          disabled={!canSign}
          title={
            canSign
              ? "Leave a review for the guestbook"
              : "The guestbook is not accepting reviews right now"
          }
          onClick={() => {
            sound.playClick();
            const nextOpen = !isFormOpen;
            setIsFormOpen(nextOpen);
            if (nextOpen) {
              setSubmitState("idle");
              setSubmitError("");
            }
          }}
        >
          <SparkIcon size={14} />
          {signLabel}
        </button>
      </div>

      {submitState === "success" && (
        <div className="guestbook-notice" role="status" aria-live="polite">
          <CheckIcon size={15} />
          <p>
            <strong>Needle dropped.</strong> Your review is in the queue — it appears
            here once it is approved.
          </p>
        </div>
      )}

      {/* Interactive Signing Form */}
      {isFormOpen && canSign && (
        <form className="guestbook-form" onSubmit={handleSubmit}>
          <div className="guestbook-form-header">
            <span className="mono-sm" style={{ color: "var(--accent)" }}>
              ✍️ ADD YOUR SIGNATURE &amp; REVIEW
            </span>
            <span className="mono-sm text-dim">STEREO ENGRAVING</span>
          </div>

          <div className="guestbook-form-grid">
            <div className="form-group">
              <label className="mono-sm form-label" htmlFor="gb-name">
                Name / Handle *
              </label>
              <input
                id="gb-name"
                type="text"
                required
                maxLength={REVIEW_LIMITS.name}
                placeholder="e.g. Alex or @dev_alex"
                className="form-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="mono-sm form-label" htmlFor="gb-role">
                Role / Affiliation / City (Optional)
              </label>
              <input
                id="gb-role"
                type="text"
                maxLength={REVIEW_LIMITS.role}
                placeholder="e.g. ML Engineer, Recruiter, Bangalore"
                className="form-input"
                value={role}
                onChange={(event) => setRole(event.target.value)}
              />
            </div>
          </div>

          {/* Tape Rating Selection */}
          <div className="form-group" style={{ marginTop: 14 }}>
            <label className="mono-sm form-label">
              Your Review Rating / Stamp *
            </label>
            <div className="guestbook-rating-options">
              {(
                Object.keys(REVIEW_RATING_META) as ReviewRating[]
              ).map((key) => {
                const config = REVIEW_RATING_META[key];
                const isSelected = rating === key;
                return (
                  <button
                    key={key}
                    type="button"
                    className={`rating-pill-btn ${isSelected ? "selected" : ""}`}
                    onClick={() => {
                      sound.playClick();
                      setRating(key);
                    }}
                  >
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment / Review Textarea */}
          <div className="form-group" style={{ marginTop: 14 }}>
            <label className="mono-sm form-label" htmlFor="gb-comment">
              Your Review / Note *
            </label>
            <textarea
              id="gb-comment"
              required
              rows={3}
              maxLength={REVIEW_LIMITS.comment}
              placeholder="What caught your eye? Loved the JetNet architecture? The player dock? Drop your review here..."
              className="form-input form-textarea"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
          </div>

          {/* Vinyl Ring Color Picker & Submit */}
          <div className="guestbook-form-footer">
            <div className="color-picker-group">
              <span className="mono-sm form-label" style={{ margin: 0 }}>
                Vinyl Marker:
              </span>
              <div className="color-swatches">
                {REVIEW_COLORS.map((pal) => (
                  <button
                    key={pal.hex}
                    type="button"
                    title={pal.label}
                    className={`color-swatch-btn ${color === pal.hex ? "active" : ""}`}
                    style={{ backgroundColor: pal.hex }}
                    onClick={() => {
                      sound.playClick();
                      setColor(pal.hex);
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitState === "submitting"}
              >
                <DiscIcon size={14} />
                {submitState === "submitting"
                  ? "Engraving…"
                  : "Drop Needle & Sign"}
              </button>
            </div>
          </div>

          {submitState === "error" && submitError && (
            <p className="form-error" role="alert">
              {submitError}
            </p>
          )}
        </form>
      )}

      {loadState === "loading" && (
        <div className="guestbook-state" role="status" aria-live="polite">
          Loading the board…
        </div>
      )}

      {loadState === "unconfigured" && (
        <div className="guestbook-state" role="status" aria-live="polite">
          The guestbook is being set up. Check back soon.
        </div>
      )}

      {loadState === "error" && (
        <div className="guestbook-state" role="status" aria-live="polite">
          <span>The guestbook is offline right now.</span>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => void handleRetry()}
          >
            Try again
          </button>
        </div>
      )}

      {loadState === "ready" && entries.length > 0 && (
        <>
          {/* Filter Chips Bar */}
          <div className="guestbook-filter-bar">
            <span className="mono-sm text-dim">FILTER REVIEWS:</span>
            <div className="guestbook-filter-chips">
              <button
                type="button"
                className={`filter-chip ${selectedFilter === "all" ? "active" : ""}`}
                onClick={() => {
                  sound.playClick();
                  setSelectedFilter("all");
                }}
              >
                All Signs ({entries.length})
              </button>
              {(Object.keys(REVIEW_RATING_META) as ReviewRating[]).map((key) => {
                const count = entries.filter((entry) => entry.rating === key).length;
                if (count === 0) return null;
                return (
                  <button
                    key={key}
                    type="button"
                    className={`filter-chip ${selectedFilter === key ? "active" : ""}`}
                    onClick={() => {
                      sound.playClick();
                      setSelectedFilter(key);
                    }}
                  >
                    <span>{REVIEW_RATING_META[key].icon}</span>
                    <span>{REVIEW_RATING_META[key].label}</span>
                    <span className="filter-count">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reviews Feed Grid */}
          {filteredEntries.length > 0 ? (
            <div className="guestbook-feed-grid">
              {filteredEntries.map((entry) => {
                const config = ratingMeta(entry.rating);
                const entryColor = safeColor(entry.color);

                return (
                  <article key={entry.id} className="guestbook-card">
                    <div className="guestbook-card-top">
                      <div className="guestbook-author-meta">
                        {/* Stylized Vinyl Disc Avatar */}
                        <div
                          className="guestbook-avatar"
                          style={{
                            borderColor: entryColor,
                            boxShadow: `0 0 14px -3px ${entryColor}40`,
                          }}
                        >
                          <span
                            className="guestbook-avatar-core"
                            style={{ backgroundColor: entryColor }}
                          />
                          <span className="guestbook-avatar-initial">
                            {entry.name.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        <div>
                          <div className="guestbook-author-line">
                            <span className="guestbook-author-name">
                              {entry.name}
                            </span>
                          </div>
                          {entry.role && (
                            <span className="mono-sm guestbook-role">
                              {entry.role}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="guestbook-rating-badge">
                        <span>{config.icon}</span>
                        <span className="mono-sm">{config.label}</span>
                      </div>
                    </div>

                    <blockquote className="guestbook-quote">
                      &ldquo;{entry.comment}&rdquo;
                    </blockquote>

                    <div className="guestbook-card-bottom">
                      <span className="mono-sm guestbook-date">
                        {formatReviewDate(entry.createdAt)}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="guestbook-state" role="status">
              No reviews with that stamp yet.
            </div>
          )}
        </>
      )}

      {loadState === "ready" && entries.length === 0 && (
        <div className="guestbook-empty">
          <strong>The sleeve is blank — be the first to sign it.</strong>
          <span>Reviews appear here after they are approved.</span>
        </div>
      )}
    </section>
  );
}
