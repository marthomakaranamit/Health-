import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function ReceptionistDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [patientForm, setPatientForm] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'O+',
    contactNumber: '',
    address: '',
  });
  const [patientError, setPatientError] = useState('');
  const [creatingPatient, setCreatingPatient] = useState(false);

  const [appointmentForm, setAppointmentForm] = useState({
    patientID: '',
    doctorID: '',
    appointmentDate: '',
  });
  const [appointmentError, setAppointmentError] = useState('');
  const [creatingAppointment, setCreatingAppointment] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
        api.get('/patients'),
        api.get('/users/doctors'),
        api.get('/appointments'),
      ]);
      setPatients(patientsRes.data || []);
      setDoctors(doctorsRes.data || []);
      setAppointments(appointmentsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePatientChange = (e) => {
    setPatientForm({
      ...patientForm,
      [e.target.name]: e.target.value,
    });
    setPatientError('');
  };

  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    setPatientError('');

    if (!patientForm.name || !patientForm.email || !patientForm.password) {
      setPatientError('Name, email, and password are required');
      return;
    }

    if (patientForm.password.length < 6) {
      setPatientError('Password must be at least 6 characters');
      return;
    }

    if (!patientForm.age) {
      setPatientError('Age is required');
      return;
    }

    try {
      setCreatingPatient(true);
      const payload = {
        ...patientForm,
        age: Number(patientForm.age),
      };

      const res = await api.post('/patients', payload);
      // Prepend new patient record
      setPatients((prev) => [res.data.patientRecord, ...prev]);
      setPatientForm({
        name: '',
        email: '',
        password: '',
        age: '',
        gender: 'Male',
        bloodGroup: 'O+',
        contactNumber: '',
        address: '',
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.errors) && err.response.data.errors[0]?.msg) ||
        'Failed to register patient';
      setPatientError(msg);
    } finally {
      setCreatingPatient(false);
    }
  };

  const handleAppointmentChange = (e) => {
    setAppointmentForm({
      ...appointmentForm,
      [e.target.name]: e.target.value,
    });
    setAppointmentError('');
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    setAppointmentError('');

    if (!appointmentForm.patientID || !appointmentForm.doctorID || !appointmentForm.appointmentDate) {
      setAppointmentError('Patient, doctor, and date/time are required');
      return;
    }

    try {
      setCreatingAppointment(true);
      const res = await api.post('/appointments', {
        patientID: appointmentForm.patientID,
        doctorID: appointmentForm.doctorID,
        appointmentDate: appointmentForm.appointmentDate,
      });
      setAppointments((prev) => [res.data.appointment, ...prev]);
      setAppointmentForm({
        patientID: '',
        doctorID: '',
        appointmentDate: '',
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.errors) && err.response.data.errors[0]?.msg) ||
        'Failed to create appointment';
      setAppointmentError(msg);
    } finally {
      setCreatingAppointment(false);
    }
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
        <h1>Receptionist Dashboard</h1>
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
        <p>Loading data...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.4fr', gap: '1.5rem' }}>
          {/* Left: Patient Registration + Patients List */}
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
              <h2 style={{ margin: 0, marginBottom: '0.75rem' }}>Register Patient</h2>

              {patientError && (
                <div
                  style={{
                    padding: '0.75rem',
                    marginBottom: '0.75rem',
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    borderRadius: '4px',
                  }}
                >
                  {patientError}
                </div>
              )}

              <form onSubmit={handlePatientSubmit}>
                <div style={{ marginBottom: '0.6rem' }}>
                  <label
                    htmlFor="name"
                    style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={patientForm.name}
                    onChange={handlePatientChange}
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

                <div style={{ marginBottom: '0.6rem' }}>
                  <label
                    htmlFor="email"
                    style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={patientForm.email}
                    onChange={handlePatientChange}
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

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <div style={{ flex: 1 }}>
                    <label
                      htmlFor="password"
                      style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={patientForm.password}
                      onChange={handlePatientChange}
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
                  <div style={{ width: '90px' }}>
                    <label
                      htmlFor="age"
                      style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
                    >
                      Age
                    </label>
                    <input
                      id="age"
                      name="age"
                      type="number"
                      min="0"
                      max="150"
                      value={patientForm.age}
                      onChange={handlePatientChange}
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
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <div style={{ flex: 1 }}>
                    <label
                      htmlFor="gender"
                      style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
                    >
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={patientForm.gender}
                      onChange={handlePatientChange}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label
                      htmlFor="bloodGroup"
                      style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
                    >
                      Blood Group
                    </label>
                    <select
                      id="bloodGroup"
                      name="bloodGroup"
                      value={patientForm.bloodGroup}
                      onChange={handlePatientChange}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '0.6rem' }}>
                  <label
                    htmlFor="contactNumber"
                    style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
                  >
                    Contact Number
                  </label>
                  <input
                    id="contactNumber"
                    name="contactNumber"
                    type="text"
                    value={patientForm.contactNumber}
                    onChange={handlePatientChange}
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

                <div style={{ marginBottom: '0.8rem' }}>
                  <label
                    htmlFor="address"
                    style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
                  >
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows={2}
                    value={patientForm.address}
                    onChange={handlePatientChange}
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

                <button
                  type="submit"
                  disabled={creatingPatient}
                  style={{
                    width: '100%',
                    padding: '0.7rem',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: creatingPatient ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {creatingPatient ? 'Registering...' : 'Register Patient'}
                </button>
              </form>
            </div>

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
                <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Recent Patients</h2>
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
              {patients.length === 0 ? (
                <p>No patients found.</p>
              ) : (
                <div style={{ maxHeight: '260px', overflowY: 'auto', fontSize: '0.9rem' }}>
                  {patients.map((p) => (
                    <div
                      key={p._id}
                      style={{
                        padding: '0.6rem 0.4rem',
                        borderBottom: '1px solid #f0f0f0',
                      }}
                    >
                      <div style={{ fontWeight: 500 }}>
                        {p.patientID?.name || 'Patient'}{' '}
                        {p.patientID?.email ? `(${p.patientID.email})` : ''}
                      </div>
                      <div style={{ color: '#666' }}>
                        Age: {p.age} | Gender: {p.gender} | Blood: {p.bloodGroup}
                      </div>
                      <div style={{ color: '#888', fontSize: '0.8rem' }}>{p.contactNumber}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Appointment Form + Appointments List */}
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
              <h2 style={{ margin: 0, marginBottom: '0.75rem' }}>Create Appointment</h2>

              {appointmentError && (
                <div
                  style={{
                    padding: '0.75rem',
                    marginBottom: '0.75rem',
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    borderRadius: '4px',
                  }}
                >
                  {appointmentError}
                </div>
              )}

              <form onSubmit={handleAppointmentSubmit}>
                <div style={{ marginBottom: '0.6rem' }}>
                  <label
                    htmlFor="patientID"
                    style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
                  >
                    Patient
                  </label>
                  <select
                    id="patientID"
                    name="patientID"
                    value={appointmentForm.patientID}
                    onChange={handleAppointmentChange}
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
                      const id = p.patientID?._id || p.patientID || p._id;
                      const name = p.patientID?.name || 'Patient';
                      const email = p.patientID?.email || '';
                      return (
                        <option key={id} value={id}>
                          {name} {email ? `(${email})` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div style={{ marginBottom: '0.6rem' }}>
                  <label
                    htmlFor="doctorID"
                    style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
                  >
                    Doctor
                  </label>
                  <select
                    id="doctorID"
                    name="doctorID"
                    value={appointmentForm.doctorID}
                    onChange={handleAppointmentChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="">Select doctor</option>
                    {doctors.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} ({d.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '0.8rem' }}>
                  <label
                    htmlFor="appointmentDate"
                    style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
                  >
                    Date &amp; Time
                  </label>
                  <input
                    id="appointmentDate"
                    name="appointmentDate"
                    type="datetime-local"
                    value={appointmentForm.appointmentDate}
                    onChange={handleAppointmentChange}
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

                <button
                  type="submit"
                  disabled={creatingAppointment}
                  style={{
                    width: '100%',
                    padding: '0.7rem',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: creatingAppointment ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {creatingAppointment ? 'Creating...' : 'Create Appointment'}
                </button>
              </form>
            </div>

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
                <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Appointments</h2>
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
                <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '0.9rem',
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{
                            textAlign: 'left',
                            padding: '0.5rem',
                            borderBottom: '1px solid #ddd',
                          }}
                        >
                          Patient
                        </th>
                        <th
                          style={{
                            textAlign: 'left',
                            padding: '0.5rem',
                            borderBottom: '1px solid #ddd',
                          }}
                        >
                          Doctor
                        </th>
                        <th
                          style={{
                            textAlign: 'left',
                            padding: '0.5rem',
                            borderBottom: '1px solid #ddd',
                          }}
                        >
                          Date
                        </th>
                        <th
                          style={{
                            textAlign: 'left',
                            padding: '0.5rem',
                            borderBottom: '1px solid #ddd',
                          }}
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((a) => (
                        <tr key={a._id}>
                          <td
                            style={{
                              padding: '0.5rem',
                              borderBottom: '1px solid #f0f0f0',
                            }}
                          >
                            {a.patientID?.name || 'Patient'}{' '}
                            {a.patientID?.email ? `(${a.patientID.email})` : ''}
                          </td>
                          <td
                            style={{
                              padding: '0.5rem',
                              borderBottom: '1px solid #f0f0f0',
                            }}
                          >
                            {a.doctorID?.name || 'Doctor'}{' '}
                            {a.doctorID?.email ? `(${a.doctorID.email})` : ''}
                          </td>
                          <td
                            style={{
                              padding: '0.5rem',
                              borderBottom: '1px solid #f0f0f0',
                            }}
                          >
                            {formatDate(a.appointmentDate)}
                          </td>
                          <td
                            style={{
                              padding: '0.5rem',
                              borderBottom: '1px solid #f0f0f0',
                            }}
                          >
                            {a.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReceptionistDashboard;
