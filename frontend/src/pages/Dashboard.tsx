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
    period: 'AM' | 'PM';
    slot: { id: number; name: string };
}

interface GroupedReservation {
    id: string; // Composite ID for key
    ids: number[]; // All reservation IDs
    slotName: string;
    slotId: number;
    period: 'AM' | 'PM';
    startDate: string;
    endDate: string;
    status: string;
}

const groupReservations = (reservations: Reservation[]): GroupedReservation[] => {
    if (reservations.length === 0) return [];

    // Sort by date/slot/period
    const sorted = [...reservations].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const groups: GroupedReservation[] = [];
    let currentGroup: GroupedReservation | null = null;

    for (const res of sorted) {
        if (!currentGroup) {
            currentGroup = {
                id: `${res.id}`,
                ids: [res.id],
                slotName: res.slot?.name || 'Unknown',
                slotId: res.slot?.id || 0,
                period: res.period,
                startDate: res.date,
                endDate: res.date,
                status: res.status
            };
        } else {
            // Check if contiguous: same slot, same period, next working day?
            // "Next working day" calculation might be complex (skipping weekends).
            // Simplification: Check if date diff is <= 3 days (to allow Fri-Mon skip) AND same slot AND same period.
            const lastDate = new Date(currentGroup.endDate);
            const currentDate = new Date(res.date);
            const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Allow gap of max 2 days (Fri->Mon is 3 days diff: Fri=5, Sat=6, Sun=0, Mon=1. 3 days.)
            // Fri(T) -> Mon(T+3days).
            // Actually diffDays between dates:
            // Fri 1st. Mon 4th. 4-1 = 3.

            const isSameSlot = res.slot?.id === currentGroup.slotId;
            const isSamePeriod = res.period === currentGroup.period;
            const isContiguous = diffDays === 1 || (diffDays <= 3 && lastDate.getDay() === 5 && currentDate.getDay() === 1); // Normal next day OR Fri->Mon

            if (isSameSlot && isSamePeriod && isContiguous) {
                currentGroup.ids.push(res.id);
                currentGroup.endDate = res.date;
                // If any reservation in group is CANCELLED, group status?
                // Visual preference: show as mixed? Or separate groups for Status change?
                // Let's separate groups if Status changes.
                if (res.status !== currentGroup.status) {
                    groups.push(currentGroup);
                    currentGroup = {
                        id: `${res.id}`,
                        ids: [res.id],
                        slotName: res.slot?.name || 'Unknown',
                        slotId: res.slot?.id || 0,
                        period: res.period,
                        startDate: res.date,
                        endDate: res.date,
                        status: res.status
                    };
                }
            } else {
                groups.push(currentGroup);
                currentGroup = {
                    id: `${res.id}`,
                    ids: [res.id],
                    slotName: res.slot?.name || 'Unknown',
                    slotId: res.slot?.id || 0,
                    period: res.period,
                    startDate: res.date,
                    endDate: res.date,
                    status: res.status
                };
            }
        }
    }
    if (currentGroup) groups.push(currentGroup);
    return groups;
};

export default function Dashboard() {
    const { user, login, logout } = useAuth();
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [availableSlots, setAvailableSlots] = useState<ParkingSlot[]>([]);
    const [myReservations, setMyReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(false);
    const [needsCharging, setNeedsCharging] = useState(false);
    const [duration, setDuration] = useState(1);
    const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

    useEffect(() => {
        if (!user) {
            // Redirect or show login (handled below)
        } else {
            fetchMyReservations();
            fetchAvailableSlots();
        }
    }, [user, date, period, duration]);

    const fetchAvailableSlots = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:3000/api/slots?date=${date}&period=${period}&duration=${duration}`);
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
                needsCharging,
                duration,
                period
            });
            alert('Reservation successful!');
            fetchAvailableSlots();
            fetchMyReservations();
        } catch (e: any) {
            alert('Error: ' + (e.response?.data?.error || e.message));
        }
    };

    const handleCheckIn = async (reservationIds: number[]) => {
        // Find the reservation ID that corresponds to TODAY
        const today = new Date().toISOString().split('T')[0];
        // We need to look up in myReservations to find the ID for today
        const todaysReservation = myReservations.find(r => reservationIds.includes(r.id) && new Date(r.date).toISOString().split('T')[0] === today);

        if (!todaysReservation) {
            alert('No reservation for today to check-in.');
            return;
        }

        try {
            await axios.post('http://localhost:3000/api/reservations/checkin', {
                reservationId: todaysReservation.id
            });
            alert('Check-in confirmed!');
            fetchMyReservations();
        } catch (e: any) {
            alert('Error: ' + (e.response?.data?.error || e.message));
        }
    };

    const handleCancel = async (reservationIds: number[]) => {
        if (!confirm(`Are you sure you want to cancel ${reservationIds.length} day(s)?`)) return;
        try {
            for (const id of reservationIds) {
                await axios.post('http://localhost:3000/api/reservations/cancel', {
                    reservationId: id
                });
            }

            alert('Reservation(s) cancelled!');
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

    const groupedReservations = groupReservations(myReservations);

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
                                <select
                                    className="select w-full sm:w-auto bg-slate-700 border-slate-600 text-slate-200"
                                    value={duration}
                                    onChange={e => setDuration(Number(e.target.value))}
                                >
                                    {[1, 2, 3, 4, 5].map(d => (
                                        <option key={d} value={d}>{d} Day{d > 1 ? 's' : ''}</option>
                                    ))}
                                </select>
                                <select
                                    className="select w-full sm:w-auto bg-slate-700 border-slate-600 text-slate-200"
                                    value={period}
                                    onChange={e => setPeriod(e.target.value as 'AM' | 'PM')}
                                >
                                    <option value="AM">Morning (AM)</option>
                                    <option value="PM">Afternoon (PM)</option>
                                </select>
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
                        {groupedReservations.length === 0 ? (
                            <div className="text-center py-10 text-slate-500 bg-slate-800/30 rounded-lg border border-dashed border-slate-700">
                                <p>No active reservations.</p>
                            </div>
                        ) : (
                            <ul className="space-y-3 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                                {groupedReservations.map(group => {
                                    const today = new Date().toISOString().split('T')[0];
                                    const hasToday = myReservations.some(r => group.ids.includes(r.id) && new Date(r.date).toISOString().split('T')[0] === today && r.status === 'CONFIRMED');

                                    const statusColors: any = {
                                        'CONFIRMED': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                                        'OCCUPIED': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                                        'CANCELLED': 'bg-red-500/10 text-red-500 border-red-500/20',
                                    };

                                    return (
                                        <li key={group.id} className="bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-all flex flex-col p-0 overflow-hidden">
                                            <div className="p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <div className="font-bold text-lg text-white flex gap-2 items-center">
                                                            {group.slotName}
                                                            <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300 font-normal">{group.period}</span>
                                                        </div>
                                                    </div>
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${statusColors[group.status] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                                                        {group.status}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-slate-400 bg-slate-900/20 p-2 rounded border border-slate-800/50">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase tracking-wide opacity-50">From</span>
                                                        <span className="font-medium text-slate-200">{new Date(group.startDate).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="h-6 w-px bg-slate-700/50"></div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase tracking-wide opacity-50">To</span>
                                                        <span className="font-medium text-slate-200">{new Date(group.endDate).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Footer Actions */}
                                            {(hasToday || group.status !== 'CANCELLED') && (
                                                <div className="bg-slate-900/30 p-2 flex gap-2 border-t border-slate-700/50">
                                                    {hasToday && (
                                                        <button
                                                            onClick={() => handleCheckIn(group.ids)}
                                                            className="flex-1 btn btn-success text-xs py-2 shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                                            I'm Here
                                                        </button>
                                                    )}
                                                    {group.status !== 'CANCELLED' && group.status !== 'OCCUPIED' && (
                                                        <button
                                                            onClick={() => handleCancel(group.ids)}
                                                            className="flex-1 btn btn-danger text-xs py-2 shadow-lg shadow-red-500/10 bg-red-500/5 text-red-500 border border-red-500/20 hover:bg-red-500/10 flex items-center justify-center gap-2"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                            Cancel
                                                        </button>
                                                    )}
                                                </div>
                                            )}
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
