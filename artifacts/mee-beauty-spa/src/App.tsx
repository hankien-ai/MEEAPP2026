import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppShell } from '@/components/app-shell';
import DashboardPage from '@/pages/dashboard';
import { CustomerProfilePage, CustomersPage } from '@/pages/customers';
import CatalogPage from '@/pages/catalog';
import { AttendancePage, BookingPage, ExpensesPage, LoyaltyPage, PackagesPage, PosPage, ReportsPage, SettingsPage, StaffPage } from '@/pages/operations';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Router() {
  return <AppShell><RoutedErrorBoundary><Switch>
    <Route path="/" component={DashboardPage} />
    <Route path="/dashboard" component={DashboardPage} />
    <Route path="/customers" component={CustomersPage} />
    <Route path="/customers/:id" component={CustomerProfilePage} />
    <Route path="/catalog" component={CatalogPage} />
    <Route path="/catalog/services" component={CatalogPage} />
    <Route path="/catalog/products" component={CatalogPage} />
    <Route path="/packages" component={PackagesPage} />
    <Route path="/pos" component={PosPage} />
    <Route path="/staff" component={StaffPage} />
    <Route path="/staff/commissions" component={StaffPage} />
    <Route path="/attendance" component={AttendancePage} />
    <Route path="/loyalty" component={LoyaltyPage} />
    <Route path="/reports" component={ReportsPage} />
    <Route path="/booking" component={BookingPage} />
    <Route path="/expenses" component={ExpensesPage} />
    <Route path="/settings" component={SettingsPage} />
    <Route component={NotFound} />
  </Switch></RoutedErrorBoundary></AppShell>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;