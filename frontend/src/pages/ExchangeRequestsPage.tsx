import { useState, useEffect } from 'react';
import api from '../services/api';

interface ExchangeRequest {
  id: number;
  senderId: number;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  senderAverageRating: number;
  senderRatingCount: number;
  receiverId: number;
  receiverName: string;
  receiverEmail: string;
  receiverPhone?: string;
  receiverAverageRating: number;
  receiverRatingCount: number;
  offeredBookId?: number;
  offeredBookTitle: string;
  requestedBookId: number;
  requestedBookTitle: string;
  status: string;
  createdAt: string;
}

export const ExchangeRequestsPage = () => {
  const [activeSubtab, setActiveSubtab] = useState<'received' | 'sent'>('received');
  const [requests, setRequests] = useState<ExchangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Rating Modal State
  const [ratingModalUser, setRatingModalUser] = useState<{ id: number; name: string } | null>(null);
  const [starScore, setStarScore] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const endpoint = activeSubtab === 'received' ? '/exchanges/incoming' : '/exchanges/outgoing';
      const res = await api.get(endpoint);
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeSubtab]);

  const handleAccept = async (id: number) => {
    try {
      await api.put(`/exchanges/${id}/accept`);
      triggerToast('Request accepted! Contact details are now active. 📚');
      fetchRequests();
    } catch (err: any) {
      triggerToast(err.response?.data?.message || 'Failed to accept request.');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.put(`/exchanges/${id}/reject`);
      triggerToast('Request politely declined');
      fetchRequests();
    } catch (err: any) {
      triggerToast(err.response?.data?.message || 'Failed to reject request.');
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await api.put(`/exchanges/${id}/complete`);
      triggerToast('Lending marked as completed!');
      fetchRequests();
    } catch (err: any) {
      triggerToast(err.response?.data?.message || 'Failed to complete lending.');
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingModalUser) return;
    try {
      setSubmittingRating(true);
      await api.post('/ratings', {
        ratedUserId: ratingModalUser.id,
        score: starScore,
        comment: ratingComment
      });
      triggerToast(`⭐ Rating submitted for ${ratingModalUser.name}!`);
      setRatingModalUser(null);
      setRatingComment('');
      setStarScore(5);
      fetchRequests();
    } catch (err: any) {
      triggerToast(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div>
      <div className="page-head">
        <h2>Lending Requests & Trust Ratings</h2>
        <p>Review student requests, contact details, and rate lenders/borrowers</p>
      </div>

      {toastMsg && (
        <div className="toast show">
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="subtabs">
        <button
          className={`subtab ${activeSubtab === 'received' ? 'active' : ''}`}
          onClick={() => setActiveSubtab('received')}
        >
          Incoming Requests ({activeSubtab === 'received' ? requests.length : ''})
        </button>
        <button
          className={`subtab ${activeSubtab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveSubtab('sent')}
        >
          Outgoing Requests ({activeSubtab === 'sent' ? requests.length : ''})
        </button>
      </div>

      {loading ? (
        <div className="empty">
          <div className="display">Loading requests...</div>
        </div>
      ) : requests.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">{activeSubtab === 'received' ? '📬' : '✉️'}</div>
          <div className="display">
            {activeSubtab === 'received' ? 'No incoming requests yet' : 'You haven\'t asked to borrow any books yet'}
          </div>
          <p>
            {activeSubtab === 'received'
              ? 'When a student requests to borrow your textbook, their request, ratings, and contact details will appear here.'
              : 'Browse available books and send a borrowing request.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div key={r.id} className="req-card flex-col md:flex-row items-stretch md:items-center">
              <div className="flex-1 space-y-2">
                <div className="req-books">
                  📖 Requested Book: <span className="text-[var(--forest-dark)]">{r.requestedBookTitle}</span>
                </div>
                
                {/* Contact Information & Rating Card */}
                <div className="bg-[var(--card)] p-3 rounded-lg border border-[var(--line)] text-xs space-y-1">
                  {activeSubtab === 'received' ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[var(--forest-dark)]">👤 Requester (Borrower): {r.senderName}</span>
                        <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          ⭐ {r.senderAverageRating} ({r.senderRatingCount} ratings)
                        </span>
                      </div>
                      <div>📧 Email: <a href={`mailto:${r.senderEmail}`} className="font-semibold text-[var(--forest-dark)] hover:underline">{r.senderEmail}</a></div>
                      {r.senderPhone && (
                        <div>📞 Phone: <a href={`tel:${r.senderPhone}`} className="font-semibold text-[var(--forest-dark)] hover:underline">{r.senderPhone}</a></div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[var(--forest-dark)]">👤 Book Lender: {r.receiverName}</span>
                        <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          ⭐ {r.receiverAverageRating} ({r.receiverRatingCount} ratings)
                        </span>
                      </div>
                      <div>📧 Email: <a href={`mailto:${r.receiverEmail}`} className="font-semibold text-[var(--forest-dark)] hover:underline">{r.receiverEmail}</a></div>
                      {r.receiverPhone && (
                        <div>📞 Phone: <a href={`tel:${r.receiverPhone}`} className="font-semibold text-[var(--forest-dark)] hover:underline">{r.receiverPhone}</a></div>
                      )}
                    </>
                  )}
                </div>

                <div className="req-sub text-xs text-[var(--ink-soft)]">
                  Requested on {new Date(r.createdAt).toLocaleDateString()} · Status: <span className="font-bold text-[var(--forest-dark)]">{r.status}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 self-end md:self-center">
                {activeSubtab === 'received' && r.status === 'Pending' ? (
                  <div className="req-actions">
                    <button className="btn-bookify btn-mustard text-xs" onClick={() => handleAccept(r.id)}>
                      Accept & Share Book
                    </button>
                    <button className="btn-bookify btn-reject text-xs" onClick={() => handleReject(r.id)}>
                      Decline
                    </button>
                  </div>
                ) : r.status === 'Accepted' ? (
                  <button className="btn-bookify btn-forest text-xs" onClick={() => handleComplete(r.id)}>
                    Mark Handed Over
                  </button>
                ) : (
                  <span className={`badge ${
                    r.status === 'Accepted' ? 'status-available' :
                    r.status === 'Pending' ? 'status-pending' : 'status-exchanged'
                  }`}>
                    {r.status}
                  </span>
                )}

                {/* Rate User Button */}
                <button
                  onClick={() => setRatingModalUser({
                    id: activeSubtab === 'received' ? r.senderId : r.receiverId,
                    name: activeSubtab === 'received' ? r.senderName : r.receiverName
                  })}
                  className="btn-bookify btn-paper text-xs py-1 px-3 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold"
                >
                  ⭐ Rate {activeSubtab === 'received' ? 'Borrower' : 'Lender'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Star Rating Modal */}
      {ratingModalUser && (
        <div className="modal-backdrop">
          <div className="modal paper-form relative max-w-md">
            <button
              onClick={() => setRatingModalUser(null)}
              className="absolute top-4 right-4 text-stone-500 hover:text-stone-900 font-bold text-xl"
            >
              ✕
            </button>

            <h3 className="font-serif font-bold text-xl text-[var(--forest-dark)] mb-1">
              Rate & Review {ratingModalUser.name}
            </h3>
            <p className="text-xs text-[var(--ink-soft)] mb-4">
              Help build community trust by rating your lending experience!
            </p>

            <form onSubmit={handleSubmitRating} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[var(--forest-dark)] block mb-2">
                  Star Rating (1 to 5 ⭐)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setStarScore(star)}
                      className={`text-2xl transition-transform ${star <= starScore ? 'scale-110 text-amber-500' : 'text-stone-300'}`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-sm font-bold text-amber-900 ml-2 self-center">{starScore} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--forest-dark)] block mb-1">
                  Feedback Review (Optional)
                </label>
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="e.g. Very punctual, communicative, and returned the book in great condition!"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRatingModalUser(null)}
                  className="btn-bookify btn-paper text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRating}
                  className="btn-bookify btn-mustard text-xs"
                >
                  {submittingRating ? 'Submitting...' : 'Submit Rating ⭐'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
