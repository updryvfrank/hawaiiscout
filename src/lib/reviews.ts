import reviewsRaw from '../data/reviews.json';
import type { Operator } from './operators';

export interface PlatformData {
  rating: number | null;
  reviewCount: number | null;
  url: string | null;
  reviews: ReviewText[];
}

export interface ReviewText {
  author: string | null;
  rating: number | null;
  date: string | null;
  text: string;
}

export interface OperatorReviews {
  id: number;
  name: string;
  updatedAt: string;
  composite: number | null;
  platforms: {
    tripadvisor: PlatformData | null;
    google: PlatformData | null;
  };
}

const reviewsMap = reviewsRaw as Record<string, OperatorReviews>;

export function getReviews(operator: Operator): OperatorReviews | null {
  // Keys in reviews.json are operator ids — try both string and number forms
  return reviewsMap[String(operator.id)] ?? reviewsMap[operator.id as unknown as string] ?? null;
}

export function getAllReviewTexts(reviews: OperatorReviews | null, limit = 12): (ReviewText & { source: string })[] {
  if (!reviews) return [];
  return [
    ...(reviews.platforms.tripadvisor?.reviews ?? []).map(r => ({ ...r, source: 'TripAdvisor' })),
    ...(reviews.platforms.google?.reviews ?? []).map(r => ({ ...r, source: 'Google' })),
  ].filter(r => r.text).slice(0, limit);
}

export function getWinner(reviewsA: OperatorReviews | null, reviewsB: OperatorReviews | null): 'A' | 'B' | 'tie' | null {
  const a = reviewsA?.composite;
  const b = reviewsB?.composite;
  if (!a && !b) return null;
  if (!a) return 'B';
  if (!b) return 'A';
  if (a > b + 0.1) return 'A';
  if (b > a + 0.1) return 'B';
  return 'tie';
}

export function stars(rating: number | null): string {
  if (!rating) return '–';
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(Math.max(0, 5 - full));
}
