

interface Props {
    user: any;
    logout: () => void;
    switchUser: (email: string) => void;
}

export default function DashboardHeader({ user, logout, switchUser }: Props) {
    return (
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
    );
}
