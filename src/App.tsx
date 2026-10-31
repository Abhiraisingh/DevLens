import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { LandingView } from './views/LandingView';
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { RepositoriesView } from './views/RepositoriesView';
import { PullRequestExplorerView } from './views/PullRequestExplorerView';
import { DiffReviewView } from './views/DiffReviewView';
import { FindingsListView } from './views/FindingsListView';
import { AnalyticsView } from './views/AnalyticsView';
import { SystemArchitectureView } from './views/SystemArchitectureView';
import { SettingsView } from './views/SettingsView';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [viewContext, setViewContext] = useState<any>({});

  const handleNavigate = (view: string, context: any = {}) => {
    setCurrentView(view);
    setViewContext(context);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-gray-400 font-mono text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>DevLens Engine Booting...</span>
        </div>
      </div>
    );
  }

  // If user is not logged in and wants auth
  if (!user && currentView === 'auth') {
    return <AuthView onSuccess={() => handleNavigate('dashboard')} />;
  }

  // If user is not logged in, show Landing page by default
  if (!user && currentView === 'landing') {
    return <LandingView onGetStarted={() => handleNavigate('auth')} />;
  }

  // If user is logged in but clicked landing, allow viewing landing
  if (currentView === 'landing') {
    return <LandingView onGetStarted={() => handleNavigate('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 flex flex-col font-sans">
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          openPrCount={3}
          newFindingsCount={4}
        />

        <main className="flex-1 min-w-0 overflow-y-auto bg-[#0d1117]">
          {currentView === 'dashboard' && <DashboardView onNavigate={handleNavigate} />}
          {currentView === 'repositories' && <RepositoriesView onNavigate={handleNavigate} />}
          {currentView === 'pull-requests' && (
            <PullRequestExplorerView
              initialRepoId={viewContext?.repoId}
              onNavigate={handleNavigate}
            />
          )}
          {currentView === 'diff-review' && (
            <DiffReviewView
              initialPrId={viewContext?.prId}
              onNavigate={handleNavigate}
            />
          )}
          {currentView === 'findings' && <FindingsListView onNavigate={handleNavigate} />}
          {currentView === 'analytics' && <AnalyticsView />}
          {currentView === 'architecture' && <SystemArchitectureView />}
          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
