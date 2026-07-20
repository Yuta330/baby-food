import { useState } from 'react';
import { AppDataProvider } from './context/AppDataContext';
import { NavBar } from './components/layout/NavBar';
import { WeekPlannerPage } from './components/planner/WeekPlannerPage';
import { IngredientMasterPage } from './components/ingredients/IngredientMasterPage';
import { RecipeMasterPage } from './components/recipes/RecipeMasterPage';
import { WeekSummaryPage } from './components/summary/WeekSummaryPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { getMonday, toDateKey } from './utils/date';

export type Tab = 'planner' | 'ingredients' | 'recipes' | 'summary' | 'settings';

function App() {
  const [tab, setTab] = useState<Tab>('planner');
  const now = new Date();
  const today = toDateKey(now);
  const todayWeekStart = getMonday(now);
  const [weekStartDate, setWeekStartDate] = useState(todayWeekStart);

  return (
    <AppDataProvider>
      <NavBar current={tab} onChange={setTab} />
      {tab === 'planner' && (
        <WeekPlannerPage
          weekStartDate={weekStartDate}
          onWeekChange={setWeekStartDate}
          today={today}
          todayWeekStart={todayWeekStart}
        />
      )}
      {tab === 'ingredients' && <IngredientMasterPage />}
      {tab === 'recipes' && <RecipeMasterPage />}
      {tab === 'summary' && (
        <WeekSummaryPage
          weekStartDate={weekStartDate}
          onWeekChange={setWeekStartDate}
          todayWeekStart={todayWeekStart}
        />
      )}
      {tab === 'settings' && <SettingsPage />}
    </AppDataProvider>
  );
}

export default App;
