import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/MainLayout";
import { ScanErrorBoundary } from "./components/ScanErrorBoundary";
import { MapPage } from "./pages/MapPage";
import ScanPage2 from "./pages/ScanPage2";
import { ActivePage } from "./pages/ActivePage";
import { ThankYouPage } from "./pages/ThankYouPage";
import { ProfilePage } from "./pages/ProfilePage";
import { PersonalInfoPage } from "./pages/PersonalInfoPage";
import { ComingSoonPage } from "./pages/ComingSoonPage";
import { preloadStationData } from "./utils/stationNames";
import { HistoryPage } from "./pages/HistoryPage";
import LoginPage from "./pages/Login";
import SignUpPage from "./pages/SignUp";
import ForgotPasswordPage from "./pages/ForgotPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import { AdminLayout } from "./components/AdminLayout";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminReportsPage } from "./pages/admin/AdminReportsPage";
import UpdatePasswordPage from "./pages/UpdatePassword";

function App() {
  useEffect(() => {
    // Preload station data from API on app startup
    preloadStationData();
  }, []);

  return (
    <Routes>
    {/* Auth routes (no MainLayout) */}
    <Route path="/login" element={<LoginPage />} />
    <Route path="/sign-up" element={<SignUpPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />

    {/* Admin routes (AdminLayout, admin role required) */}
    <Route
      path="/admin"
      element={
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      }
    >
      <Route index element={<AdminDashboardPage />} />
      <Route path="users" element={<AdminUsersPage />} />
      <Route path="reports" element={<AdminReportsPage />} />
    </Route>

    {/* App routes (wrapped in MainLayout) */}
    <Route
      path="/*"
      element={
        <MainLayout>
          <Routes>
            <Route path="/update-password" element={<UpdatePasswordPage />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <MapPage />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/scan"
              element={
                <ProtectedRoute>
                  <ScanErrorBoundary>
                    <ScanPage2 />
                  </ScanErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="/scan/return"
              element={
                <ProtectedRoute>
                  <ScanErrorBoundary>
                    <ScanPage2 />
                  </ScanErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route 
              path="/active" 
              element={
                <ProtectedRoute>
                  <ActivePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/thank-you" 
              element={
                <ProtectedRoute>
                  <ThankYouPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/history" 
              element={
                <ProtectedRoute>
                  <HistoryPage />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/personal-info"
              element={
                <ProtectedRoute>
                  <PersonalInfoPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/payment-methods"
              element={
                <ProtectedRoute>
                  <ComingSoonPage title="Payment Methods" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/notifications"
              element={
                <ProtectedRoute>
                  <ComingSoonPage title="Notification Settings" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/help"
              element={
                <ProtectedRoute>
                  <ComingSoonPage title="Help & Support" />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      }
    />
  </Routes>
  );
}

export default App;