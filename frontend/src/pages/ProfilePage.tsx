import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    college: user?.college || '',
    department: user?.department || '',
    year: user?.year || 1,
    phoneNumber: user?.phoneNumber || ''
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        college: user.college,
        department: user.department,
        year: user.year,
        phoneNumber: user.phoneNumber || ''
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/users/me', formData);
      triggerToast('Profile & Contact details updated! 🎉');
    } catch (err: any) {
      triggerToast(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-6">
      <div className="page-head text-center">
        <h2>Student Profile & Contact Info</h2>
        <p>Update your college details and contact number for lenders/borrowers</p>
      </div>

      {toastMsg && (
        <div className="toast show">
          <span>{toastMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="paper-form form-grid bg-[var(--paper)] p-6 rounded-xl border border-[var(--line)] shadow-xs">
        <div className="full">
          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            required
            value={formData.fullName}
            onChange={handleChange}
          />
        </div>

        <div className="full">
          <label>Contact Phone / WhatsApp Number</label>
          <input
            type="text"
            name="phoneNumber"
            placeholder="+91 9876543210"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
          <span className="text-[10px] text-[var(--ink-soft)] mt-1 block">
            Shared with lenders/borrowers when a borrowing request is sent or accepted.
          </span>
        </div>

        <div className="full">
          <label>College / University</label>
          <input
            type="text"
            name="college"
            required
            value={formData.college}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Department</label>
          <input
            type="text"
            name="department"
            required
            value={formData.department}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Academic Year</label>
          <input
            type="number"
            name="year"
            required
            min={1}
            max={10}
            value={formData.year}
            onChange={handleChange}
          />
        </div>

        <div className="full pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-bookify btn-forest"
          >
            {loading ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
