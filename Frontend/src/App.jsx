// src/App.jsx
import MainLayout from './layouts/MainLayout';

function App() {
  return (
    <MainLayout>
      {/* Temporary test content — replace with <AppRoutes /> once pages exist */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="font-display text-4xl text-ink tracking-tightish">
          Chapter &amp; Verse
        </h1>
        <p className="font-sans text-ink/70 mt-3">
          Layout, Navbar, and Footer test render.
        </p>
      </div>
    </MainLayout>
  );
}

export default App;