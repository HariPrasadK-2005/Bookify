import { useState, useEffect } from 'react';
import api from '../services/api';

interface Match {
  matchedUserId: number;
  matchedUserName: string;
  matchedUserCollege: string;
  iWillGiveBookId: number;
  iWillGiveBookTitle: string;
  iWillReceiveBookId: number;
  iWillReceiveBookTitle: string;
}

export const PotentialMatchesPage = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await api.get('/matches');
      setMatches(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleSendExchange = async (match: Match) => {
    try {
      await api.post('/exchanges', {
        receiverId: match.matchedUserId,
        offeredBookId: match.iWillGiveBookId,
        requestedBookId: match.iWillReceiveBookId
      });
      triggerToast(`Request sent to ${match.matchedUserName} 📨`);
      fetchMatches();
    } catch (err: any) {
      triggerToast(err.response?.data?.message || 'Failed to send exchange request.');
    }
  };

  return (
    <div>
      <div className="page-head">
        <h2>Two-Way Exchange Matches</h2>
        <p>Reciprocal matches: You own what they need, and they own what you need!</p>
      </div>

      {toastMsg && (
        <div className="toast show">
          <span>{toastMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="empty">
          <div className="display">Scanning for matches...</div>
        </div>
      ) : matches.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🤝</div>
          <div className="display">No potential matches found right now</div>
          <p>Add books to your <strong>"My Shelf"</strong> and <strong>"Books I Need"</strong> to enable 2-way matchmaking!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match, idx) => (
            <div key={idx} className="req-card flex-col md:flex-row items-stretch md:items-center">
              <div className="flex-1 space-y-2">
                <div className="req-books flex items-center gap-3">
                  <span className="text-[var(--clay-dark)]">{match.iWillGiveBookTitle}</span>
                  <span className="swap-icon">⇄</span>
                  <span className="text-[var(--forest-dark)]">{match.iWillReceiveBookTitle}</span>
                </div>
                <div className="req-sub">
                  Matched with <strong>{match.matchedUserName}</strong> ({match.matchedUserCollege})
                </div>
              </div>

              <button
                onClick={() => handleSendExchange(match)}
                className="btn-bookify btn-mustard text-xs py-2 px-4 whitespace-nowrap self-end md:self-center"
              >
                Send Exchange Request
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
