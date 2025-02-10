import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import { Toaster } from 'react-hot-toast';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Layout e Páginas
import { AppLayout } from './components/layout/AppLayout';
import { HomeContent } from './components/HomeContent';
import { ContractsList } from './components/contracts/ContractsList';
import { ContractDetails } from './components/contracts/ContractDetails';
import { ContractForm } from './components/contracts/ContractForm';
import { AnalysisList } from './components/analysis/AnalysisList';
import { RisksDashboard } from './components/risks/RisksDashboard';
import { ComplianceChecklist } from './components/compliance/ComplianceChecklist';
import { OrganizationsList } from './components/organizations/OrganizationsList';
import { UserManagement } from './components/admin/UserManagement';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UserProvider>
          <Router>
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<HomeContent />} />
                
                {/* Contratos */}
                <Route path="contracts">
                  <Route index element={<ContractsList />} />
                  <Route path="new" element={<ContractForm />} />
                  <Route path=":id" element={<ContractDetails />} />
                </Route>

                {/* Análises */}
                <Route path="analyses" element={<AnalysisList />} />

                {/* Riscos */}
                <Route path="risks" element={<RisksDashboard />} />

                {/* Compliance */}
                <Route path="compliance" element={<ComplianceChecklist />} />

                {/* Organizações */}
                <Route path="organizations" element={<OrganizationsList />} />

                {/* Admin */}
                <Route path="admin/users" element={<UserManagement />} />
              </Route>
            </Routes>
          </Router>
          <Toaster position="top-right" />
          <ReactQueryDevtools initialIsOpen={false} />
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
} 