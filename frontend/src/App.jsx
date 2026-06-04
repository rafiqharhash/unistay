import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import Home from './pages/Home';
import DistrictPage from './pages/DistrictPage';
import ApartmentDetail from './pages/ApartmentDetail';
import SearchResults from './pages/SearchResults';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminDistricts from './pages/admin/Districts';
import AdminApartments from './pages/admin/Apartments';
import { Link } from 'react-router-dom';

function App() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-900 transition-colors duration-300">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/districts/:id" element={<DistrictPage />} />
          <Route path="/apartments/:id" element={<ApartmentDetail />} />
          <Route path="/search" element={<SearchResults />} />

          {/* Admin Auth */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/districts"
            element={
              <ProtectedRoute>
                <AdminDistricts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/apartments"
            element={
              <ProtectedRoute>
                <AdminApartments />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <h1 className="font-display text-6xl font-bold text-primary-500">
                  {t('common.not_found_404')}
                </h1>
                <p className="text-xl text-dark-500 dark:text-dark-400">
                  {t('common.not_found_title')}
                </p>
                <Link to="/" className="btn-primary">{t('common.go_home')}</Link>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
