import { useState, useEffect } from 'react';
import api from '../services/api';

interface ExchangeRequest {
  id: number;
  senderId: number;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  receiverId: number;
  receiverName: string;
  receiverEmail: string;
  receiverPhone?: string;
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

  return (
    <div>
      <div className="page-head">
        <h2>Lending Requests</h2>
        <p>Review students who want to borrow your books and track your sent requests</p>
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
              ? 'When a student requests to borrow your textbook, their request and contact details will appear here.'
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
                
                {/* Contact Information Card */}
                <div className="bg-[var(--card)] p-3 rounded-lg border border-[var(--line)] text-xs space-y-1">
                  {activeSubtab === 'received' ? (
                    <>
                      <div className="font-bold text-[var(--forest-dark)]">
                        👤 Requester (Borrower): {r.senderName}
                      </div>
                      <div>📧 Email: <a href={`mailto:${r.senderEmail}`} className="font-semibold text-[var(--forest-dark)] hover:underline">{r.senderEmail}</a></div>
                      {r.senderPhone && (
                        <div>📞 Phone: <a href={`tel:${r.senderPhone}`} className="font-semibold text-[var(--forest-dark)] hover:underline">{r.senderPhone}</a></div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="font-bold text-[var(--forest-dark)]">
                        👤 Book Lender: {r.receiverName}
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

              {activeSubtab === 'received' && r.status === 'Pending' ? (
                <div className="req-actions self-end md:self-center">
                  <button className="btn-bookify btn-mustard text-xs" onClick={() => handleAccept(r.id)}>
                    Accept & Share Book
                  </button>
                  <button className="btn-bookify btn-reject text-xs" onClick={() => handleReject(r.id)}>
                    Decline
                  </button>
                </div>
              ) : r.status === 'Accepted' ? (
                <button className="btn-bookify btn-forest text-xs self-end md:self-center" onClick={() => handleComplete(r.id)}>
                  Mark Handed Over
                </button>
              ) : (
                <span className={`badge self-end md:self-center ${
                  r.status === 'Accepted' ? 'status-available' :
                  r.status === 'Pending' ? 'status-pending' : 'status-exchanged'
                }`}>
                  {r.status}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
