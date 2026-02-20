import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/MainLayout";
import { ScanErrorBoundary } from "./components/ScanErrorBoundary";
import { MapPage } from "./pages/MapPage";
import ScanPage2 from "./pages/ScanPage2";
import { ActivePage } from "./pages/ActivePage";
import { ThankYouPage } from "./pages/ThankYouPage";
import { HistoryPage } from "./pages/HistoryPage";
import { ProfilePage } from "./pages/ProfilePage";
import { preloadStationData } from "./utils/stationNames";

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
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
