import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Recordkeeping from "./pages/Recordkeeping";
import Transactions from "./pages/Transactions";
import ShareholderPortal from "./pages/ShareholderPortal";
import ProxyVoting from "./pages/ProxyVoting";
import Compliance from "./pages/Compliance";
import EquityPlans from "./pages/EquityPlans";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/recordkeeping"} component={Recordkeeping} />
      <Route path={"/transactions"} component={Transactions} />
      <Route path={"/shareholder-portal"} component={ShareholderPortal} />
      <Route path={"/proxy-voting"} component={ProxyVoting} />
      <Route path={"/compliance"} component={Compliance} />
      <Route path={"/equity-plans"} component={EquityPlans} />
      <Route path={"/analytics"} component={Analytics} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
