import { Navigate, Routes, Route } from "react-router";
import SignInPage from "../pages/signInPage";
import Dashboard from "../pages/Dashboard";
import Dispatches from "../pages/Dispatches";
import AgencyLayout from "../components/AgencyLayout";
import ComingSoon from "../pages/ComingSoon";

function AppRoutes() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<SignInPage />} />

        <Route path="/agency" element={<AgencyLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="dispatches" element={<Dispatches />} />
        </Route>
        <Route path="*" element={<Navigate to="/signin" replace />} />
        <Route path="/agency" element={<AgencyLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="dispatches" element={<Dispatches />} />
          <Route path="inventory" element={<ComingSoon />} />
          <Route path="trips" element={<ComingSoon />} />
          <Route path="monitoring" element={<ComingSoon />} />
          <Route path="fleet" element={<ComingSoon />} />
          <Route path="outlets" element={<ComingSoon />} />
          <Route path="orders" element={<ComingSoon />} />
          <Route path="settings" element={<ComingSoon />} />
        </Route>
      </Routes>
    </div>
  );
}

export default AppRoutes;
