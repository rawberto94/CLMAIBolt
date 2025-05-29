import React, { useState } from 'react';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './components/dashboard/DashboardPage';
import ContractsPage from './components/documents/DocumentsPage';
import CompliancePage from './components/compliance/CompliancePage';
import CollaborationPage from './components/collaboration/CollaborationPage';
import ContractDetailsView from './components/documents/ContractDetailsView';
import ProjectEvaluation from './components/evaluation/ProjectEvaluation';
import ToolsPage from './components/tools/ToolsPage';
import SuppliersPage from './components/suppliers/SuppliersPage';
import { useLocation } from './contexts/LocationContext';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { updateLocation } = useLocation();

  // Use hash-based routing
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'dashboard';
      setCurrentPage(hash);
      updateLocation(hash);
    };

    // Set initial page based on hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const renderPage = () => {
    const parts = currentPage.split('/');
    const mainRoute = parts[0];
    const subRoute = parts[1];
    const projectId = parts[3]; // Get project ID from URL if present

    switch (mainRoute) {
      case 'dashboard':
        return <DashboardPage />;
      case 'contracts':
        if (subRoute === 'view') {
          const contractId = parts[2];
          return <ContractDetailsView contractId={contractId} />;
        }
        if (subRoute === 'view') {
          const contractId = parts[2];
          return <ContractDetailsView contractId={contractId} />;
        }
        return <ContractsPage />;
      case 'compliance':
        return <CompliancePage />;
      case 'collaboration':
        if (subRoute === 'new-discussion') {
          return <CollaborationPage showNewDiscussion={true} />;
        }
        return <CollaborationPage showNewDiscussion={false} />;
      case 'suppliers':
        return <SuppliersPage />;
      case 'tools':
        if (subRoute === 'evaluation' && projectId) {
          return <ProjectEvaluation projectId={projectId} />;
        }
        return <ToolsPage />;
      default:
        return <DashboardPage />;
    }
  }

  return (
    <MainLayout>
      {renderPage()}
    </MainLayout>
  );
}

export default App;