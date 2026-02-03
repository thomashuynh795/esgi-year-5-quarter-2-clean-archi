import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface ParkingSlot {
    id: number;
    name: string;
    row: string;
    type: string;
    isReserved: boolean;
}

interface Reservation {
    id: number;
    date: string;
    status: string;
    slot: { name: string };
}

export default function Dashboard() {
    const { user, login, logout } = useAuth();
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [availableSlots, setAvailableSlots] = useState<ParkingSlot[]>([]);
    const [myReservations, setMyReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(false);
    const [needsCharging, setNeedsCharging] = useState(false);

    useEffect(() => {
        if (!user) {
            // Redirect or show login (handled below)
        } else {
            fetchMyReservations();
            fetchAvailableSlots();
        }
    }, [user, date]);

    const fetchAvailableSlots = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:3000/api/slots?date=${date}`);
            setAvailableSlots(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyReservations = async () => {
        if (!user) return;
        try {
            const res = await axios.get(`http://localhost:3000/api/reservations/user/${user.id}`);
            setMyReservations(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const bookSlot = async (slotId: number) => {
        if (!user) return;
        try {
            await axios.post('http://localhost:3000/api/reservations', {
                userId: user.id,
                slotId,
                date: new Date(date).toISOString(),
                needsCharging
            });
            alert('Reservation successful!');
            fetchAvailableSlots();
            fetchMyReservations();
        } catch (e: any) {
            alert('Error: ' + (e.response?.data?.error || e.message));
        }
    };

    const handleCheckIn = async (reservationId: number) => {
        try {
            await axios.post('http://localhost:3000/api/reservations/checkin', {
                reservationId
            });
            alert('Check-in confirmed!');
            fetchMyReservations();
        } catch (e: any) {
            alert('Error: ' + (e.response?.data?.error || e.message));
        }
    };

    const handleCancel = async (reservationId: number) => {
        if (!confirm('Are you sure you want to cancel this reservation?')) return;
        try {
            await axios.post('http://localhost:3000/api/reservations/cancel', {
                reservationId
            });
            alert('Reservation cancelled!');
            fetchAvailableSlots();
            fetchMyReservations();
        } catch (e: any) {
            alert('Error: ' + (e.response?.data?.error || e.message));
        }
    };

    const switchUser = async (email: string) => {
        await login(email);
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="card max-w-md w-full text-center space-y-6">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">ParKing Login</h1>
                    <div className="flex flex-col gap-3">
                        <button className="btn btn-primary w-full" onClick={() => switchUser('john@employee.com')}>Login as Employee (John)</button>
                        <button className="btn btn-secondary w-full" onClick={() => switchUser('jane@manager.com')}>Login as Manager (Jane)</button>
                        <button className="btn btn-secondary w-full" onClick={() => switchUser('admin@secretary.com')}>Login as Secretary (Admin)</button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-border pb-6">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <h1 className="text-2xl font-bold tracking-tight">ParKing</h1>
                    <div className="relative">
                        <select
                            className="select pr-8 cursor-pointer appearance-none"
                            onChange={(e) => switchUser(e.target.value)}
                            value={user.email}
                        >
                            <option value="john@employee.com">John (Employee)</option>
                            <option value="jane@manager.com">Jane (Manager)</option>
                            <option value="admin@secretary.com">Admin (Secretary)</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="badge bg-slate-700 text-slate-300 border border-slate-600">{user.role}</span>
                    <button className="btn btn-secondary text-sm" onClick={logout}>Logout</button>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Content: Calendar & Slots */}
                <div className="flex-grow lg:w-2/3 space-y-6">
                    <div className="card">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                Find a Place
                            </h2>
                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-700/50 transition-colors w-full sm:w-auto justify-center">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-slate-500 text-primary focus:ring-primary bg-slate-700"
                                        checked={needsCharging}
                                        onChange={e => setNeedsCharging(e.target.checked)}
                                    />
                                    <span className={needsCharging ? "text-electric font-medium" : "text-slate-300"}>Need Charging ⚡</span>
                                </label>
                                <input
                                    className="input w-full sm:w-auto"
                                    type="date"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center p-12">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                                {availableSlots.map(slot => (
                                    <div
                                        key={slot.id}
                                        onClick={() => !slot.isReserved && bookSlot(slot.id)}
                                        className={`
                                            group relative aspect-square rounded-lg flex flex-col items-center justify-center border-2 transition-all duration-200
                                            ${slot.isReserved
                                                ? 'bg-slate-800/20 border-slate-800 text-slate-600 grayscale cursor-not-allowed opacity-50'
                                                : slot.type === 'ELECTRIC'
                                                    ? 'bg-slate-800/50 border-electric/30 hover:border-electric hover:shadow-[0_0_15px_-3px_rgba(250,204,21,0.3)] cursor-pointer'
                                                    : 'bg-slate-800 border-slate-700 hover:border-primary hover:bg-slate-700 cursor-pointer'
                                            }
                                        `}
                                        title={`${slot.name} - ${slot.type}${slot.isReserved ? ' (Reserved)' : ''}`}
                                    >
                                        <span className={`font-bold text-lg ${slot.isReserved ? 'text-slate-600' : slot.type === 'ELECTRIC' ? 'text-electric' : 'text-slate-200'}`}>{slot.name}</span>
                                        {slot.type === 'ELECTRIC' && (
                                            <span className={`absolute bottom-1 right-1 text-[10px] ${slot.isReserved ? 'text-slate-600' : 'text-electric'}`}>⚡</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-8 flex flex-wrap gap-6 justify-center text-sm text-slate-400 border-t border-border pt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded border border-slate-600 bg-slate-800"></div>
                                <span>Standard</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded border border-electric/50 bg-slate-800/50 text-electric flex items-center justify-center text-[10px]">⚡</div>
                                <span>Electric (Row A & F)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar: My Reservations */}
                <div className="lg:w-1/3">
                    <div className="card h-full">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                            My Reservations
                        </h2>
                        {myReservations.length === 0 ? (
                            <div className="text-center py-10 text-slate-500 bg-slate-800/30 rounded-lg border border-dashed border-slate-700">
                                <p>No active reservations.</p>
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {myReservations.map(res => {
                                    const isToday = new Date(res.date).toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
                                    const statusColors: any = {
                                        'CONFIRMED': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                                        'OCCUPIED': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                                        'CANCELLED': 'bg-red-500/10 text-red-500 border-red-500/20',
                                    };

                                    return (
                                        <li key={res.id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 flex justify-between items-center hover:border-slate-600 transition-colors">
                                            <div>
                                                <div className="font-bold text-lg text-white">{res.slot?.name}</div>
                                                <div className="text-sm text-slate-400 mt-1 flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                    {new Date(res.date).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`badge border ${statusColors[res.status] || 'bg-slate-700'}`}>
                                                    {res.status}
                                                </span>
                                                {isToday && res.status === 'CONFIRMED' && (
                                                    <button
                                                        onClick={() => handleCheckIn(res.id)}
                                                        className="btn btn-success text-xs py-1 px-3 shadow-lg shadow-emerald-500/20"
                                                    >
                                                        Check-in
                                                    </button>
                                                )}
                                                {res.status !== 'CANCELLED' && (
                                                    <button
                                                        onClick={() => handleCancel(res.id)}
                                                        className="btn btn-danger text-xs py-1 px-3 shadow-lg shadow-red-500/20 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
