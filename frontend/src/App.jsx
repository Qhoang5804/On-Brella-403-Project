import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/MainLayout";
import { ScanErrorBoundary } from "./components/ScanErrorBoundary";
import { MapPage } from "./pages/MapPage";
import ScanPage2 from "./pages/ScanPage2";
import { ActivePage } from "./pages/ActivePage";
import { ThankYouPage } from "./pages/ThankYouPage";
import { ProfilePage } from "./pages/ProfilePage";
import { preloadStationData } from "./utils/stationNames";
import LoginPage from "./pages/Login";
import SignUpPage from "./pages/SignUp";
import ForgotPasswordPage from "./pages/ForgotPassword";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  useEffect(() => {
    // Preload station data from API on app startup
    preloadStationData();
  }, []);

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route
          path="/scan"
          element={
            <ScanErrorBoundary>
              <ScanPage2 />
            </ScanErrorBoundary>
          }
        />
        <Route
          path="/scan/return"
          element={
            <ScanErrorBoundary>
              <ScanPage2 />
            </ScanErrorBoundary>
          }
        />
        <Route path="/active" element={<ActivePage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/history" element={<Navigate to="/profile" replace />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
