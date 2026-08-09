import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const currentPath = location.pathname;

  return (
    <header>
      <div className="topbar">
        <Link to="/" className="brand">
          <div className="brand-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <div>
            <div className="brand-name">Bookify</div>
            <div className="brand-tag">lend a book, help a student</div>
          </div>
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            {/* Profile Button */}
            <Link
              to="/profile"
              className="flex items-center gap-2 bg-[var(--card)] hover:bg-[var(--paper)] border border-[var(--line)] px-3.5 py-1.5 rounded-full shadow-xs text-xs font-bold text-[var(--forest-dark)] transition-all hover:scale-105"
            >
              <span className="w-6 h-6 rounded-full bg-[var(--mustard)] text-[#3a2a05] font-serif font-bold flex items-center justify-center text-xs">
                {user?.fullName ? user.fullName[0].toUpperCase() : 'P'}
              </span>
              <span>👤 {user?.fullName || 'Profile'}</span>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="btn-bookify btn-reject text-xs py-1.5 px-4 rounded-full flex items-center gap-1 hover:brightness-95 transition-all"
            >
              🚪 Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-xs font-bold text-stone-700 hover:text-stone-900 px-3 py-1.5">
              Log in
            </Link>
            <Link to="/register" className="btn-bookify btn-forest text-xs py-1.5 px-3.5 rounded-full">
              Register
            </Link>
          </div>
        )}
      </div>

      {/* Wooden Bookshelf Nav */}
      <div className="shelf-wrap">
        <div className="shelf">
          <Link
            to="/search"
            className={`spine spine-browse ${currentPath === '/search' ? 'active' : ''}`}
          >
            Browse
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to="/dashboard"
                className={`spine spine-add ${currentPath === '/dashboard' ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              <Link
                to="/my-books"
                className={`spine spine-mybooks ${currentPath === '/my-books' ? 'active' : ''}`}
              >
                My Shelf
              </Link>
              <Link
                to="/wanted-books"
                className={`spine spine-add ${currentPath === '/wanted-books' ? 'active' : ''}`}
              >
                Books I Need
              </Link>
              <Link
                to="/matches"
                className={`spine spine-matches ${currentPath === '/matches' ? 'active' : ''}`}
              >
                Matches
              </Link>
              <Link
                to="/exchanges"
                className={`spine spine-requests ${currentPath === '/exchanges' ? 'active' : ''}`}
              >
                Requests
              </Link>
              <Link
                to="/profile"
                className={`spine spine-profile ${currentPath === '/profile' ? 'active' : ''}`}
              >
                Profile
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
