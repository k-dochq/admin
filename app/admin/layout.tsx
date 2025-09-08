import { DashboardLayout } from 'widgets/dashboard-layout/ui/DashboardLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
