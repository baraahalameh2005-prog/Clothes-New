import { ErrorBoundary } from './components/common/ErrorBoundary';
import { WardrobeDashboard } from './features/wardrobe/WardrobeDashboard';
import './App.css';

/** Standalone Wardrobe Management app: the wardrobe dashboard is the only page. */
export function App() {
  return (
    <div className="app">
      <div className="app__page">
        <ErrorBoundary title="تعذّر عرض هذه الصفحة">
          <WardrobeDashboard />
        </ErrorBoundary>
      </div>
    </div>
  );
}
