import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface BookResponse {
  id: number;
  title: string;
  author: string;
  subject: string;
  department: string;
  semester: string;
  condition: string;
  description: string;
  imageUrl?: string;
  value?: number;
  status: string;
  ownerId: number;
  ownerCollege: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  ownerAverageRating: number;
  ownerRatingCount: number;
}

const colors = ["#2F5D4E", "#D6684A", "#B9800F", "#4A5C8C", "#5F3F27", "#8B5E3C"];

export const SearchBooksPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [books, setBooks] = useState<BookResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [condFilter, setCondFilter] = useState('All');

  // Modal State
  const [selectedBook, setSelectedBook] = useState<BookResponse | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const searchBooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('query', search);
      if (catFilter !== 'All') params.append('subject', catFilter);

      const res = await api.get(`/books/search?${params.toString()}`);
      setBooks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchBooks();
  }, [search, catFilter, isAuthenticated]);

  const filteredBooks = books.filter(b => 
    condFilter === 'All' || b.condition.toLowerCase() === condFilter.toLowerCase()
  );

  const handleBorrowRequest = async () => {
    if (!selectedBook) return;
    try {
      setRequesting(true);
      await api.post('/exchanges', {
        receiverId: selectedBook.ownerId,
        requestedBookId: selectedBook.id,
        offeredBookId: null
      });
      triggerToast(`Borrowing request sent to ${selectedBook.ownerName} 📚`);
      setSelectedBook(null);
      searchBooks();
    } catch (err: any) {
      triggerToast(err.response?.data?.message || 'Failed to send borrowing request.');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div>
      <div className="page-head">
        <h2>Browse Books to Borrow</h2>
        <p>{books.length} books offered by generous students for lending — Click any card for details & lender trust ratings!</p>
      </div>

      {toastMsg && (
        <div className="toast show">
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="toolbar">
        <div className="search-box">
          <span>🔎</span>
          <input
            type="text"
            placeholder="Search by title or author…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="All">All Subjects</option>
          <option value="Programming">Programming</option>
          <option value="DBMS">DBMS / Data</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Engineering">Engineering</option>
        </select>

        <select value={condFilter} onChange={(e) => setCondFilter(e.target.value)}>
          <option value="All">All Conditions</option>
          <option value="Like New">Like New</option>
          <option value="Good">Good</option>
          <option value="Fair">Fair</option>
        </select>
      </div>

      {loading ? (
        <div className="empty">
          <div className="display">Browsing the shelves...</div>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📭</div>
          <div className="display">No books match yet</div>
          <p>Try a different search query or filter.</p>
        </div>
      ) : (
        <div className="book-grid">
          {filteredBooks.map((b, idx) => {
            const coverColor = colors[idx % colors.length];
            return (
              <div
                key={b.id}
                className="book-card cursor-pointer"
                onClick={() => setSelectedBook(b)}
              >
                <div
                  className="cover"
                  style={{
                    background: b.imageUrl
                      ? `url(${b.imageUrl}) center/cover no-repeat`
                      : `linear-gradient(160deg, ${coverColor}, #1f2b23)`
                  }}
                >
                  {!b.imageUrl && <div className="title">{b.title}</div>}
                </div>
                <div className="book-info">
                  <h4 className="font-serif font-bold text-base text-[var(--forest-dark)] line-clamp-1 mb-0.5">{b.title}</h4>
                  <div className="book-author">{b.author}</div>
                  <div className="badge-row mb-2">
                    <span className="badge condition">{b.condition}</span>
                    {b.value ? (
                      <span className="badge bg-emerald-100 text-emerald-800">₹{b.value}</span>
                    ) : null}
                    <span className="badge status-available">Available</span>
                  </div>
                  <div className="text-xs text-[var(--ink-soft)] font-medium pt-2 border-t border-[var(--line)] flex justify-between items-center">
                    <span>👤 {b.ownerName || 'Student'}</span>
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      ⭐ {b.ownerAverageRating} ({b.ownerRatingCount})
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Book Detail & Lender Rating Modal */}
      {selectedBook && (
        <div className="modal-backdrop">
          <div className="modal relative">
            <button
              onClick={() => setSelectedBook(null)}
              className="absolute top-4 right-4 text-stone-500 hover:text-stone-900 font-bold text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-200/50 transition-colors"
            >
              ✕
            </button>

            <div className="flex flex-col sm:flex-row gap-6 items-start mb-6">
              {/* Cover Image */}
              <div
                className="w-full sm:w-40 h-52 rounded-xl flex-shrink-0 shadow-md relative overflow-hidden flex items-end p-3"
                style={{
                  background: selectedBook.imageUrl
                    ? `url(${selectedBook.imageUrl}) center/cover no-repeat`
                    : `linear-gradient(160deg, #2F5D4E, #203F35)`
                }}
              >
                <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-black/20" />
                {!selectedBook.imageUrl && (
                  <div className="font-serif font-bold text-white text-sm leading-tight text-shadow">
                    {selectedBook.title}
                  </div>
                )}
              </div>

              {/* Info Column */}
              <div className="flex-1 space-y-2">
                <h3 className="font-serif font-bold text-2xl text-[var(--forest-dark)] leading-snug">
                  {selectedBook.title}
                </h3>
                <div className="text-sm font-semibold text-[var(--ink-soft)]">
                  by {selectedBook.author}
                </div>

                <div className="badge-row py-1">
                  <span className="badge condition">{selectedBook.condition}</span>
                  {selectedBook.value ? (
                    <span className="badge bg-emerald-100 text-emerald-800 font-bold">Estimated Worth: ₹{selectedBook.value}</span>
                  ) : null}
                  <span className="badge status-available">Available to Lend</span>
                  <span className="badge">{selectedBook.semester}</span>
                </div>

                {selectedBook.description && (
                  <p className="text-xs text-[var(--ink-soft)] bg-[var(--paper)] p-3 rounded-lg border border-[var(--line)] leading-relaxed">
                    {selectedBook.description}
                  </p>
                )}

                {/* Lender Contact Details & Trust Rating */}
                <div className="pt-3 border-t border-[var(--line)] space-y-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-xs text-[var(--forest-dark)] uppercase tracking-wider">Lender & Community Trust</span>
                    <span className="font-bold text-xs text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                      ⭐ {selectedBook.ownerAverageRating} / 5.0 ({selectedBook.ownerRatingCount} ratings)
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs font-semibold text-[var(--ink)]">
                    <span className="w-6 h-6 rounded-full bg-[var(--mustard)] text-[#3a2a05] font-serif font-bold flex items-center justify-center text-xs">
                      {selectedBook.ownerName ? selectedBook.ownerName[0].toUpperCase() : 'L'}
                    </span>
                    <span>{selectedBook.ownerName}</span>
                    <span className="text-[var(--ink-soft)]">({selectedBook.ownerCollege})</span>
                  </div>
                  <div className="text-xs text-[var(--ink-soft)] pl-8 space-y-0.5">
                    <div>📧 <strong>Email:</strong> <a href={`mailto:${selectedBook.ownerEmail}`} className="text-[var(--forest-dark)] hover:underline">{selectedBook.ownerEmail}</a></div>
                    {selectedBook.ownerPhone && (
                      <div>📞 <strong>Phone:</strong> <a href={`tel:${selectedBook.ownerPhone}`} className="text-[var(--forest-dark)] hover:underline">{selectedBook.ownerPhone}</a></div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Borrowing Section */}
            <div className="border-t border-[var(--line)] pt-4 mt-2">
              {!isAuthenticated ? (
                <div className="text-center py-2">
                  <p className="text-xs text-[var(--ink-soft)] mb-3">Log in to borrow this textbook for free</p>
                  <Link to="/login" className="btn-bookify btn-forest text-xs py-2 px-5">
                    Log in to Borrow
                  </Link>
                </div>
              ) : selectedBook.ownerId === user?.id ? (
                <div className="text-center text-xs font-bold text-[var(--ink-soft)] bg-[var(--paper)] p-3 rounded-xl border border-[var(--line)]">
                  This is your own listed book available for lending.
                </div>
              ) : (
                <div className="space-y-3 bg-[var(--paper)] p-4 rounded-xl border border-[var(--line)] text-center">
                  <p className="text-xs text-[var(--ink-soft)] font-medium">
                    Need this textbook? Send a free borrowing request directly to <strong>{selectedBook.ownerName}</strong>!
                  </p>

                  <button
                    onClick={handleBorrowRequest}
                    disabled={requesting}
                    className="btn-bookify btn-mustard w-full justify-center py-2.5 mt-2"
                  >
                    {requesting ? 'Sending Request...' : 'Request to Borrow This Book 📚'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
