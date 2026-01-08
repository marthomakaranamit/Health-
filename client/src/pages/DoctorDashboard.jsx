import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [creatingVisit, setCreatingVisit] = useState(false);
  const [visitError, setVisitError] = useState('');
  const [visitForm, setVisitForm] = useState({
    patientID: '',
    diagnosis: '',
    prescription: '',
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [patientsRes, appointmentsRes, visitsRes] = await Promise.all([
        api.get('/patients'),
        api.get('/appointments'),
        api.get('/visits'),
      ]);
      setPatients(patientsRes.data || []);
      setAppointments(appointmentsRes.data || []);
      setVisits(visitsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVisitChange = (e) => {
    setVisitForm({
      ...visitForm,
      [e.target.name]: e.target.value,
    });
    setVisitError('');
  };

  const handleCreateVisit = async (e) => {
    e.preventDefault();
    setVisitError('');

    if (!visitForm.patientID || !visitForm.diagnosis || !visitForm.prescription) {
      setVisitError('Patient, diagnosis, and prescription are required');
      return;
    }

    try {
      setCreatingVisit(true);
      const res = await api.post('/visits', {
        patientID: visitForm.patientID,
        diagnosis: visitForm.diagnosis,
        prescription: visitForm.prescription,
        notes: visitForm.notes,
      });
      // Prepend new visit
      setVisits((prev) => [res.data.visit, ...prev]);
      setVisitForm({
        patientID: '',
        diagnosis: '',
        prescription: '',
        notes: '',
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.errors) && err.response.data.errors[0]?.msg) ||
        'Failed to add visit';
      setVisitError(msg);
    } finally {
      setCreatingVisit(false);
    }
  };

  const findPatientName = (value) => {
    if (!value) return 'Patient';

    // If we got a populated object, try to use its fields directly
    if (typeof value === 'object') {
      const directName = value.name;
      if (directName) return directName;
    }

    const id = typeof value === 'object' ? value._id : value;

    const p = patients.find(
      (pt) => pt.patientID?._id === id || pt.patientID === id || pt._id === id,
    );

    if (p) {
      const baseName = p.patientID?.name || p.name || 'Patient';
      return baseName;
    }

    // Fallback – never return an object to JSX
    if (typeof value === 'string') return value;
    return 'Patient';
  };

  const formatDate = (date) => new Date(date).toLocaleString();

  return (
    <div style={{ padding: '2rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h1>Doctor Dashboard</h1>
        <div>
          <span style={{ marginRight: '1rem' }}>Welcome, Dr. {user?.name}</span>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '0.75rem',
            marginBottom: '1rem',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '4px',
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading data...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.5rem' }}>
          {/* Visits & Form */}
          <div
            style={{
              padding: '1.25rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>Add Medical Visit</h2>
              <button
                onClick={fetchData}
                style={{
                  padding: '0.35rem 0.75rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                Refresh
              </button>
            </div>

            {visitError && (
              <div
                style={{
                  padding: '0.75rem',
                  marginTop: '0.75rem',
                  backgroundColor: '#f8d7da',
                  color: '#721c24',
                  borderRadius: '4px',
                }}
              >
                {visitError}
              </div>
            )}

            <form onSubmit={handleCreateVisit} style={{ marginTop: '1rem' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label
                  htmlFor="patientID"
                  style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 500 }}
                >
                  Patient
                </label>
                <select
                  id="patientID"
                  name="patientID"
                  value={visitForm.patientID}
                  onChange={handleVisitChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">Select patient</option>
                  {patients.map((p) => {
                    const id = p.patientID?._id || p._id || '';
                    const name = p.patientID?.name || p.name || 'Patient';
                    const email = p.patientID?.email || p.email || '';
                    return (
                      <option key={id} value={id}>
                        {name} {email ? `(${email})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label
                  htmlFor="diagnosis"
                  style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 500 }}
                >
                  Diagnosis
                </label>
                <input
                  id="diagnosis"
                  name="diagnosis"
                  type="text"
                  value={visitForm.diagnosis}
                  onChange={handleVisitChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label
                  htmlFor="prescription"
                  style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 500 }}
                >
                  Prescription
                </label>
                <input
                  id="prescription"
                  name="prescription"
                  type="text"
                  value={visitForm.prescription}
                  onChange={handleVisitChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor="notes"
                  style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 500 }}
                >
                  Notes (optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={visitForm.notes}
                  onChange={handleVisitChange}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={creatingVisit}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: creatingVisit ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                }}
              >
                {creatingVisit ? 'Saving...' : 'Add Visit'}
              </button>
            </form>

            <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem' }}>Recent Visits</h3>
            {visits.length === 0 ? (
              <p>No visits yet.</p>
            ) : (
              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {visits.map((v) => (
                  <div
                    key={v._id}
                    style={{
                      padding: '0.75rem',
                      marginBottom: '0.6rem',
                      border: '1px solid #eee',
                      borderRadius: '6px',
                      background: '#fafafa',
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{findPatientName(v.patientID)}</div>
                    <div style={{ color: '#555', margin: '0.25rem 0' }}>{v.diagnosis}</div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>Rx: {v.prescription}</div>
                    {v.notes && <div style={{ fontSize: '0.9rem', color: '#666' }}>Notes: {v.notes}</div>}
                    <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.25rem' }}>
                      {formatDate(v.visitDate || v.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Appointments */}
          <div
            style={{
              padding: '1.25rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
              }}
            >
              <h2 style={{ margin: 0 }}>Appointments</h2>
              <button
                onClick={fetchData}
                style={{
                  padding: '0.35rem 0.75rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                Refresh
              </button>
            </div>

            {appointments.length === 0 ? (
              <p>No appointments scheduled.</p>
            ) : (
              <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.9rem',
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
                        Patient
                      </th>
                      <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
                        Date
                      </th>
                      <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((a) => (
                      <tr key={a._id}>
                        <td style={{ padding: '0.5rem', borderBottom: '1px solid #f0f0f0' }}>
                          {a.patientID?.name || 'Patient'} {a.patientID?.email ? `(${a.patientID.email})` : ''}
                        </td>
                        <td style={{ padding: '0.5rem', borderBottom: '1px solid #f0f0f0' }}>
                          {formatDate(a.appointmentDate)}
                        </td>
                        <td style={{ padding: '0.5rem', borderBottom: '1px solid #f0f0f0' }}>{a.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorDashboard;
