import { AnimatePresence, motion } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthLayout from "./layouts/AuthLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OtpPage from "./pages/OtpPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import MessagesPage from "./pages/MessagesPage";
import SettingsPage from "./pages/SettingsPage";

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 }
};

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-dvh bg-bgPrimary text-textPrimary font-body">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <Routes location={location}>
            <Route path="/" element={<LandingPage />} />

            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/otp" element={<OtpPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/onboarding" element={<OnboardingPage />} />

              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route
                  path="/leaderboard"
                  element={
                    <div className="rounded-2xl border border-border bg-bgCard p-6 shadow-card">
                      <div className="font-heading text-2xl font-extrabold">Leaderboard</div>
                      <div className="mt-2 text-sm text-textSecondary">UI coming next.</div>
                    </div>
                  }
                />
                <Route
                  path="/settings"
                  element={<SettingsPage />}
                />
              </Route>
            </Route>
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
