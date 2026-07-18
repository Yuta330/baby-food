import { useState } from 'react';
import { AppDataProvider } from './context/AppDataContext';
import { NavBar } from './components/layout/NavBar';
import { WeekPlannerPage } from './components/planner/WeekPlannerPage';
import { IngredientMasterPage } from './components/ingredients/IngredientMasterPage';
import { RecipeMasterPage } from './components/recipes/RecipeMasterPage';
import { WeekSummaryPage } from './components/summary/WeekSummaryPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { getMonday } from './utils/date';

export type Tab = 'planner' | 'ingredients' | 'recipes' | 'summary' | 'settings';

function App() {
  const [tab, setTab] = useState<Tab>('planner');
  const [weekStartDate, setWeekStartDate] = useState(() => getMonday(new Date()));

  return (
    <AppDataProvider>
      <NavBar current={tab} onChange={setTab} />
      {tab === 'planner' && (
        <WeekPlannerPage weekStartDate={weekStartDate} onWeekChange={setWeekStartDate} />
      )}
      {tab === 'ingredients' && <IngredientMasterPage />}
      {tab === 'recipes' && <RecipeMasterPage />}
      {tab === 'summary' && (
        <WeekSummaryPage weekStartDate={weekStartDate} onWeekChange={setWeekStartDate} />
      )}
      {tab === 'settings' && <SettingsPage />}
    </AppDataProvider>
  );
}

export default App;
