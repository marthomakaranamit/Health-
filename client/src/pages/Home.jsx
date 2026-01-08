import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { user, logout } = useAuth();

  const getDashboardPath = () => {
    if (!user) return null;
    const role = user.role;
    const paths = {
      admin: '/admin/dashboard',
      doctor: '/doctor/dashboard',
      receptionist: '/receptionist/dashboard',
      patient: '/patient/dashboard',
    };
    return paths[role];
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Health Record Management System</h1>
      <p>Welcome to the Hospital Management System</p>

      {user ? (
        <div>
          <p>Welcome, {user.name}!</p>
          <p>Role: {user.role}</p>
          <div style={{ marginTop: '1rem' }}>
            <Link
              to={getDashboardPath()}
              style={{
                marginRight: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
              }}
            >
              Go to Dashboard
            </Link>
            <button
              onClick={logout}
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
      ) : (
        <div style={{ marginTop: '1rem' }}>
          <Link
            to="/login"
            style={{
              marginRight: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
            }}
          >
            Login
          </Link>
          <Link
            to="/register"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#28a745',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
            }}
          >
            Register
          </Link>
        </div>
      )}
    </div>
  );
}

export default Home;
