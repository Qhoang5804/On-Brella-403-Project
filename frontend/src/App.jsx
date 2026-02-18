import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/MainLayout";
import { ScanErrorBoundary } from "./components/ScanErrorBoundary";
import { MapPage } from "./pages/MapPage";
import { ScanPage } from "./pages/ScanPage";
import { ActivePage } from "./pages/ActivePage";
import { ThankYouPage } from "./pages/ThankYouPage";
import { HistoryPage } from "./pages/HistoryPage";
import { ProfilePage } from "./pages/ProfilePage";

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route
          path="/scan"
          element={
            <ScanErrorBoundary>
              <ScanPage />
            </ScanErrorBoundary>
          }
        />
        <Route
          path="/scan/return"
          element={
            <ScanErrorBoundary>
              <ScanPage />
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
