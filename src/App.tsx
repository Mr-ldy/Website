/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Dashboard } from './components/Dashboard';
import { Admin } from './components/Admin';
import { Login } from './components/Login';
import { Toaster } from 'sonner';

const AppContent = () => {
  const { settings } = useApp();

  return (
    <div
      className="app-container relative overflow-x-hidden"
      style={{ backgroundImage: `url(${settings.wallpaper})` }}
    >
      <div className="relative z-10 w-full min-h-screen">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Toaster position="top-center" theme="dark" closeButton />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}
