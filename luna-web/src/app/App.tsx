import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '@/components/Toast';
import { ClientsPage } from './ClientsPage';
import { DashboardPage } from './DashboardPage';
import { FinancePage } from './FinancePage';
import { SettingsPage } from './SettingsPage';
import { SuppliersPage } from './SuppliersPage';

export function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}
