import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'doctor',
  });
  const [deletingId, setDeletingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateChange = (e) => {
    setCreateForm({
      ...createForm,
      [e.target.name]: e.target.value,
    });
    setCreateError('');
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');

    if (!createForm.name || !createForm.email || !createForm.password) {
      setCreateError('All fields are required');
      return;
    }

    if (createForm.password.length < 6) {
      setCreateError('Password must be at least 6 characters');
      return;
    }

    try {
      setCreating(true);
      const response = await api.post('/users', createForm);
      // Prepend new user to list
      setUsers((prev) => [response.data.user, ...prev]);
      setCreateForm({
        name: '',
        email: '',
        password: '',
        role: 'doctor',
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.errors) && err.response.data.errors[0]?.msg) ||
        'Failed to create user';
      setCreateError(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      setDeletingId(id);
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id && u._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

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
        <h1>Admin Dashboard</h1>
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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 2fr',
          gap: '2rem',
          alignItems: 'flex-start',
        }}
      >
        {/* Create User Form */}
        <div
          style={{
            padding: '1.5rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          }}
        >
          <h2 style={{ marginBottom: '1rem' }}>Create User</h2>

          {createError && (
            <div
              style={{
                padding: '0.75rem',
                marginBottom: '1rem',
                backgroundColor: '#f8d7da',
                color: '#721c24',
                borderRadius: '4px',
              }}
            >
              {createError}
            </div>
          )}

          <form onSubmit={handleCreateSubmit}>
            <div style={{ marginBottom: '0.75rem' }}>
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
                value={createForm.name}
                onChange={handleCreateChange}
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
                htmlFor="email"
                style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={createForm.email}
                onChange={handleCreateChange}
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
                htmlFor="password"
                style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={createForm.password}
                onChange={handleCreateChange}
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
                htmlFor="role"
                style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                value={createForm.role}
                onChange={handleCreateChange}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box',
                }}
              >
                <option value="doctor">Doctor</option>
                <option value="receptionist">Receptionist</option>
                <option value="patient">Patient</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={creating}
              style={{
                width: '100%',
                padding: '0.6rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: creating ? 'not-allowed' : 'pointer',
                fontWeight: 500,
              }}
            >
              {creating ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </div>

        {/* Users Table */}
        <div
          style={{
            padding: '1.5rem',
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
              marginBottom: '1rem',
            }}
          >
            <h2 style={{ margin: 0 }}>All Users</h2>
            <button
              onClick={fetchUsers}
              style={{
                padding: '0.4rem 0.8rem',
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
            <p>Loading users...</p>
          ) : users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
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
                      Name
                    </th>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '0.5rem',
                        borderBottom: '1px solid #ddd',
                      }}
                    >
                      Email
                    </th>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '0.5rem',
                        borderBottom: '1px solid #ddd',
                      }}
                    >
                      Role
                    </th>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '0.5rem',
                        borderBottom: '1px solid #ddd',
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const id = u.id || u._id;
                    return (
                      <tr key={id}>
                        <td
                          style={{
                            padding: '0.5rem',
                            borderBottom: '1px solid #f0f0f0',
                          }}
                        >
                          {u.name}
                        </td>
                        <td
                          style={{
                            padding: '0.5rem',
                            borderBottom: '1px solid #f0f0f0',
                          }}
                        >
                          {u.email}
                        </td>
                        <td
                          style={{
                            padding: '0.5rem',
                            borderBottom: '1px solid #f0f0f0',
                            textTransform: 'capitalize',
                          }}
                        >
                          {u.role}
                        </td>
                        <td
                          style={{
                            padding: '0.5rem',
                            borderBottom: '1px solid #f0f0f0',
                          }}
                        >
                          <button
                            onClick={() => handleDeleteUser(id)}
                            disabled={deletingId === id}
                            style={{
                              padding: '0.3rem 0.6rem',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: deletingId === id ? 'not-allowed' : 'pointer',
                              fontSize: '0.8rem',
                            }}
                          >
                            {deletingId === id ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
