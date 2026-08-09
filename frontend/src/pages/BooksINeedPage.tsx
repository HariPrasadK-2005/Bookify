import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface WantedBook {
  id: number;
  title: string;
  author: string;
  subject: string;
  department: string;
  semester: string;
  description: string;
  status: string;
  createdAt: string;
}

const colors = ["#2F5D4E", "#D6684A", "#B9800F", "#4A5C8C", "#5F3F27", "#8B5E3C"];

export const BooksINeedPage = () => {
  const [wantedBooks, setWantedBooks] = useState<WantedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    subject: '',
    department: '',
    semester: 'Semester 1',
    description: ''
  });

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchWantedBooks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/wanted-books');
      setWantedBooks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWantedBooks();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/wanted-books', formData);
      triggerToast(`Added "${formData.title}" to your wishlist 🎉`);
      setShowModal(false);
      setFormData({
        title: '',
        author: '',
        subject: '',
        department: '',
        semester: 'Semester 1',
        description: ''
      });
      fetchWantedBooks();
    } catch (err: any) {
      triggerToast(err.response?.data?.message || 'Failed to add wanted book.');
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Remove "${title}" from your wishlist?`)) return;
    try {
      await api.delete(`/wanted-books/${id}`);
      triggerToast('Removed from wishlist');
      fetchWantedBooks();
    } catch (err: any) {
      triggerToast(err.response?.data?.message || 'Failed to remove book.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div className="page-head mb-0">
          <h2>Books I Need</h2>
          <p>Textbooks you're searching for — our matching engine will scan for 2-way swaps!</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-bookify btn-mustard"
        >
          ＋ Add Needed Book
        </button>
      </div>

      {toastMsg && (
        <div className="toast show">
          <span>{toastMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="empty">
          <div className="display">Loading wishlist...</div>
        </div>
      ) : wantedBooks.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📜</div>
          <div className="display">Your wishlist is empty</div>
          <p className="mb-4">Add textbooks you need for your upcoming courses!</p>
          <button onClick={() => setShowModal(true)} className="btn-bookify btn-mustard">
            ＋ Add Needed Book
          </button>
        </div>
      ) : (
        <div className="book-grid">
          {wantedBooks.map((book, idx) => {
            const coverColor = colors[idx % colors.length];
            return (
              <div key={book.id} className="book-card">
                <div
                  className="cover"
                  style={{ background: `linear-gradient(160deg, ${coverColor}, #1f2b23)` }}
                >
                  <div className="title">{book.title}</div>
                </div>
                <div className="book-info">
                  <div className="book-author">{book.author}</div>
                  <div className="badge-row">
                    <span className="badge condition">{book.semester}</span>
                    <span className="badge status-pending">{book.status}</span>
                  </div>

                  <div className="mt-4 pt-2 border-t border-[var(--line)] flex justify-end">
                    <button
                      onClick={() => handleDelete(book.id, book.title)}
                      className="text-xs font-bold text-[var(--clay-dark)] hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal to Add Needed Book */}
      {showModal && (
        <div className="modal-backdrop show">
          <div className="modal paper-form max-w-lg">
            <h3>Add a book to your wishlist</h3>
            <p>Tell other students what you're looking to receive</p>

            <form onSubmit={handleSubmit} className="form-grid">
              <div className="full">
                <label>Book title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Operating System Concepts"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div className="full">
                <label>Author *</label>
                <input
                  type="text"
                  name="author"
                  required
                  placeholder="e.g. Silberschatz, Galvin"
                  value={formData.author}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Subject *</label>
                <input
                  type="text"
                  name="subject"
                  required
                  placeholder="e.g. CS Theory"
                  value={formData.subject}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Department *</label>
                <input
                  type="text"
                  name="department"
                  required
                  placeholder="e.g. CSE"
                  value={formData.department}
                  onChange={handleChange}
                />
              </div>

              <div className="full">
                <label>Semester *</label>
                <select name="semester" value={formData.semester} onChange={handleChange}>
                  {['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'].map((sem) => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                </select>
              </div>

              <div className="full">
                <label>Notes / Preferred Edition</label>
                <textarea
                  name="description"
                  placeholder="e.g. Prefer 10th edition..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="full flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-bookify btn-paper"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-bookify btn-mustard"
                >
                  ＋ Add to Wishlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
