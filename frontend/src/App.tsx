import { useState } from 'react'
import axios from 'axios'

function App() {
    const [message, setMessage] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)

    const handleSayHello = async () => {
        setLoading(true)
        try {
            const response = await axios.post('http://localhost:3000/api/messages', {
                content: 'Hello World'
            })
            setMessage(response.data.content)
        } catch (error) {
            console.error('Error fetching message:', error)
            setMessage('Error connecting to backend')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            fontFamily: 'Arial, sans-serif'
        }}>
            <h1>Parking Reservation System</h1>
            <div style={{ marginTop: '20px' }}>
                <button
                    onClick={handleSayHello}
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px'
                    }}
                >
                    {loading ? 'Sending...' : 'Say Hello'}
                </button>
            </div>
            {message && (
                <div style={{ marginTop: '20px', fontSize: '20px', color: '#333' }}>
                    Response from Backend: <strong>{message}</strong>
                </div>
            )}
        </div>
    )
}

export default App
