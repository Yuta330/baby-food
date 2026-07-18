import type { Ingredient, Recipe } from '../../types';
import styles from './RecipeList.module.css';

interface Props {
  recipes: Recipe[];
  ingredients: Ingredient[];
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
}

export function RecipeList({ recipes, ingredients, onEdit, onDelete }: Props) {
  const ingredientMap = new Map(ingredients.map((i) => [i.id, i]));

  if (recipes.length === 0) {
    return <p className={styles.empty}>料理がまだありません</p>;
  }

  return (
    <ul className={styles.list}>
      {recipes.map((recipe) => (
        <li key={recipe.id} className={styles.item}>
          <div className={styles.header}>
            <span className={styles.name}>{recipe.name}</span>
            <span className={styles.itemActions}>
              <button type="button" onClick={() => onEdit(recipe)}>
                編集
              </button>
              <button type="button" onClick={() => onDelete(recipe)}>
                削除
              </button>
            </span>
          </div>
          <div className={styles.chips}>
            {recipe.items.map((item, index) => (
              <span key={index} className={styles.chip}>
                {ingredientMap.get(item.ingredientId)?.name ?? '(削除された食材)'} {item.grams}g
              </span>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
