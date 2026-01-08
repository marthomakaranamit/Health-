import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
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
      <p>Doctor dashboard content will be implemented in Phase 6.</p>
    </div>
  );
}

export default DoctorDashboard;
