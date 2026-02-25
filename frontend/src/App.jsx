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
import { UserProvider } from "./context/UserContext";
import { preloadStationData } from "./utils/stationNames";
import { HistoryPage } from "./pages/HistoryPage";
import LoginPage from "./pages/Login";
import SignUpPage from "./pages/SignUp";
import ForgotPasswordPage from "./pages/ForgotPassword";
import ProtectedRoute from "./components/ProtectedRoute";
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      }
    />
  </Routes>
  );
}

export default App;