import { useDashboardController } from '../controllers/useDashboardController';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import AvailableSlotsGrid from '../components/dashboard/AvailableSlotsGrid';
import MyReservationsList from '../components/dashboard/MyReservationsList';

export default function Dashboard() {
    const {
        user,
        logout,
        switchUser,
        date,
        setDate,
        availableSlots,
        loading,
        needsCharging,
        setNeedsCharging,
        duration,
        setDuration,
        period,
        setPeriod,
        bookSlot,
        handleCheckIn,
        handleCancel,
        groupedReservations,
        myReservations
    } = useDashboardController();

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
            <DashboardHeader
                user={user}
                logout={logout}
                switchUser={switchUser}
            />

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Content: Calendar & Slots */}
                <div className="flex-grow lg:w-2/3 space-y-6">
                    <AvailableSlotsGrid
                        loading={loading}
                        availableSlots={availableSlots}
                        bookSlot={bookSlot}
                        needsCharging={needsCharging}
                        setNeedsCharging={setNeedsCharging}
                        duration={duration}
                        setDuration={setDuration}
                        period={period}
                        setPeriod={setPeriod}
                        date={date}
                        setDate={setDate}
                    />
                </div>

                {/* Sidebar: My Reservations */}
                <div className="lg:w-1/3">
                    <MyReservationsList
                        groupedReservations={groupedReservations}
                        myReservations={myReservations}
                        handleCheckIn={handleCheckIn}
                        handleCancel={handleCancel}
                    />
                </div>
            </div>
        </div>
    );
}
