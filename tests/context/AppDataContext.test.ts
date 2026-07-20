import { describe, expect, it } from 'vitest';
import type { Action } from '../../src/context/AppDataContext';
import { appDataReducer } from '../../src/context/AppDataContext';
import type { AppData } from '../../src/types';

function emptyState(): AppData {
  return { ingredients: [], weekPlans: [], settings: {}, recipes: [] };
}

describe('appDataReducer / ADD_ENTRY', () => {
  it('週・日が未作成の状態からでも遅延生成してエントリを追加する', () => {
    const action: Action = {
      type: 'ADD_ENTRY',
      weekStartDate: '2026-07-20',
      date: '2026-07-22',
      mealIndex: 0,
      entry: { id: 'e1', ingredientId: 'a', grams: 30 },
    };
    const next = appDataReducer(emptyState(), action);

    const week = next.weekPlans.find((w) => w.weekStartDate === '2026-07-20');
    expect(week).toBeDefined();
    expect(week?.days).toHaveLength(7);
    const day = week?.days.find((d) => d.date === '2026-07-22');
    expect(day?.meals[0].entries).toEqual([{ id: 'e1', ingredientId: 'a', grams: 30 }]);
  });

  it('mealIndexが現在のmeals.lengthを超える場合は空mealで埋めてから追加する', () => {
    const action: Action = {
      type: 'ADD_ENTRY',
      weekStartDate: '2026-07-20',
      date: '2026-07-22',
      mealIndex: 2,
      entry: { id: 'e1', ingredientId: 'a', grams: 30 },
    };
    const next = appDataReducer(emptyState(), action);

    const day = next.weekPlans[0].days.find((d) => d.date === '2026-07-22');
    expect(day?.meals).toHaveLength(3);
    expect(day?.meals[0].entries).toEqual([]);
    expect(day?.meals[1].entries).toEqual([]);
    expect(day?.meals[2].entries).toEqual([{ id: 'e1', ingredientId: 'a', grams: 30 }]);
  });
});

describe('appDataReducer / UPDATE_ENTRY・DELETE_ENTRY', () => {
  function stateWithTwoEntries(): AppData {
    const withFirst = appDataReducer(emptyState(), {
      type: 'ADD_ENTRY',
      weekStartDate: '2026-07-20',
      date: '2026-07-22',
      mealIndex: 0,
      entry: { id: 'e1', ingredientId: 'a', grams: 10 },
    });
    return appDataReducer(withFirst, {
      type: 'ADD_ENTRY',
      weekStartDate: '2026-07-20',
      date: '2026-07-22',
      mealIndex: 0,
      entry: { id: 'e2', ingredientId: 'b', grams: 20 },
    });
  }

  it('UPDATE_ENTRYはentry.id一致の要素のみ更新する', () => {
    const next = appDataReducer(stateWithTwoEntries(), {
      type: 'UPDATE_ENTRY',
      weekStartDate: '2026-07-20',
      date: '2026-07-22',
      mealIndex: 0,
      entry: { id: 'e1', ingredientId: 'a', grams: 99 },
    });
    const entries = next.weekPlans[0].days.find((d) => d.date === '2026-07-22')?.meals[0].entries;
    expect(entries).toEqual([
      { id: 'e1', ingredientId: 'a', grams: 99 },
      { id: 'e2', ingredientId: 'b', grams: 20 },
    ]);
  });

  it('DELETE_ENTRYはentryId一致の要素のみ削除する', () => {
    const next = appDataReducer(stateWithTwoEntries(), {
      type: 'DELETE_ENTRY',
      weekStartDate: '2026-07-20',
      date: '2026-07-22',
      mealIndex: 0,
      entryId: 'e1',
    });
    const entries = next.weekPlans[0].days.find((d) => d.date === '2026-07-22')?.meals[0].entries;
    expect(entries).toEqual([{ id: 'e2', ingredientId: 'b', grams: 20 }]);
  });
});

describe('appDataReducer / RESCALE_RECIPE_GROUP', () => {
  function stateWithRecipeGroup(grams: number, baseGrams?: number): AppData {
    return appDataReducer(emptyState(), {
      type: 'ADD_ENTRY',
      weekStartDate: '2026-07-20',
      date: '2026-07-22',
      mealIndex: 0,
      entry: { id: 'e1', ingredientId: 'a', grams, baseGrams, recipeGroupId: 'g1' },
    });
  }

  it('baseGramsがあればbaseGramsを基準に再計算する', () => {
    const next = appDataReducer(stateWithRecipeGroup(40, 20), {
      type: 'RESCALE_RECIPE_GROUP',
      weekStartDate: '2026-07-20',
      date: '2026-07-22',
      mealIndex: 0,
      recipeGroupId: 'g1',
      multiplier: 2,
    });
    const entry = next.weekPlans[0].days.find((d) => d.date === '2026-07-22')?.meals[0].entries[0];
    expect(entry?.grams).toBe(40);
  });

  it('baseGrams未設定ならgramsをフォールバックとして使う', () => {
    const next = appDataReducer(stateWithRecipeGroup(20), {
      type: 'RESCALE_RECIPE_GROUP',
      weekStartDate: '2026-07-20',
      date: '2026-07-22',
      mealIndex: 0,
      recipeGroupId: 'g1',
      multiplier: 0.5,
    });
    const entry = next.weekPlans[0].days.find((d) => d.date === '2026-07-22')?.meals[0].entries[0];
    expect(entry?.grams).toBe(10);
  });

  it('計算結果が1未満になっても最低1にクランプする', () => {
    const next = appDataReducer(stateWithRecipeGroup(1, 1), {
      type: 'RESCALE_RECIPE_GROUP',
      weekStartDate: '2026-07-20',
      date: '2026-07-22',
      mealIndex: 0,
      recipeGroupId: 'g1',
      multiplier: 0.1,
    });
    const entry = next.weekPlans[0].days.find((d) => d.date === '2026-07-22')?.meals[0].entries[0];
    expect(entry?.grams).toBe(1);
  });
});

describe('appDataReducer / COPY_WEEK', () => {
  it('コピー元の週が存在しない場合はstateを変更しない(no-op)', () => {
    const state = emptyState();
    const next = appDataReducer(state, {
      type: 'COPY_WEEK',
      sourceWeekStartDate: '2026-07-13',
      targetWeekStartDate: '2026-07-20',
    });
    expect(next).toBe(state);
  });
});
