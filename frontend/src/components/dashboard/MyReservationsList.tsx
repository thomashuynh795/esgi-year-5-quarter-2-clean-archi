import { GroupedReservation, Reservation } from '../../domain/models';

interface Props {
    groupedReservations: GroupedReservation[];
    myReservations: Reservation[];
    handleCheckIn: (ids: number[]) => void;
    handleCancel: (ids: number[]) => void;
}

export default function MyReservationsList({
    groupedReservations,
    myReservations,
    handleCheckIn,
    handleCancel
}: Props) {
    return (
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
    );
}
