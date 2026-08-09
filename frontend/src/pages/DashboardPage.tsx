import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export const DashboardPage = () => {
  const [stats, setStats] = useState({
    myBooks: 0,
    wantedBooks: 0,
    incomingRequests: 0,
    outgoingRequests: 0,
    matches: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [booksRes, wantedRes, incomingRes, outgoingRes, matchesRes] = await Promise.all([
          api.get('/books'),
          api.get('/wanted-books'),
          api.get('/exchanges/incoming'),
          api.get('/exchanges/outgoing'),
          api.get('/matches')
        ]);
        
        setStats({
          myBooks: booksRes.data.length,
          wantedBooks: wantedRes.data.length,
          incomingRequests: incomingRes.data.filter((r: any) => r.status === 'Pending').length,
          outgoingRequests: outgoingRes.data.filter((r: any) => r.status === 'Pending').length,
          matches: matchesRes.data.length
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div>
      <div className="page-head">
        <h2>Dashboard</h2>
        <p>Overview of your bookshelf, wishlist, and active exchange requests</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--paper)] border border-[var(--line)] rounded-xl p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--forest-dark)]">My Shelf</div>
          <div className="font-serif text-4xl font-bold text-[var(--forest-dark)] mt-2">{stats.myBooks}</div>
          <Link to="/my-books" className="inline-block text-xs font-bold text-[var(--forest)] hover:underline mt-4">
            View my shelf →
          </Link>
        </div>

        <div className="bg-[var(--paper)] border border-[var(--line)] rounded-xl p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--mustard-dark)]">Books Needed</div>
          <div className="font-serif text-4xl font-bold text-[var(--mustard-dark)] mt-2">{stats.wantedBooks}</div>
          <Link to="/wanted-books" className="inline-block text-xs font-bold text-[var(--mustard-dark)] hover:underline mt-4">
            View wishlist →
          </Link>
        </div>

        <div className="bg-[var(--paper)] border border-[var(--line)] rounded-xl p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--clay-dark)]">Pending Requests</div>
          <div className="font-serif text-4xl font-bold text-[var(--clay-dark)] mt-2">
            {stats.incomingRequests + stats.outgoingRequests}
          </div>
          <Link to="/exchanges" className="inline-block text-xs font-bold text-[var(--clay-dark)] hover:underline mt-4">
            View requests →
          </Link>
        </div>

        <div className="bg-[var(--paper-2)] border border-[var(--line)] rounded-xl p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-900">Potential Matches</div>
          <div className="font-serif text-4xl font-bold text-indigo-900 mt-2">{stats.matches}</div>
          <Link to="/matches" className="inline-block text-xs font-bold text-indigo-800 hover:underline mt-4">
            View 2-way matches →
          </Link>
        </div>
      </div>
    </div>
  );
};
