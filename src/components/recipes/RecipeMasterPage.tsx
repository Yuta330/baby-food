import { useState } from 'react';
import type { Recipe, RecipeItem } from '../../types';
import { useAppData } from '../../context/AppDataContext';
import { createId } from '../../utils/id';
import { RecipeForm } from './RecipeForm';
import { RecipeList } from './RecipeList';
import styles from './RecipeMasterPage.module.css';

export function RecipeMasterPage() {
  const { data, addRecipe, updateRecipe, deleteRecipe } = useAppData();
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div className={styles.page}>
      {adding && (
        <RecipeForm
          ingredients={data.ingredients}
          onSave={(name, items: RecipeItem[]) => {
            addRecipe({ id: createId(), name, items });
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      {editing && (
        <RecipeForm
          key={editing.id}
          ingredients={data.ingredients}
          initial={editing}
          onSave={(name, items) => {
            updateRecipe({ id: editing.id, name, items });
            setEditing(null);
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      {!adding && !editing && (
        <button type="button" className={styles.addButton} onClick={() => setAdding(true)}>
          + 料理を追加
        </button>
      )}

      <RecipeList
        recipes={data.recipes}
        ingredients={data.ingredients}
        onEdit={(recipe) => {
          setAdding(false);
          setEditing(recipe);
        }}
        onDelete={(recipe) => {
          if (window.confirm(`「${recipe.name}」を削除しますか?`)) {
            deleteRecipe(recipe.id);
          }
        }}
      />
    </div>
  );
}
