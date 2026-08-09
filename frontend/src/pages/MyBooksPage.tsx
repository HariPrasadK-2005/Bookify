import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface Book {
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
  createdAt: string;
}

const colors = ["#2F5D4E", "#D6684A", "#B9800F", "#4A5C8C", "#5F3F27", "#8B5E3C"];

export const MyBooksPage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    subject: '',
    department: '',
    semester: 'Semester 1',
    condition: 'Good',
    description: '',
    imageUrl: '',
    value: 0
  });

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/books');
      setBooks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const val = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData({ ...formData, [e.target.name]: val });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/books', formData);
      triggerToast(`"${formData.title}" added to your shelf 🎉`);
      setShowModal(false);
      setFormData({
        title: '',
        author: '',
        subject: '',
        department: '',
        semester: 'Semester 1',
        condition: 'Good',
        description: '',
        imageUrl: '',
        value: 0
      });
      fetchBooks();
    } catch (err: any) {
      triggerToast(err.response?.data?.message || 'Failed to add book.');
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to remove "${title}" from your shelf?`)) return;
    try {
      await api.delete(`/books/${id}`);
      triggerToast('Book removed from your shelf');
      fetchBooks();
    } catch (err: any) {
      triggerToast(err.response?.data?.message || 'Failed to delete book.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div className="page-head mb-0">
          <h2>My shelf</h2>
          <p>Books you've listed for exchange or lending with other students</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-bookify btn-forest"
        >
          ＋ List a Book
        </button>
      </div>

      {toastMsg && (
        <div className="toast show">
          <span>{toastMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="empty">
          <div className="display">Loading your shelf...</div>
        </div>
      ) : books.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🪶</div>
          <div className="display">Your shelf is empty</div>
          <p className="mb-4">List textbooks you own to start swapping!</p>
          <button onClick={() => setShowModal(true)} className="btn-bookify btn-mustard">
            ＋ List Your First Book
          </button>
        </div>
      ) : (
        <div className="book-grid">
          {books.map((book, idx) => {
            const coverColor = colors[idx % colors.length];
            return (
              <div key={book.id} className="book-card">
                <div
                  className="cover"
                  style={{
                    background: book.imageUrl
                      ? `url(${book.imageUrl}) center/cover no-repeat`
                      : `linear-gradient(160deg, ${coverColor}, #1f2b23)`
                  }}
                >
                  {!book.imageUrl && <div className="title">{book.title}</div>}
                </div>
                <div className="book-info">
                  <h4 className="font-serif font-bold text-base text-[var(--forest-dark)] line-clamp-1 mb-0.5">{book.title}</h4>
                  <div className="book-author">{book.author}</div>
                  <div className="badge-row">
                    <span className="badge condition">{book.condition}</span>
                    {book.value ? (
                      <span className="badge bg-emerald-100 text-emerald-800">₹{book.value}</span>
                    ) : null}
                    <span className={`badge ${
                      book.status === 'Available' ? 'status-available' :
                      book.status === 'ExchangePending' ? 'status-pending' : 'status-exchanged'
                    }`}>
                      {book.status}
                    </span>
                  </div>

                  <div className="mt-4 pt-2 border-t border-[var(--line)] flex justify-end">
                    <button
                      onClick={() => handleDelete(book.id, book.title)}
                      className="text-xs font-bold text-[var(--clay-dark)] hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal to List Book */}
      {showModal && (
        <div className="modal-backdrop show">
          <div className="modal paper-form max-w-lg">
            <h3>List a book on your shelf</h3>
            <p>Tell other students what textbook you're offering to lend</p>

            <form onSubmit={handleSubmit} className="form-grid">
              <div className="full">
                <label>Book title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Clean Code"
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
                  placeholder="e.g. Robert C. Martin"
                  value={formData.author}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Estimated Book Value / Retail Price (₹) *</label>
                <input
                  type="number"
                  name="value"
                  min={0}
                  step="any"
                  required
                  placeholder="e.g. 500"
                  value={formData.value || ''}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Condition *</label>
                <select name="condition" value={formData.condition} onChange={handleChange}>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Worn">Worn</option>
                </select>
              </div>

              <div className="full">
                <label>Upload Book Photo (Saved in Database)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="bg-white"
                />
                {formData.imageUrl && (
                  <div className="mt-2 text-xs text-green-700 font-bold flex items-center gap-2">
                    <span>✓ Photo loaded preview:</span>
                    <img src={formData.imageUrl} alt="preview" className="h-10 w-10 object-cover rounded border border-gray-300" />
                  </div>
                )}
              </div>

              <div>
                <label>Subject *</label>
                <input
                  type="text"
                  name="subject"
                  required
                  placeholder="e.g. CS / Programming"
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
                <label>Description</label>
                <textarea
                  name="description"
                  placeholder="Notes on wear, edition, or comments..."
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
                  className="btn-bookify btn-forest"
                >
                  ＋ Add to my shelf
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
