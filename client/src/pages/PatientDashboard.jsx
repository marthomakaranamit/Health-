import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function PatientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [visits, setVisits] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError('');

      const [profileRes, visitsRes, appointmentsRes] = await Promise.all([
        api.get(`/patients/${user.id}`),
        api.get(`/visits/${user.id}`),
        api.get('/appointments'),
      ]);

      setProfile(profileRes.data || null);
      setVisits(visitsRes.data || []);
      setAppointments(appointmentsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

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
        <h1>Patient Dashboard</h1>
        <div>
          <span style={{ marginRight: '1rem' }}>Welcome, {user?.name}</span>
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
        <p>Loading your data...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.4fr', gap: '1.5rem' }}>
          {/* Left: Profile + Upcoming Appointments */}
          <div>
            <div
              style={{
                padding: '1.25rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                marginBottom: '1.5rem',
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
                <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Profile</h2>
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

              {profile ? (
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>
                    {profile.patientID?.name || user?.name}
                  </div>
                  <div style={{ color: '#555', marginBottom: '0.5rem' }}>
                    {profile.patientID?.email || user?.email}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#444' }}>
                    <div>Age: {profile.age}</div>
                    <div>Gender: {profile.gender}</div>
                    <div>Blood Group: {profile.bloodGroup}</div>
                    <div>Contact: {profile.contactNumber}</div>
                    <div>Address: {profile.address}</div>
                  </div>

                  {(profile.medicalHistory?.length || profile.allergies?.length) && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>
                      {profile.medicalHistory?.length > 0 && (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>Medical History:</strong>
                          <ul style={{ margin: '0.25rem 0 0 1rem', padding: 0 }}>
                            {profile.medicalHistory.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {profile.allergies?.length > 0 && (
                        <div>
                          <strong>Allergies:</strong>
                          <ul style={{ margin: '0.25rem 0 0 1rem', padding: 0 }}>
                            {profile.allergies.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p>No profile record found.</p>
              )}
            </div>

            <div
              style={{
                padding: '1.25rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              }}
            >
              <h2 style={{ margin: 0, marginBottom: '0.75rem', fontSize: '1.1rem' }}>
                Upcoming Appointments
              </h2>
              {appointments.length === 0 ? (
                <p>No appointments scheduled.</p>
              ) : (
                <div style={{ maxHeight: '260px', overflowY: 'auto', fontSize: '0.9rem' }}>
                  {appointments.map((a) => (
                    <div
                      key={a._id}
                      style={{
                        padding: '0.6rem 0.4rem',
                        borderBottom: '1px solid #f0f0f0',
                      }}
                    >
                      <div style={{ fontWeight: 500 }}>
                        Doctor: {a.doctorID?.name || 'Doctor'}{' '}
                        {a.doctorID?.email ? `(${a.doctorID.email})` : ''}
                      </div>
                      <div style={{ color: '#666' }}>{formatDate(a.appointmentDate)}</div>
                      <div style={{ color: '#888', fontSize: '0.85rem' }}>Status: {a.status}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Visit History */}
          <div>
            <div
              style={{
                padding: '1.25rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              }}
            >
              <h2 style={{ margin: 0, marginBottom: '0.75rem', fontSize: '1.1rem' }}>Visit History</h2>

              {visits.length === 0 ? (
                <p>No medical visits recorded yet.</p>
              ) : (
                <div style={{ maxHeight: '480px', overflowY: 'auto', fontSize: '0.9rem' }}>
                  {visits.map((v) => (
                    <div
                      key={v._id}
                      style={{
                        padding: '0.75rem 0.5rem',
                        borderBottom: '1px solid #f0f0f0',
                      }}
                    >
                      <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                        {v.doctorID?.name ? `Dr. ${v.doctorID.name}` : 'Doctor'}{' '}
                        {v.doctorID?.email ? `(${v.doctorID.email})` : ''}
                      </div>
                      <div style={{ color: '#555', marginBottom: '0.25rem' }}>
                        <strong>Diagnosis:</strong> {v.diagnosis}
                      </div>
                      <div style={{ color: '#555', marginBottom: '0.25rem' }}>
                        <strong>Prescription:</strong> {v.prescription}
                      </div>
                      {v.notes && (
                        <div style={{ color: '#555', marginBottom: '0.25rem' }}>
                          <strong>Notes:</strong> {v.notes}
                        </div>
                      )}
                      <div style={{ fontSize: '0.85rem', color: '#888' }}>
                        {formatDate(v.visitDate || v.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientDashboard;
