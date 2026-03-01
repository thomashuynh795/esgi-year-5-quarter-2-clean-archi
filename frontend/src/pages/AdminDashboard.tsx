import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { buildMockParkingSpots } from "../domain/mock";
import type { AuthUser, ParkingSpot, ReservationSlot, ReservationViewModel, UserRole } from "../domain/models";
import { PARKING_ROWS, createSpotId, formatDateInput } from "../domain/parkingRules";
import { AdminService } from "../services/AdminService";
import { ParkingService } from "../services/ParkingService";
import { ApiError } from "../services/api";

type ReservationEditor = {
  reservationId: string;
  spotId: string;
  date: string;
  slot: ReservationSlot;
  needsCharging: boolean;
};

type CreateUserDraft = {
  email: string;
  firstName: string;
  lastName: string;
  vehicleType: AuthUser["vehicleType"];
};

type AdminReservation = ReservationViewModel & {
  userId: string;
  userName: string;
  userEmail: string;
};

type OccupancyCell = {
  spotId: string;
  row: string;
  number: number;
  hasCharger: boolean;
  am?: { userName: string; userEmail: string; status: string };
  pm?: { userName: string; userEmail: string; status: string };
};

const emptyCreateUserDraft: CreateUserDraft = {
  email: "",
  firstName: "",
  lastName: "",
  vehicleType: "THERMAL",
};

function toggleRole(roles: UserRole[], role: UserRole): UserRole[] {
  if (roles.includes(role)) {
    const nextRoles = roles.filter((item) => item !== role);
    return nextRoles.length ? nextRoles : roles;
  }
  return [...roles, role];
}

function addDays(date: string, delta: number): string {
  const next = new Date(`${date}T00:00:00`);
  next.setDate(next.getDate() + delta);
  return formatDateInput(next);
}

function formatUserLabel(user: AuthUser): string {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return fullName || user.email;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [userForm, setUserForm] = useState<AuthUser | null>(null);
  const [createUserDraft, setCreateUserDraft] = useState<CreateUserDraft>(emptyCreateUserDraft);
  const [reservations, setReservations] = useState<ReservationViewModel[]>([]);
  const [allReservations, setAllReservations] = useState<AdminReservation[]>([]);
  const [historyDate, setHistoryDate] = useState(formatDateInput(new Date()));
  const [editReservation, setEditReservation] = useState<ReservationEditor | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedUser = useMemo(
    () => users.find((item) => item.id === selectedUserId) ?? null,
    [selectedUserId, users],
  );

  const occupancyCells = useMemo<OccupancyCell[]>(() => {
    return spots
      .map((spot) => {
        const spotReservations = allReservations.filter(
          (reservation) => reservation.date === historyDate && reservation.spotId === spot.id,
        );

        const amReservation = spotReservations.find((reservation) => reservation.slot === "AM");
        const pmReservation = spotReservations.find((reservation) => reservation.slot === "PM");

        return {
          spotId: spot.id,
          row: spot.row,
          number: spot.number,
          hasCharger: spot.hasCharger,
          am: amReservation
            ? {
                userName: amReservation.userName,
                userEmail: amReservation.userEmail,
                status: amReservation.status,
              }
            : undefined,
          pm: pmReservation
            ? {
                userName: pmReservation.userName,
                userEmail: pmReservation.userEmail,
                status: pmReservation.status,
              }
            : undefined,
        };
      })
      .sort((left, right) => left.row.localeCompare(right.row) || left.number - right.number);
  }, [allReservations, historyDate, spots]);

  async function loadUserReservations(userId: string) {
    try {
      const reservationResults = await ParkingService.getReservationsForUser(userId);
      setReservations(reservationResults);
      setEditReservation(null);
    } catch (error) {
      setReservations([]);
      setFeedback(error instanceof ApiError ? error.message : "Impossible de charger les reservations utilisateur.");
    }
  }

  async function loadAdminData(options?: { keepFeedback?: boolean }) {
    setLoading(true);
    if (!options?.keepFeedback) {
      setFeedback(null);
    }

    try {
      const [userResults, spotResults] = await Promise.all([
        AdminService.getUsers(),
        ParkingService.getAllSpots().catch(() => buildMockParkingSpots()),
      ]);

      const reservationBuckets = await Promise.all(
        userResults.map(async (item) => {
          try {
            const reservationResults = await ParkingService.getReservationsForUser(item.id);
            return reservationResults.map((reservation) => ({
              ...reservation,
              userId: item.id,
              userName: formatUserLabel(item),
              userEmail: item.email,
            }));
          } catch {
            return [];
          }
        }),
      );

      setUsers(userResults);
      setSpots(spotResults);
      setAllReservations(reservationBuckets.flat());

      if (!selectedUserId && userResults.length > 0) {
        setSelectedUserId(userResults[0].id);
        setUserForm(userResults[0]);
      }
    } catch (error) {
      setFeedback(error instanceof ApiError ? error.message : "Chargement admin impossible.");
      setSpots(buildMockParkingSpots());
      setAllReservations([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAdminData();
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      return;
    }

    const currentUser = users.find((item) => item.id === selectedUserId) ?? null;
    setUserForm(currentUser);
    void loadUserReservations(selectedUserId);
  }, [selectedUserId, users]);

  if (!user) {
    return null;
  }

  async function handleCreateUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await AdminService.createUser(createUserDraft);
      setFeedback("Utilisateur cree.");
      setCreateUserDraft(emptyCreateUserDraft);
      await loadAdminData({ keepFeedback: true });
    } catch (error) {
      setFeedback(error instanceof ApiError ? error.message : "Creation utilisateur impossible.");
    }
  }

  async function handleUserSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userForm) {
      return;
    }

    try {
      await AdminService.updateUser({
        userId: userForm.id,
        firstName: userForm.firstName,
        lastName: userForm.lastName,
        roles: userForm.roles,
        vehicleType: userForm.vehicleType,
        isActive: Boolean(userForm.isActive),
      });
      setFeedback("Utilisateur mis a jour.");
      await loadAdminData({ keepFeedback: true });
    } catch (error) {
      setFeedback(error instanceof ApiError ? error.message : "Mise a jour utilisateur impossible.");
    }
  }

  async function handleReservationSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editReservation) {
      return;
    }

    try {
      await ParkingService.updateReservation(editReservation);
      setFeedback("Reservation mise a jour.");
      await loadAdminData({ keepFeedback: true });
      await loadUserReservations(selectedUserId);
      setEditReservation(null);
    } catch (error) {
      setFeedback(error instanceof ApiError ? error.message : "Modification de reservation impossible.");
    }
  }

  async function handleReservationCancel(reservationId: string) {
    try {
      await ParkingService.cancelReservation(reservationId);
      setFeedback("Reservation annulee.");
      await loadAdminData({ keepFeedback: true });
      await loadUserReservations(selectedUserId);
      if (editReservation?.reservationId === reservationId) {
        setEditReservation(null);
      }
    } catch (error) {
      setFeedback(error instanceof ApiError ? error.message : "Annulation impossible.");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <section className="rounded-[2rem] bg-stone-900 px-6 py-8 text-white shadow-lg">
        <div className="text-sm uppercase tracking-[0.35em] text-amber-200">Secretary admin</div>
        <h1 className="mt-4 font-serif text-4xl font-semibold">Administration complete du parking</h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-stone-300">
          Gestion des utilisateurs, edition des reservations et lecture jour par jour de l'occupation du parking.
        </p>
      </section>

      {feedback && (
        <div className="mt-6 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 shadow-sm">
          {feedback}
        </div>
      )}

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={handleCreateUser} className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <div className="text-sm uppercase tracking-[0.35em] text-stone-500">Creation utilisateur</div>
            <h2 className="mt-2 text-2xl font-semibold text-stone-900">Nouveau compte employe</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-stone-700">Email</span>
              <input
                type="email"
                required
                value={createUserDraft.email}
                onChange={(event) =>
                  setCreateUserDraft((current) => ({ ...current, email: event.target.value }))
                }
                className="w-full rounded-2xl border border-stone-200 px-4 py-3"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-stone-700">Prenom</span>
              <input
                required
                value={createUserDraft.firstName}
                onChange={(event) =>
                  setCreateUserDraft((current) => ({ ...current, firstName: event.target.value }))
                }
                className="w-full rounded-2xl border border-stone-200 px-4 py-3"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-stone-700">Nom</span>
              <input
                required
                value={createUserDraft.lastName}
                onChange={(event) =>
                  setCreateUserDraft((current) => ({ ...current, lastName: event.target.value }))
                }
                className="w-full rounded-2xl border border-stone-200 px-4 py-3"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-stone-700">Type de vehicule</span>
              <select
                value={createUserDraft.vehicleType}
                onChange={(event) =>
                  setCreateUserDraft((current) => ({
                    ...current,
                    vehicleType: event.target.value as AuthUser["vehicleType"],
                  }))
                }
                className="w-full rounded-2xl border border-stone-200 px-4 py-3"
              >
                <option value="THERMAL">Thermique</option>
                <option value="HYBRID">Hybride</option>
                <option value="ELECTRIC">Electrique</option>
              </select>
            </label>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Creer l'utilisateur
              </button>
            </div>
          </div>
        </form>

        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-stone-900">Utilisateurs</h2>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
              {users.length} comptes
            </span>
          </div>

          {loading ? (
            <div className="py-10 text-center text-stone-500">Chargement...</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {users.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedUserId(item.id)}
                  className={`rounded-3xl border p-4 text-left transition ${
                    selectedUserId === item.id
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-200 bg-stone-50 text-stone-800 hover:bg-stone-100"
                  }`}
                >
                  <div className="font-semibold">{formatUserLabel(item)}</div>
                  <div className="mt-1 text-sm opacity-80">{item.email}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.2em] opacity-70">
                    {item.roles.join(" / ")}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <form onSubmit={handleUserSave} className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <div className="text-sm uppercase tracking-[0.35em] text-stone-500">Gestion utilisateur</div>
            <h2 className="mt-2 text-2xl font-semibold text-stone-900">
              {selectedUser ? selectedUser.email : "Selectionnez un utilisateur"}
            </h2>
          </div>

          {userForm ? (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-700">Prenom</span>
                <input
                  value={userForm.firstName ?? ""}
                  onChange={(event) =>
                    setUserForm((current) => (current ? { ...current, firstName: event.target.value } : current))
                  }
                  className="w-full rounded-2xl border border-stone-200 px-4 py-3"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-700">Nom</span>
                <input
                  value={userForm.lastName ?? ""}
                  onChange={(event) =>
                    setUserForm((current) => (current ? { ...current, lastName: event.target.value } : current))
                  }
                  className="w-full rounded-2xl border border-stone-200 px-4 py-3"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-700">Type de vehicule</span>
                <select
                  value={userForm.vehicleType}
                  onChange={(event) =>
                    setUserForm((current) =>
                      current ? { ...current, vehicleType: event.target.value as AuthUser["vehicleType"] } : current,
                    )
                  }
                  className="w-full rounded-2xl border border-stone-200 px-4 py-3"
                >
                  <option value="THERMAL">Thermique</option>
                  <option value="HYBRID">Hybride</option>
                  <option value="ELECTRIC">Electrique</option>
                  <option value="NONE">Aucun</option>
                </select>
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                <input
                  type="checkbox"
                  checked={Boolean(userForm.isActive)}
                  onChange={(event) =>
                    setUserForm((current) => (current ? { ...current, isActive: event.target.checked } : current))
                  }
                />
                <span className="text-sm font-medium text-stone-700">Compte actif</span>
              </label>

              <div className="md:col-span-2">
                <div className="mb-2 text-sm font-medium text-stone-700">Roles</div>
                <div className="flex flex-wrap gap-3">
                  {(["EMPLOYEE", "MANAGER", "SECRETARY"] as const).map((role) => (
                    <label key={role} className="flex items-center gap-2 rounded-full border border-stone-200 px-4 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={userForm.roles.includes(role)}
                        onChange={() =>
                          setUserForm((current) =>
                            current ? { ...current, roles: toggleRole(current.roles, role) } : current,
                          )
                        }
                      />
                      {role}
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
                >
                  Enregistrer l'utilisateur
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-stone-50 p-6 text-sm text-stone-600">
              Selectionnez un utilisateur pour modifier son profil.
            </div>
          )}
        </form>

        <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <div className="text-sm uppercase tracking-[0.35em] text-stone-500">Reservations utilisateur</div>
            <h2 className="mt-2 text-2xl font-semibold text-stone-900">Edition ponctuelle</h2>
          </div>

          {selectedUserId ? (
            <div className="space-y-3">
              {reservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex w-full items-center justify-between rounded-3xl border border-stone-200 bg-stone-50 p-4"
                >
                  <div>
                    <div className="font-semibold text-stone-900">{reservation.spotLabel}</div>
                    <div className="text-sm text-stone-600">
                      {reservation.date} · {reservation.slot} · {reservation.status}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEditReservation({
                          reservationId: reservation.id,
                          spotId: reservation.spotId,
                          date: reservation.date,
                          slot: reservation.slot,
                          needsCharging: false,
                        })
                      }
                      className="rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-stone-700 transition hover:bg-stone-100"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleReservationCancel(reservation.id)}
                      disabled={reservation.status === "CANCELLED"}
                      className="rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-200"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ))}

              {reservations.length === 0 && (
                <div className="rounded-3xl bg-stone-50 p-6 text-sm text-stone-600">
                  Aucune reservation pour cet utilisateur.
                </div>
              )}
            </div>
          ) : null}

          {editReservation && (
            <form onSubmit={handleReservationSave} className="mt-5 grid gap-4 rounded-3xl border border-stone-200 bg-stone-50 p-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-700">Place</span>
                <select
                  value={editReservation.spotId}
                  onChange={(event) =>
                    setEditReservation((current) =>
                      current ? { ...current, spotId: event.target.value } : current,
                    )
                  }
                  className="w-full rounded-2xl border border-stone-200 px-4 py-3"
                >
                  {spots.map((spot) => (
                    <option key={spot.id} value={spot.id}>
                      {spot.id}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-700">Date</span>
                <input
                  type="date"
                  value={editReservation.date}
                  onChange={(event) =>
                    setEditReservation((current) =>
                      current ? { ...current, date: event.target.value } : current,
                    )
                  }
                  className="w-full rounded-2xl border border-stone-200 px-4 py-3"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-700">Slot</span>
                <select
                  value={editReservation.slot}
                  onChange={(event) =>
                    setEditReservation((current) =>
                      current ? { ...current, slot: event.target.value as ReservationSlot } : current,
                    )
                  }
                  className="w-full rounded-2xl border border-stone-200 px-4 py-3"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3">
                <input
                  type="checkbox"
                  checked={editReservation.needsCharging}
                  onChange={(event) =>
                    setEditReservation((current) =>
                      current ? { ...current, needsCharging: event.target.checked } : current,
                    )
                  }
                />
                <span className="text-sm font-medium text-stone-700">Besoin de charge</span>
              </label>

              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Enregistrer la reservation
                </button>
                <button
                  type="button"
                  onClick={() => setEditReservation(null)}
                  className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}
        </section>
      </section>

      <section className="mt-8 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm uppercase tracking-[0.35em] text-stone-500">Historique journalier</div>
            <h2 className="mt-2 text-2xl font-semibold text-stone-900">Occupation detaillee des 60 places</h2>
            <p className="mt-2 text-sm text-stone-600">
              Naviguez jour par jour. Chaque tuile affiche la reservation du matin et de l'apres-midi.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setHistoryDate((current) => addDays(current, -1))}
              className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
            >
              Jour precedent
            </button>
            <div className="rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-800">
              {historyDate}
            </div>
            <button
              type="button"
              onClick={() => setHistoryDate((current) => addDays(current, 1))}
              className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
            >
              Jour suivant
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {PARKING_ROWS.map((row) => {
            const rowCells = occupancyCells.filter((cell) => cell.row === row);

            return (
              <section key={row} className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-stone-900">Rangee {row}</h3>
                    <p className="text-xs text-stone-600">
                      {row === "A" || row === "F"
                        ? "Places avec bornes de charge"
                        : "Places standards"}
                    </p>
                  </div>
                  <div className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-600">
                    {createSpotId(row, 1)} - {createSpotId(row, 10)}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">
                  {rowCells.map((cell) => {
                    const empty = !cell.am && !cell.pm;
                    return (
                      <article
                        key={cell.spotId}
                        className={`rounded-2xl border p-3 ${
                          empty ? "border-stone-200 bg-white" : "border-amber-200 bg-amber-50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm font-semibold text-stone-900">{cell.spotId}</div>
                          {cell.hasCharger && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-800">
                              EV
                            </span>
                          )}
                        </div>

                        <div className="mt-3 grid gap-2">
                          <div className="rounded-xl bg-white/80 p-2">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                              Matin
                            </div>
                            {cell.am ? (
                              <>
                                <div className="mt-1 text-sm font-medium text-stone-900">{cell.am.userName}</div>
                                <div className="text-[11px] text-stone-600">{cell.am.userEmail}</div>
                              </>
                            ) : (
                              <div className="mt-1 text-sm text-stone-400">Libre</div>
                            )}
                          </div>

                          <div className="rounded-xl bg-white/80 p-2">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                              Apres-midi
                            </div>
                            {cell.pm ? (
                              <>
                                <div className="mt-1 text-sm font-medium text-stone-900">{cell.pm.userName}</div>
                                <div className="text-[11px] text-stone-600">{cell.pm.userEmail}</div>
                              </>
                            ) : (
                              <div className="mt-1 text-sm text-stone-400">Libre</div>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </section>
    </div>
  );
}
