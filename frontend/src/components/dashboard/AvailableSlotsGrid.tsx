import { ParkingSlot } from '../../domain/models';

interface Props {
    loading: boolean;
    availableSlots: ParkingSlot[];
    bookSlot: (slotId: number) => void;
    needsCharging: boolean;
    setNeedsCharging: (val: boolean) => void;
    duration: number;
    setDuration: (val: number) => void;
    period: 'AM' | 'PM';
    setPeriod: (val: 'AM' | 'PM') => void;
    date: string;
    setDate: (val: string) => void;
}

export default function AvailableSlotsGrid({
    loading,
    availableSlots,
    bookSlot,
    needsCharging,
    setNeedsCharging,
    duration,
    setDuration,
    period,
    setPeriod,
    date,
    setDate
}: Props) {
    return (
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
    );
}
