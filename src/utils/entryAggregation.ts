import type { PlanEntry } from '../types';

export interface AggregatedEntryGroup {
  ingredientId: string;
  totalGrams: number;
  items: PlanEntry[];
}

export function groupEntriesByIngredient(entries: PlanEntry[]): AggregatedEntryGroup[] {
  const order: string[] = [];
  const groups = new Map<string, AggregatedEntryGroup>();

  for (const entry of entries) {
    let group = groups.get(entry.ingredientId);
    if (!group) {
      group = { ingredientId: entry.ingredientId, totalGrams: 0, items: [] };
      groups.set(entry.ingredientId, group);
      order.push(entry.ingredientId);
    }
    group.items.push(entry);
    group.totalGrams += entry.grams;
  }

  return order.map((id) => groups.get(id)!);
}
