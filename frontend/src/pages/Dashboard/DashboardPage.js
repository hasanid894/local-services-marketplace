import { useRole } from '../../hooks/useRole';
import CustomerDashboard from './CustomerDashboard';
import ProviderDashboard from './ProviderDashboard';
import AdminDashboard from './AdminDashboard';

export default function DashboardPage() {
  const { isAdmin, isProvider } = useRole();

  if (isAdmin) return <AdminDashboard />;
  if (isProvider) return <ProviderDashboard />;
  return <CustomerDashboard />;
}
