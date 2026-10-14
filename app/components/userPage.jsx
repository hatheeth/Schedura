"use client";

import { useHandleLogout } from "./handLogout"

import { useEffect, useId, useRef, useState } from "react";
import {
    ArrowRight,
    ArrowUpRight,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Laptop,
    Layers3,
    LayoutGrid,
    LoaderCircle,
    MapPin,
    Monitor,
    Plus,
    Search,
    Sparkles,
    Users,
    X,
} from "lucide-react";



const SAMPLE_USER = {
    id: "user-001",
    name: "Schedura",
    email: "alex@example.com",
};

const SAMPLE_RESOURCES = [
    {
        id: "resource-001",
        name: "Lavender room",
        type: "Meeting room",
        location: "Floor 2 · East wing",
        description: 12,
    },
    {
        id: "resource-002",
        name: "Focus pod",
        type: "Workspace",
        location: "Floor 1 · Quiet zone",
        description: 1,
    },
    {
        id: "resource-003",
        name: "Studio projector",
        type: "Equipment",
        location: "Floor 2 · Equipment desk",
        description: 1,
    },
];

function createSampleReservations(timestamp) {
    const base = new Date(timestamp);
    base.setSeconds(0, 0);

    const at = (hours) =>
        new Date(base.getTime() + hours * 60 * 60 * 1000).toISOString();

    return [
        {
            id: "reservation-001",
            userId: SAMPLE_USER.id,
            resourceId: "resource-001",
            startsAt: at(24),
            endsAt: at(25),
            status: "confirmed",
        },
        {
            id: "reservation-002",
            userId: SAMPLE_USER.id,
            resourceId: "resource-002",
            startsAt: at(48),
            endsAt: at(50),
            status: "confirmed",
        },
        {
            id: "reservation-003",
            userId: SAMPLE_USER.id,
            resourceId: "resource-003",
            startsAt: at(-26),
            endsAt: at(-25),
            status: "confirmed",
        },
    ];
}


const panel = "rounded-2xl border border-[#eee8f6] bg-white";

const primary =
    "inline-flex items-center justify-center gap-2 rounded-xl " +
    "bg-[#8057cc] px-4 py-3 text-sm font-semibold text-white " +
    "transition hover:bg-[#6b43b2] disabled:cursor-not-allowed " +
    "disabled:opacity-50 focus-visible:outline-2 " +
    "focus-visible:outline-offset-4 focus-visible:outline-[#9872d8]";

const secondary =
    "inline-flex items-center justify-center gap-2 rounded-xl " +
    "border border-[#e2d4f6] bg-white px-4 py-3 text-sm " +
    "font-medium text-[#6b43b2] transition hover:bg-[#faf7ff]";

const input =
    "w-full rounded-xl border border-[#e2d4f6] bg-white " +
    "px-3.5 py-3 text-sm text-slate-700 outline-none transition " +
    "placeholder:text-slate-400 focus:border-[#9872d8] " +
    "focus:ring-4 focus:ring-[#f0e8fc]";

const NAVIGATION = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "reservations", label: "My reservations", icon: CalendarDays },
    { id: "resources", label: "Resources", icon: Layers3 },
];

const TABS = [
    { id: "upcoming", label: "Upcoming" },
    { id: "past", label: "Past" },
    { id: "cancelled", label: "Cancelled" },
];

const STATUS_STYLES = {
    Confirmed: "bg-emerald-50 text-emerald-700",
    "In progress": "bg-[#f0e8fc] text-[#6b43b2]",
    Completed: "bg-slate-100 text-slate-500",
    Cancelled: "bg-rose-50 text-rose-600",
};

// timestamp (no tz) columns come back without "Z"; treat them as UTC
const asUtc = (v) =>
    typeof v === "string" && !/([zZ]|[+-]\d{2}:?\d{2})$/.test(v)
        ? `${v.replace(" ", "T")}Z`
        : v;

// Convert a Date into a local datetime-local input value.
function toLocalInput(date) {
    const local = new Date(
        date.getTime() - date.getTimezoneOffset() * 60 * 1000,
    );

    return local.toISOString().slice(0, 16);
}

function formatDateTime(value) {
    return new Date(value).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getStatus(reservation, now) {
    if (reservation.status === "cancelled") return "Cancelled";
    if (Date.parse(reservation.endsAt) <= now) return "Completed";
    if (Date.parse(reservation.startsAt) <= now) return "In progress";
    return "Confirmed";
}

function ResourceIcon({ type, ...props }) {
    const Icon =
        type === "Equipment" ? Monitor : type === "Workspace" ? Laptop : Users;

    return <Icon {...props} />;
}

/* Native dialog provides keyboard focus containment and Escape support. */
function Modal({ title, onClose, children }) {
    const ref = useRef(null);
    const titleId = useId();

    useEffect(() => {
        const dialog = ref.current;
        const previousOverflow = document.body.style.overflow;

        dialog.showModal();
        document.body.style.overflow = "hidden";

        return () => {
            dialog.close();
            document.body.style.overflow = previousOverflow;
        };
    }, []);

    return (
        <dialog
            ref={ref}
            aria-labelledby={titleId}
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
            className="fixed inset-0 m-auto max-h-[90dvh]
        w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto
        rounded-3xl border border-[#eee8f6] bg-white p-0
        text-slate-800 shadow-2xl
        backdrop:bg-slate-950/30 backdrop:backdrop-blur-sm"
        >
            <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                    <h2 id={titleId} className="text-xl font-semibold tracking-tight">
                        {title}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close dialog"
                        className="rounded-full bg-[#faf7ff] p-2
              text-[#8057cc] transition hover:bg-[#f0e8fc]"
                    >
                        <X size={18} />
                    </button>
                </div>

                {children}
            </div>
        </dialog>
    );
}


export default function UserDashboard() {

    const handleLogout = useHandleLogout();
    const [profile, setProfile] = useState(SAMPLE_USER);
    const user = profile;


    const [resources, setResources] = useState([]);
    useEffect(() => {
        const fetchResources = async () => {
            const session = JSON.parse(localStorage.getItem("supabaseSession") || "{}");
            const accessToken = session?.access_token;
            const refreshToken = session?.refresh_token;



            try {
                const res = await fetch("https://schedura-su4v.onrender.com/resource/user", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`,
                        "x-refresh-token": refreshToken,
                    },

                });

                if (!res.ok) {
                    const errorData = await res.json(); // read backend error
                    console.error("Backend error:", errorData.error); // log it in console
                    throw new Error(errorData.error || "Failed to load profile");
                }

                const data = await res.json();

                setResources(data);

            } catch (err) {
                console.error("Fetch failed:", (err).message);
            }
        };

        fetchResources();
    }, []);

    const [reservations, setReservations] = useState([]);

    useEffect(() => {
        const fetchReservations = async () => {
            const session = JSON.parse(localStorage.getItem("supabaseSession") || "{}");
            const accessToken = session?.access_token;
            const refreshToken = session?.refresh_token;

            try {
                const res = await fetch("https://schedura-su4v.onrender.com/reservation/fetch", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                        "x-refresh-token": refreshToken,
                    },
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    console.error("Backend error:", errorData.error);
                    throw new Error(errorData.error || "Failed to fetch reservations");
                }

                const data = await res.json();
                const reservationsData = (Array.isArray(data) ? data : [data]).map(r => ({
                    id: r.id,
                    userId: r.user_id || r.userId,
                    resourceId: r.resource_id || r.resourceId,
                    startsAt: asUtc(r.starts_at || r.startsAt),
                    endsAt: asUtc(r.ends_at || r.endsAt),
                    status: r.status,
                }));
                setReservations(reservationsData);
            } catch (err) {
                console.error("Fetch failed:", err.message);
            }
        };

        fetchReservations();
    }, []);
    const [now, setNow] = useState(null);
    const [activeSection, setActiveSection] = useState("overview");
    const [tab, setTab] = useState("upcoming");
    const [search, setSearch] = useState("");

    // null | { type: "booking" } | { type: "profile" }
    //      | { type: "cancel", reservationId: string }
    const [modal, setModal] = useState(null);

    const [form, setForm] = useState({
        resourceId: "",
        startsAt: "",
        endsAt: "",
    });

    const [error, setError] = useState("");
    const [toast, setToast] = useState(null);



    useEffect(() => {
        const fetchProfile = async () => {
            const session = JSON.parse(localStorage.getItem("supabaseSession") || "{}");
            const accessToken = session?.access_token;
            const refreshToken = session?.refresh_token;



            try {
                const res = await fetch("https://schedura-su4v.onrender.com/user/fetchUser", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`,
                        "x-refresh-token": refreshToken,
                    },
                });

                if (!res.ok) {
                    const errorData = await res.json(); // read backend error
                    console.error("Backend error:", errorData.error); // log it in console
                    throw new Error(errorData.error || "Failed to load profile");
                }

                const data = await res.json();
                console.log(data);
                setProfile(data.data[0]);
            } catch (err) {
                console.error("Fetch failed:", (err).message);
            }
        };

        fetchProfile();
    }, []);




    useEffect(() => {
        const timestamp = Date.now();

        setNow(timestamp);

        // BACKEND CONNECTION POINT:
        // Replace this sample loader with your reservation fetch.


        const timer = window.setInterval(() => setNow(Date.now()), 30_000);
        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!toast) return;

        const timer = window.setTimeout(() => setToast(null), 4500);
        return () => window.clearTimeout(timer);
    }, [toast]);

    function notify(message) {
        setToast({ message });
    }

    function closeModal() {
        setModal(null);
        setError("");
    }

    function openProfile() {
        setError("");
        setModal({ type: "profile" });
    }

    function openBooking(resourceId = "") {
        const start = new Date();
        start.setHours(start.getHours() + 1, 0, 0, 0);

        const end = new Date(start.getTime() + 60 * 60 * 1000);

        setForm({
            resourceId,
            startsAt: toLocalInput(start),
            endsAt: toLocalInput(end),
        });

        setError("");
        setModal({ type: "booking" });
    }

    function updateForm(event) {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
        setError("");
    }

    function openCancellation(reservationId) {
        setError("");
        setModal({ type: "cancel", reservationId });
    }

    async function handleCreateReservation(event) {
        event.preventDefault();
        setError("");

        const start = new Date(form.startsAt).getTime();
        const end = new Date(form.endsAt).getTime();

        // ✅ Validation checks
        if (
            !resources.some((r) => r.id === Number(form.resourceId)) ||
            !Number.isFinite(start) ||
            !Number.isFinite(end)
        ) {
            setError("Choose a resource and valid start and end times.");
            return;
        }

        if (start <= Date.now()) {
            setError("Start time must be in the future.");
            return;
        }

        if (end <= start) {
            setError("End time must be after start time.");
            return;
        }

        const overlaps = reservations.some(
            (r) =>
                r.resourceId === Number(form.resourceId) &&
                r.status === "confirmed" &&
                start < Date.parse(r.endsAt) &&
                end > Date.parse(r.startsAt)
        );

        if (overlaps) {
            setError("This resource is already reserved during that time. Try a different time.");
            return;
        }


        const session = JSON.parse(localStorage.getItem("supabaseSession") || "{}");
        const accessToken = session?.access_token;
        const refreshToken = session?.refresh_token;

        try {
            const res = await fetch("https://schedura-su4v.onrender.com/reservation/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                    "x-refresh-token": refreshToken,
                },
                body: JSON.stringify({
                    resourceId: Number(form.resourceId),
                    startsAt: new Date(start).toISOString(),
                    endsAt: new Date(end).toISOString(),
                    status: "confirmed",
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("Backend error:", errorData.error);
                throw new Error(errorData.error || "Failed to create reservation");
            }

            const data = await res.json();
            const newReservationRaw = Array.isArray(data) ? data[0] : data;

            const newReservation = {
                id: newReservationRaw.id,
                userId: newReservationRaw.user_id ?? newReservationRaw.userId,
                resourceId: newReservationRaw.resource_id ?? newReservationRaw.resourceId,
                startsAt: asUtc(newReservationRaw.starts_at ?? newReservationRaw.startsAt),
                endsAt: asUtc(newReservationRaw.ends_at ?? newReservationRaw.endsAt),
                status: newReservationRaw.status,
            };

            setReservations(prev => {
                const exists = prev.some(r => r.id === newReservation.id);
                return exists ? prev : [newReservation, ...prev];
            });


            setTab("upcoming");
            setSearch("");
            closeModal();
            notify("You’re all set. Reservation confirmed!");

        } catch (err) {
            console.error("Fetch failed:", err.message);
            setError(err.message);
        }
    }



    async function handleCancelReservation() {
        const reservation = reservations.find(
            (item) => item.id === modal?.reservationId,
        );

        if (!reservation) {
            setError("This reservation could not be found.");
            return;
        }

        if (
            reservation.status !== "confirmed" ||
            Date.parse(reservation.startsAt) <= Date.now()
        ) {
            setError("Only confirmed reservations that have not started can be cancelled.");
            return;
        }

        const session = JSON.parse(localStorage.getItem("supabaseSession") || "{}");
        const accessToken = session?.access_token;
        const refreshToken = session?.refresh_token;

        try {
            const res = await fetch("https://schedura-su4v.onrender.com/reservation/cancel", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                    "x-refresh-token": refreshToken,
                },
                body: JSON.stringify({ reservationId: reservation.id }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to cancel reservation");
            }

            const updated = await res.json();

            setReservations((previous) =>
                previous.map((item) =>
                    item.id === updated.id ? { ...item, status: updated.status } : item,
                ),
            );

            closeModal();
            notify("Reservation cancelled. You can find it under Cancelled.");
        } catch (err) {
            console.error("Cancel failed:", err.message);
            setError(err.message);
        }
    }

    // Avoid server/client timezone and date hydration differences.
    if (now === null) {
        return (
            <main className="grid min-h-screen place-items-center bg-[#faf9fd]">
                <div role="status" className="flex items-center gap-3 text-sm text-slate-500">
                    <LoaderCircle size={20} className="animate-spin text-[#8057cc]" />
                    Getting your workspace ready...
                </div>
            </main>
        );
    }

    function resourceFor(id) {
        return (
            resources.find((resource) => resource.id === id) ?? {
                name: "Unknown resource",
                location: "Location unavailable",
                type: "Workspace",
            }
        );
    }

    const initials = user.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("");

    const mine = reservations;


    const groups = {
        upcoming: mine.filter(
            (reservation) =>
                reservation.status === "confirmed" &&
                Date.parse(reservation.endsAt) > now,
        ),
        past: mine.filter(
            (reservation) =>
                reservation.status === "confirmed" &&
                Date.parse(reservation.endsAt) <= now,
        ),
        cancelled: mine.filter(
            (reservation) => reservation.status === "cancelled",
        ),
    };

    const query = search.trim().toLowerCase();

    const visibleReservations = [...groups[tab]]
        .filter((reservation) => {
            const resource = resourceFor(reservation.resourceId);
            return `${resource.name} ${resource.location}`
                .toLowerCase()
                .includes(query);
        })
        .sort((a, b) =>
            tab === "upcoming"
                ? Date.parse(a.startsAt) - Date.parse(b.startsAt)
                : Date.parse(b.startsAt) - Date.parse(a.startsAt),
        );

    const nextReservation = [...groups.upcoming]
        .filter((reservation) => Date.parse(reservation.startsAt) > now)
        .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))[0];

    const cancellationTarget =
        modal?.type === "cancel"
            ? mine.find((reservation) => reservation.id === modal.reservationId)
            : null;

    const stats = [
        {
            label: "Upcoming & active",
            value: groups.upcoming.length,
            icon: CalendarDays,
        },
        {
            label: "Completed",
            value: groups.past.length,
            icon: CheckCircle2,
        },
        {
            label: "Resources",
            value: resources.length,
            icon: Layers3,
        },
    ];

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return (
        <div className="min-h-screen bg-[#faf9fd] font-sans text-[#302b3c]">
            {/* DESKTOP SIDEBAR */}
            <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col
        border-r border-[#eee8f6] bg-white px-5 py-8 lg:flex">
                <a
                    href="#overview"
                    onClick={() => setActiveSection("overview")}
                    className="flex items-center gap-3 px-2 text-2xl font-bold tracking-tight"
                >
                    <span className="grid size-10 place-items-center rounded-xl
            bg-[#8057cc] text-white">
                        S
                    </span>
                    <span>
                        Schedura<span className="text-[#b191e5]">.</span>
                    </span>
                </a>

                <p className="mb-3 mt-12 px-4 text-[10px] font-semibold
          tracking-[0.2em] text-slate-400">
                    WORKSPACE
                </p>

                <nav aria-label="Main navigation" className="space-y-2">
                    {NAVIGATION.map(({ id, label, icon: Icon }) => (
                        <a
                            key={id}
                            href={`#${id}`}
                            onClick={() => setActiveSection(id)}
                            aria-current={activeSection === id ? "location" : undefined}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3
                text-sm transition ${activeSection === id
                                    ? "bg-[#f0e8fc] font-semibold text-[#6b43b2]"
                                    : "text-slate-500 hover:bg-[#faf7ff]"
                                }`}
                        >
                            <Icon size={18} aria-hidden="true" />
                            {label}
                        </a>
                    ))}
                </nav>

                <button
                    type="button"
                    onClick={openProfile}
                    className="mt-auto flex items-center gap-3
            border-t border-[#eee8f6] pt-6 text-left"
                    aria-label="View your profile"
                >
                    <span className="grid size-10 shrink-0 place-items-center
            rounded-full bg-[#f0e8fc] text-sm font-semibold text-[#6b43b2]">
                        {initials}
                    </span>

                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">
                            {user.name}
                        </span>
                        <span className="mt-1 block truncate text-xs text-slate-500">
                            {user.email}
                        </span>
                    </span>

                    <ArrowUpRight size={16} className="shrink-0 text-[#9872d8]" />
                </button>
            </aside>

            <main id="overview" className="scroll-mt-6 lg:ml-60">
                <div className="mx-auto max-w-7xl p-5 md:p-8 xl:p-10">
                    {/* MOBILE NAVIGATION */}
                    <nav
                        aria-label="Mobile navigation"
                        className="mb-7 flex gap-2 overflow-x-auto pb-1 lg:hidden"
                    >
                        {NAVIGATION.map(({ id, label }) => (
                            <a
                                key={id}
                                href={`#${id}`}
                                onClick={() => setActiveSection(id)}
                                className={`shrink-0 rounded-full px-4 py-2 text-xs ${activeSection === id
                                    ? "bg-[#f0e8fc] font-semibold text-[#6b43b2]"
                                    : "bg-white text-slate-500"
                                    }`}
                            >
                                {label}
                            </a>
                        ))}
                    </nav>

                    <header className="mb-8 flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight
                text-slate-800 sm:text-[28px]">
                                Your workspace, organized.
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Good to see you, {user.name.split(" ")[0]}.
                                A little less planning. A little more doing.
                            </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                            <span className="hidden items-center gap-2 rounded-full
                border border-[#eee8f6] bg-white px-4 py-2.5
                text-xs text-slate-500 xl:flex">
                                <CalendarDays size={15} className="text-[#9872d8]" />
                                {new Date(now).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </span>

                            <button
                                type="button"
                                onClick={openProfile}
                                aria-label="View your profile"
                                className="grid size-11 place-items-center rounded-full
                  bg-[#f0e8fc] text-sm font-semibold text-[#6b43b2]
                  ring-4 ring-white transition hover:bg-[#e2d4f6]"
                            >
                                {initials}
                            </button>
                        </div>
                    </header>

                    {/* WELCOME BANNER */}
                    <section className="grid items-center gap-8 rounded-3xl
            border border-[#e2d4f6] bg-gradient-to-br
            from-[#f0e8fc] via-[#faf7ff] to-violet-100
            p-6 sm:p-8 md:grid-cols-[1fr_250px] xl:p-10">
                        <div>
                            <p className="flex items-center gap-2 text-[10px]
                font-bold tracking-[0.18em] text-[#8057cc]">
                                <Sparkles size={14} aria-hidden="true" />
                                SPACE FOR YOUR NEXT BIG IDEA
                            </p>

                            <h2 className="mt-4 text-3xl font-semibold leading-tight
                tracking-tight text-slate-800 sm:text-4xl">
                                Good work starts
                                <br />
                                with the right space.
                            </h2>

                            <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                                Find your focus, bring your team together, and make every
                                reservation effortless.
                            </p>

                            <button
                                type="button"
                                onClick={() => openBooking()}
                                disabled={!resources.length}
                                className={`${primary} mt-6 shadow-lg shadow-violet-200/40`}
                            >
                                <Plus size={18} />
                                Make reservation
                            </button>
                        </div>

                        <div className="rounded-2xl border border-white bg-white/75 p-6">
                            <p className="text-[10px] font-semibold
                tracking-[0.16em] text-[#8057cc]">
                                YOUR NEXT RESERVATION
                            </p>

                            {nextReservation ? (
                                <>
                                    <div className="my-4 grid size-10 place-items-center
                    rounded-xl bg-[#f0e8fc] text-[#8057cc]">
                                        <CalendarDays size={20} />
                                    </div>

                                    <h3 className="text-lg font-semibold">
                                        {resourceFor(nextReservation.resourceId).name}
                                    </h3>

                                    <p className="mt-2 text-xs leading-5 text-slate-500">
                                        {formatDateTime(nextReservation.startsAt)}
                                    </p>

                                    <a
                                        href="#reservations"
                                        onClick={() => {
                                            setTab("upcoming");
                                            setSearch("");
                                            setActiveSection("reservations");
                                        }}
                                        className="mt-5 inline-flex items-center gap-2
                      text-xs font-semibold text-[#6b43b2]"
                                    >
                                        View reservation <ArrowRight size={14} />
                                    </a>
                                </>
                            ) : (
                                <>
                                    <h3 className="mt-5 text-lg font-semibold">
                                        Your next idea starts here.
                                    </h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        Reserve a space and give your plans a place to happen.
                                    </p>
                                </>
                            )}
                        </div>
                    </section>

                    {/* STATISTICS */}
                    <section
                        aria-label="Reservation statistics"
                        className="my-6 grid grid-cols-3 gap-3 sm:gap-5"
                    >
                        {stats.map(({ label, value, icon: Icon }) => (
                            <div
                                key={label}
                                className={`${panel} flex items-center gap-4 p-4 sm:p-6`}
                            >
                                <div className="hidden size-12 shrink-0 place-items-center
                  rounded-2xl bg-[#faf7ff] text-[#9872d8] sm:grid">
                                    <Icon size={23} aria-hidden="true" />
                                </div>

                                <div>
                                    <p className="text-[11px] text-slate-500 sm:text-xs">
                                        {label}
                                    </p>
                                    <p className="mt-2 text-2xl font-semibold
                    tracking-tight text-slate-800 sm:text-3xl">
                                        {value}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </section>

                    {/* RESOURCE CATALOGUE */}
                    <section id="resources" className="scroll-mt-6 pt-3">
                        <div className="mb-5 flex items-end justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold tracking-tight">
                                    Find your space
                                </h2>
                                <p className="mt-1.5 text-sm text-slate-500">
                                    Thoughtfully equipped. Ready for your next plan.
                                </p>
                            </div>
                            <span className="hidden text-xs text-slate-500 sm:block">
                                Rooms & equipment
                            </span>
                        </div>

                        {resources.length ? (
                            <div className="grid gap-5 md:grid-cols-3">
                                {resources.map((resource) => (
                                    <article
                                        key={resource.id}
                                        className={`${panel} p-5 transition
                      hover:border-[#e2d4f6]
                      hover:shadow-lg hover:shadow-violet-100/50`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="grid size-11 place-items-center
                        rounded-xl bg-[#faf7ff] text-[#9872d8]">
                                                <ResourceIcon type={resource.type} size={21} />
                                            </div>

                                            <span className="rounded-md bg-[#faf7ff] px-2.5
                        py-1.5 text-[10px] font-medium text-[#8057cc]">
                                                {resource.type}
                                            </span>
                                        </div>

                                        <h3 className="mt-5 font-semibold text-slate-800">
                                            {resource.name}
                                        </h3>

                                        <p className="mt-2 flex items-center gap-1.5
                      text-xs text-slate-500">
                                            <MapPin size={14} className="shrink-0" />
                                            {resource.location}
                                        </p>

                                        <div className="mt-5 flex flex-wrap items-center
                      justify-between gap-3 border-t border-[#eee8f6] pt-4">
                                            <span className="text-xs text-slate-500">
                                                {resource.type === "Equipment"
                                                    ? "Shared equipment"
                                                    : `${resource.description} ${resource.description === 1 ? "person" : "people"
                                                    }`}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() => openBooking(resource.id)}
                                                aria-label={`Book ${resource.name}`}
                                                className="inline-flex items-center gap-1
                          text-xs font-semibold text-[#8057cc]
                          hover:text-[#55368c]"
                                            >
                                                Book resource <ArrowUpRight size={15} />
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className={`${panel} p-8 text-center text-sm text-slate-500`}>
                                No resources are available yet.
                            </div>
                        )}
                    </section>

                    {/* RESERVATIONS */}
                    <section id="reservations" className="scroll-mt-6 pt-9">
                        <div className="mb-5 flex flex-wrap items-end
              justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold tracking-tight">
                                    My reservations
                                </h2>
                                <p className="mt-1.5 text-sm text-slate-500">
                                    Your plans, all in one place.
                                </p>
                            </div>

                            <p className="flex items-center gap-1.5
                text-[11px] text-slate-500">
                                <Clock3 size={13} />
                                Your local time · {timezone}
                            </p>
                        </div>

                        <div className={`${panel} overflow-hidden`}>
                            <div className="flex flex-wrap items-center
                justify-between gap-4 border-b border-[#eee8f6]
                p-4 sm:px-5">
                                <div
                                    role="group"
                                    aria-label="Filter reservations"
                                    className="flex flex-wrap gap-1"
                                >
                                    {TABS.map(({ id, label }) => (
                                        <button
                                            key={id}
                                            type="button"
                                            aria-pressed={tab === id}
                                            onClick={() => setTab(id)}
                                            className={`rounded-lg px-3 py-2.5 text-xs transition ${tab === id
                                                ? "bg-[#f0e8fc] font-semibold text-[#6b43b2]"
                                                : "text-slate-500 hover:bg-[#faf7ff]"
                                                }`}
                                        >
                                            {label}
                                            <span className="ml-1.5 opacity-70">
                                                {groups[id].length}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                <div className="relative w-full sm:w-56">
                                    <Search
                                        size={15}
                                        aria-hidden="true"
                                        className="pointer-events-none absolute left-3
                      top-1/2 -translate-y-1/2 text-slate-400"
                                    />
                                    <input
                                        type="search"
                                        aria-label="Search reservations by resource or location"
                                        placeholder="Search reservations..."
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        className={`${input} py-2.5 pl-9 text-xs`}
                                    />
                                </div>
                            </div>

                            <div
                                aria-hidden="true"
                                className="hidden grid-cols-[1.1fr_1.5fr_100px_76px]
                  gap-4 border-b border-[#eee8f6] bg-[#faf7ff]/60
                  px-5 py-3 text-[10px] font-medium
                  tracking-wider text-slate-500 md:grid"
                            >
                                <span>RESOURCE</span>
                                <span>START → END</span>
                                <span>STATUS</span>
                                <span className="text-right">ACTION</span>
                            </div>

                            {visibleReservations.length ? (
                                <ul
                                    aria-label={`${tab} reservations`}
                                    className="divide-y divide-[#eee8f6]"
                                >
                                    {visibleReservations.map((reservation) => {
                                        const resource = resourceFor(reservation.resourceId);
                                        const status = getStatus(reservation, now);
                                        const canCancel =
                                            reservation.status === "confirmed" &&
                                            Date.parse(reservation.startsAt) > now;

                                        return (
                                            <li
                                                key={`${reservation.id}-${reservation.startsAt}`}
                                                className="grid grid-cols-2 items-center gap-4
                          px-5 py-5 md:grid-cols-[1.1fr_1.5fr_100px_76px]"
                                            >
                                                <div className="col-span-2 min-w-0 md:col-span-1">
                                                    <h3 className="text-sm font-semibold text-slate-700">
                                                        {resource.name}
                                                    </h3>
                                                    <p className="mt-1.5 flex items-center gap-1
                            text-xs text-slate-500">
                                                        <MapPin size={12} className="shrink-0" />
                                                        {resource.location}
                                                    </p>
                                                </div>

                                                <div className="col-span-2 space-y-1 text-xs
                          leading-5 text-slate-500 md:col-span-1">
                                                    <p>
                                                        <span className="sr-only">Starts: </span>
                                                        <time dateTime={reservation.startsAt}>
                                                            {formatDateTime(reservation.startsAt)}
                                                        </time>
                                                    </p>
                                                    <p>
                                                        <span aria-hidden="true">→ </span>
                                                        <span className="sr-only">Ends: </span>
                                                        <time dateTime={reservation.endsAt}>
                                                            {formatDateTime(reservation.endsAt)}
                                                        </time>
                                                    </p>
                                                </div>

                                                <span className={`w-fit rounded-md px-2.5 py-1.5
                          text-[10px] font-medium ${STATUS_STYLES[status]}`}>
                                                    {status}
                                                </span>

                                                <div className="justify-self-end">
                                                    {canCancel ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => openCancellation(reservation.id)}
                                                            aria-label={`Cancel ${resource.name} reservation`}
                                                            className="rounded-lg border border-[#eee8f6]
                                px-3 py-2 text-xs text-slate-500 transition
                                hover:border-rose-200 hover:bg-rose-50
                                hover:text-rose-600"
                                                        >
                                                            Cancel
                                                        </button>
                                                    ) : (
                                                        <span
                                                            aria-label="No actions available"
                                                            className="px-3 text-slate-300"
                                                        >
                                                            —
                                                        </span>
                                                    )}
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <div className="px-6 py-12 text-center">
                                    <div className="mx-auto mb-4 grid size-14 place-items-center
                    rounded-2xl bg-[#faf7ff] text-[#b191e5]">
                                        <CalendarDays size={26} />
                                    </div>

                                    <h3 className="font-semibold text-slate-700">
                                        {query ? "No matching reservations" : "Nothing here just yet"}
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        {query
                                            ? "Try another resource name or location."
                                            : tab === "upcoming"
                                                ? "Make a reservation to get started."
                                                : tab === "past"
                                                    ? "Completed reservations will appear here."
                                                    : "Cancelled reservations will appear here."}
                                    </p>

                                    {query ? (
                                        <button
                                            type="button"
                                            onClick={() => setSearch("")}
                                            className={`${secondary} mt-5`}
                                        >
                                            Clear search
                                        </button>
                                    ) : tab === "upcoming" ? (
                                        <button
                                            type="button"
                                            onClick={() => openBooking()}
                                            disabled={!resources.length}
                                            className={`${primary} mt-5`}
                                        >
                                            <Plus size={16} />
                                            Make reservation
                                        </button>
                                    ) : null}
                                </div>
                            )}
                        </div>

                        <p className="mt-3 text-xs leading-5 text-slate-500">
                            Upcoming includes reservations in progress. You can cancel
                            a reservation before it starts.
                        </p>
                    </section>

                    <footer className="mt-9 pb-2 text-center text-[11px] text-slate-500">
                        Reserve · A little space for better work.
                    </footer>
                </div>
            </main>

            {/* CREATE RESERVATION DIALOG */}
            {modal?.type === "booking" && (
                <Modal title="Make a reservation" onClose={closeModal}>
                    <p className="mb-5 mt-3 text-sm leading-6 text-slate-500">
                        Pick a resource and make a little space for what matters.
                    </p>

                    <div className="mb-6 flex items-start gap-2 rounded-xl
            bg-[#faf7ff] px-4 py-3 text-xs leading-5 text-[#6b43b2]">
                        <Clock3 size={16} className="mt-0.5 shrink-0" />
                        All booking times use your local timezone: {timezone}.
                    </div>

                    <form onSubmit={handleCreateReservation} className="space-y-5">
                        <div>
                            <label
                                htmlFor="resourceId"
                                className="mb-2 block text-sm font-medium"
                            >
                                Resource name
                            </label>

                            <select
                                id="resourceId"
                                name="resourceId"
                                required
                                autoFocus
                                value={form.resourceId}
                                onChange={updateForm}
                                className={input}
                            >
                                <option value="" disabled>
                                    Select a resource
                                </option>
                                {resources.map((resource) => (
                                    <option key={resource.id} value={resource.id}>
                                        {resource.name} — {resource.type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="startsAt"
                                className="mb-2 block text-sm font-medium"
                            >
                                Start date & time
                            </label>

                            <input
                                id="startsAt"
                                name="startsAt"
                                type="datetime-local"
                                required
                                step={60}
                                min={toLocalInput(new Date(now))}
                                value={form.startsAt}
                                onChange={updateForm}
                                className={input}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="endsAt"
                                className="mb-2 block text-sm font-medium"
                            >
                                End date & time
                            </label>

                            <input
                                id="endsAt"
                                name="endsAt"
                                type="datetime-local"
                                required
                                step={60}
                                min={form.startsAt}
                                value={form.endsAt}
                                onChange={updateForm}
                                className={input}
                            />
                        </div>

                        {error && (
                            <p role="alert" className="rounded-xl bg-rose-50
                p-3 text-sm text-rose-700">
                                {error}
                            </p>
                        )}

                        <p className="text-xs leading-5 text-slate-500">
                            You can cancel any time before your reservation starts.
                        </p>

                        <div className="flex flex-wrap justify-end gap-3
              border-t border-[#eee8f6] pt-5">
                            <button type="button" onClick={closeModal} className={secondary}>
                                Not now
                            </button>
                            <button type="submit" className={primary}>
                                <CheckCircle2 size={17} />
                                Confirm reservation
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* CANCELLATION DIALOG */}
            {modal?.type === "cancel" && cancellationTarget && (
                <Modal title="Cancel this reservation?" onClose={closeModal}>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                        This releases the resource for someone else.
                        Your reservation will stay in your cancelled history.
                    </p>

                    <div className="my-6 rounded-2xl bg-[#faf7ff] p-4">
                        <p className="font-semibold">
                            {resourceFor(cancellationTarget.resourceId).name}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                            {formatDateTime(cancellationTarget.startsAt)}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            → {formatDateTime(cancellationTarget.endsAt)}
                        </p>
                    </div>

                    {error && (
                        <p role="alert" className="mb-4 rounded-xl bg-rose-50
              p-3 text-sm text-rose-700">
                            {error}
                        </p>
                    )}

                    <div className="flex flex-wrap justify-end gap-3">
                        <button
                            type="button"
                            autoFocus
                            onClick={closeModal}
                            className={secondary}
                        >
                            Keep reservation
                        </button>

                        <button
                            type="button"
                            onClick={handleCancelReservation}
                            className="rounded-xl bg-rose-600 px-4 py-3 text-sm
                font-semibold text-white transition hover:bg-rose-700"
                        >
                            Yes, cancel
                        </button>
                    </div>
                </Modal>
            )}

            {/* USER INFORMATION DIALOG */}
            {modal?.type === "profile" && (
                <Modal title="Your profile" onClose={closeModal}>
                    <p className="mt-3 text-sm text-slate-500">
                        Your personal account information.
                    </p>

                    <div className="mt-6 flex items-center gap-4 rounded-2xl
            border border-[#eee8f6] bg-[#faf7ff] p-5">
                        <span className="grid size-16 shrink-0 place-items-center
              rounded-full bg-[#e2d4f6] text-xl font-semibold text-[#6b43b2]">
                            {initials}
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-lg font-semibold">{user.name}</p>
                            <p className="mt-1 text-xs text-[#8057cc]">Workspace member</p>
                        </div>
                    </div>

                    <dl className="mt-6 space-y-5">
                        <div>
                            <dt className="text-xs text-slate-500">Full name</dt>
                            <dd className="mt-1.5 text-sm font-medium">{user.name}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-slate-500">Email address</dt>
                            <dd className="mt-1.5 break-all text-sm font-medium">
                                {user.email}
                            </dd>
                        </div>
                    </dl>

                    <div className="mt-7 flex justify-between border-t border-[#eee8f6] pt-5">
                        <button type="button" onClick={handleLogout} className={primary}>
                            Logout
                        </button>
                        <button type="button" onClick={closeModal} className={primary}>
                            Done
                        </button>
                    </div>
                </Modal>
            )}

            {/* SUCCESS NOTIFICATION */}
            {toast && (
                <div
                    role="status"
                    className="fixed bottom-5 left-1/2 z-50 flex
            w-[calc(100%_-_2rem)] max-w-md -translate-x-1/2
            items-center gap-3 rounded-2xl bg-slate-800
            px-5 py-4 text-sm text-white shadow-xl"
                >
                    <CheckCircle2
                        size={19}
                        className="shrink-0 text-[#cdb5ef]"
                        aria-hidden="true"
                    />

                    <p className="flex-1">{toast.message}</p>

                    <button
                        type="button"
                        onClick={() => setToast(null)}
                        aria-label="Dismiss notification"
                        className="rounded-md p-1 text-slate-300 hover:text-white"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}