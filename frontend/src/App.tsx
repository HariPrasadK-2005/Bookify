import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { MyBooksPage } from './pages/MyBooksPage';
import { BooksINeedPage } from './pages/BooksINeedPage';
import { SearchBooksPage } from './pages/SearchBooksPage';
import { PotentialMatchesPage } from './pages/PotentialMatchesPage';
import { ExchangeRequestsPage } from './pages/ExchangeRequestsPage';
import { ProfilePage } from './pages/ProfilePage';

const RootRoute = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <LandingPage />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-shell">
          <Navbar />
          <div className="page-paper">
            <Routes>
              <Route path="/" element={<RootRoute />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />

              <Route path="/my-books" element={
                <ProtectedRoute>
                  <MyBooksPage />
                </ProtectedRoute>
              } />

              <Route path="/wanted-books" element={
                <ProtectedRoute>
                  <BooksINeedPage />
                </ProtectedRoute>
              } />

              <Route path="/search" element={<SearchBooksPage />} />

              <Route path="/matches" element={
                <ProtectedRoute>
                  <PotentialMatchesPage />
                </ProtectedRoute>
              } />

              <Route path="/exchanges" element={
                <ProtectedRoute>
                  <ExchangeRequestsPage />
                </ProtectedRoute>
              } />

              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
