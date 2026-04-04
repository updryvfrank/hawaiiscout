import operatorsData from '../data/operators.json';

export interface Operator {
  id: number;
  name: string;
  activity: string;
  activities_secondary?: string[];
  islands: string[];
  price_low: number;
  price_high: number;
  fareharbor: 'yes' | 'no' | 'unknown';
  review_platforms: string[];
  website: string;
  notes: string;
}

export const operators: Operator[] = operatorsData.operators as Operator[];

export function getOperatorBySlug(slug: string): Operator | undefined {
  return operators.find(op => toSlug(op.name) === slug);
}

export function getOperatorsByActivity(activity: string): Operator[] {
  return operators.filter(
    op => op.activity.toLowerCase() === activity.toLowerCase() ||
    (op.activities_secondary || []).map(a => a.toLowerCase()).includes(activity.toLowerCase())
  );
}

export function getOperatorsByIsland(island: string): Operator[] {
  return operators.filter(op =>
    op.islands.map(i => i.toLowerCase()).includes(island.toLowerCase())
  );
}

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export const ISLANDS = ['oahu', 'maui', 'big-island', 'kauai', 'lanai', 'molokai'] as const;
export const ACTIVITIES = [
  'Helicopter', 'Luau', 'Snorkeling', 'Whale Watch', 'Cultural',
  'Land Tours', 'Submarine', 'Fishing', 'Surfing', 'Food Tours'
] as const;
