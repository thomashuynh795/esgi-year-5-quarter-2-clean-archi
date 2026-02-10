import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (email: string) => {
        await login(email);
        navigate('/dashboard');
    };

    return (
        <div style={{ padding: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1>Login - Parking System</h1>
            <p>Select a profile to simulate login:</p>

            <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
                <button
                    onClick={() => handleLogin('john@employee.com')}
                    style={{ padding: '20px', fontSize: '18px', cursor: 'pointer' }}
                >
                    Employee (John)
                </button>

                <button
                    onClick={() => handleLogin('jane@manager.com')}
                    style={{ padding: '20px', fontSize: '18px', cursor: 'pointer' }}
                >
                    Manager (Jane)
                </button>

                <button
                    onClick={() => handleLogin('admin@secretary.com')}
                    style={{ padding: '20px', fontSize: '18px', cursor: 'pointer' }}
                >
                    Secretary (Admin)
                </button>
            </div>
        </div>
    );
}
