"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
    ArrowUpRight,
    CheckCircle2,
    Laptop,
    Layers3,
    LayoutGrid,
    MapPin,
    Monitor,
    Plus,
    Search,
    ShieldCheck,
    Sparkles,
    Trash2,
    UserRound,
    Users,
    X,
} from "lucide-react";

import { useHandleLogout } from "./handLogout";

const SAMPLE_USER = {
    id: "admin-001",
    name: "Alex Morgan",
    email: "alex@example.com",
    role: "Administrator",
};

const SAMPLE_RESOURCES = [
    {
        id: "001",
        createdBy: "admin-001",
        name: "Lavender room",
        location: "Floor 2 · East wing",
        type: "Meeting room",
        description:
            "A bright meeting space with a whiteboard, video conferencing, and room for great ideas.",
    },
    {
        id: "resource-002",
        createdBy: "admin-001",
        name: "Focus pod",
        location: "Floor 1 · Quiet zone",
        type: "Workspace",
        description:
            "A quiet, comfortable workspace for uninterrupted thinking and individual projects.",
    },
    {
        id: "resource-003",
        createdBy: "admin-001",
        name: "Studio projector",
        location: "Floor 2 · Equipment desk",
        type: "Equipment",
        description:
            "A portable HD projector with HDMI connectivity. Ideal for presentations and workshops.",
    },
];

const DEFAULT_TYPES = ["Meeting room", "Workspace", "Equipment"];

const EMPTY_RESOURCE = {
    name: "",
    location: "",
    type: "",
    description: "",
};

const FORM_FIELDS = [
    {
        name: "name",
        label: "Resource name",
        placeholder: "e.g. Lavender room",
        maxLength: 100,
    },
    {
        name: "location",
        label: "Location",
        placeholder: "e.g. Floor 2 · East wing",
        maxLength: 160,
    },
    {
        name: "type",
        label: "Type",
        placeholder: "Select or enter a type",
        maxLength: 60,
    },
];

/* ──────────────────────────────────────────
   SHARED STYLES & COMPONENTS
────────────────────────────────────────── */

const inputClass =
    "w-full rounded-xl border border-[#e2d4f6] bg-white px-3.5 py-3 " +
    "text-sm text-slate-700 outline-none transition " +
    "placeholder:text-slate-400 focus:border-[#9872d8] " +
    "focus:ring-4 focus:ring-[#f0e8fc]";

const primaryButton =
    "inline-flex items-center justify-center gap-2 rounded-xl " +
    "bg-[#8057cc] px-4 py-3 text-sm font-semibold text-white " +
    "transition hover:bg-[#6b43b2] focus-visible:outline-2 " +
    "focus-visible:outline-offset-4 focus-visible:outline-[#9872d8]";

const secondaryButton =
    "inline-flex items-center justify-center gap-2 rounded-xl " +
    "border border-[#e2d4f6] bg-white px-4 py-3 text-sm " +
    "font-medium text-[#6b43b2] transition hover:bg-[#faf7ff]";

function ResourceIcon({ type }) {
    const Icon =
        type === "Equipment"
            ? Monitor
            : type === "Workspace"
                ? Laptop
                : Users;

    return <Icon size={25} aria-hidden="true" />;
}

function Modal({ title, onClose, children }) {
    const dialogRef = useRef(null);
    const titleId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        const previousFocus = document.activeElement;
        const previousOverflow = document.body.style.overflow;

        dialog.showModal();
        document.body.style.overflow = "hidden";

        return () => {
            dialog.close();
            document.body.style.overflow = previousOverflow;

            if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
                previousFocus.focus();
            }
        };
    }, []);

    return (
        <dialog
            ref={dialogRef}
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



export default function AdminResourcesPage() {


    // BACKEND: replace this initial data with your fetched resources.
    const [resources, setResources] = useState([]);
    const [profile, setProfile] = useState(SAMPLE_USER);
    const user = profile;
    const stored = JSON.parse(localStorage.getItem("supabaseSession") || "{}");
    const handleLogout = useHandleLogout();
    useEffect(() => {
        const fetchResources = async () => {
            const stored = JSON.parse(localStorage.getItem("supabaseSession") || "{}");
            const accessToken = stored.session?.access_token;
            const refreshToken = stored.session?.refresh_token;



            try {
                const res = await fetch("https://schedura-su4v.onrender.com/resource/", {
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
                setResources(data);

            } catch (err) {
                console.error("Fetch failed:", (err).message);
            }
        };

        fetchResources();
    }, []);



    useEffect(() => {
        const fetchProfile = async () => {
            const stored = JSON.parse(localStorage.getItem("supabaseSession") || "{}");
            const accessToken = stored.session?.access_token;
            const refreshToken = stored.session?.refresh_token;



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


    const [query, setQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [draft, setDraft] = useState(EMPTY_RESOURCE);
    const [error, setError] = useState("");
    const [toast, setToast] = useState(null);

    // null | { kind: "create" } | { kind: "edit", id }
    //      | { kind: "delete", id } | { kind: "profile" }
    const [modal, setModal] = useState(null);

    useEffect(() => {
        if (!toast) return;

        const timer = window.setTimeout(() => setToast(null), 4000);
        return () => window.clearTimeout(timer);
    }, [toast]);

    // UI ownership filter. Your backend should also enforce ownership.
    const myResources = resources.filter(
        (resource) => resource.createdBy === stored.session?.user?.id,
    );

    const resourceTypes = [
        ...new Set([
            ...DEFAULT_TYPES,
            ...myResources.map((resource) => resource.type),
        ]),
    ].sort();

    const searchTerm = query.trim().toLowerCase();

    const visibleResources = myResources.filter((resource) => {
        const matchesType = !typeFilter || resource.type === typeFilter;

        const matchesSearch = [
            resource.name,
            resource.location,
            resource.type,
            resource.description,
        ]
            .join(" ")
            .toLowerCase()
            .includes(searchTerm);

        return matchesType && matchesSearch;
    });

    const selectedResource = modal?.id
        ? myResources.find((resource) => resource.id === modal.id)
        : null;

    const initials = user.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("");

    const statistics = [
        {
            label: "Your resources",
            value: myResources.length,
            icon: Layers3,
        },
        {
            label: "Resource types",
            value: new Set(myResources.map((resource) => resource.type)).size,
            icon: LayoutGrid,
        },
        {
            label: "Your role",
            value: user.role,
            icon: ShieldCheck,
        },
    ];

    function notify(message) {
        setToast({ message });
    }

    function closeModal() {
        setModal(null);
        setError("");
    }

    function clearFilters() {
        setQuery("");
        setTypeFilter("");
    }

    function openProfile() {
        setError("");
        setModal({ kind: "profile" });
    }

    function openCreate() {
        setDraft({ ...EMPTY_RESOURCE });
        setError("");
        setModal({ kind: "create" });
    }

    function openEdit(resource) {
        setDraft({
            name: resource.name,
            location: resource.location,
            type: resource.type,
            description: resource.description,
        });

        setError("");
        setModal({ kind: "edit", id: resource.id });
    }

    function openDelete(resource) {
        setError("");
        setModal({ kind: "delete", id: resource.id });
    }

    function updateDraft(event) {
        const { name, value } = event.target;

        setDraft((previous) => ({ ...previous, [name]: value }));
        setError("");
    }

    async function handleSaveResource(event) {
        event.preventDefault();

        const values = Object.fromEntries(
            Object.entries(draft).map(([key, value]) => [key, value.trim()])
        );

        if (Object.values(values).some((value) => !value)) {
            setError("Please complete all fields.");
            return;
        }

        const isEditing = modal?.kind === "edit";
        const endpoint = isEditing
            ? `https://schedura-su4v.onrender.com/resource/${selectedResource.id}`
            : "https://schedura-su4v.onrender.com/resource";

        const method = isEditing ? "PATCH" : "POST";

        try {

           const stored = JSON.parse(localStorage.getItem("supabaseSession") || "{}");
            const accessToken = stored.session?.access_token;
            const refreshToken = stored.session?.refresh_token;

            const res = await fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                    "x-refresh-token": refreshToken,
                },
                body: JSON.stringify(values)
            });

            if (!res.ok) {
                const { error } = await res.json();
                throw new Error(error || "Failed to save resource");
            }

            const savedResource = await res.json(); // already an object
            console.log("Saved resource from backend:", savedResource);

            setResources((previous) =>
                isEditing
                    ? previous.map((resource) =>
                        resource.id === savedResource.id ? savedResource : resource
                    )
                    : [savedResource, ...previous] // append new resource
            );
            clearFilters();
            closeModal();
            notify(isEditing ? "Resource updated successfully." : "Resource created successfully.");
        } catch (err) {
            setError(err.message);
        }
    }


  async  function handleDeleteResource() {
        if (!selectedResource) {
            setError("This resource could not be found.");
            return;
        }
        try {
            const resourceId = selectedResource.id;
            const stored = JSON.parse(localStorage.getItem("supabaseSession") || "{}");
            const accessToken = stored.session?.access_token;
            const refreshToken = stored.session?.refresh_token;


            const res = await fetch(`https://schedura-su4v.onrender.com/resource/${selectedResource.id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                    "x-refresh-token": refreshToken,
                }
            });

            if (!res.ok) {
                const { error } = await res.json();
                throw new Error(error || "Failed to save resource");
            }


            setResources((previous) =>
                previous.filter(
                    (resource) =>
                        !(
                            resource.id === resourceId &&
                            resource.createdBy === session?.user?.id
                        ),
                ),
            );

            clearFilters();
            closeModal();
            notify("Resource deleted.");
        }
        catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className="min-h-screen bg-[#faf9fd] font-sans text-[#302b3c]">
            {/* SIDEBAR */}
            <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col
        border-r border-[#eee8f6] bg-white px-5 py-8 lg:flex">
                <a
                    href="#resources"
                    className="flex items-center gap-3 px-2 text-2xl
            font-bold tracking-tight"
                >
                    <span className="grid size-10 place-items-center
            rounded-xl bg-[#8057cc] text-white">
                        r
                    </span>
                    <span>
                        Schedura<span className="text-[#b191e5]">.</span>
                    </span>
                </a>

                <p className="mb-3 mt-12 px-4 text-[10px]
          font-semibold tracking-[0.2em] text-slate-400">
                    ADMIN WORKSPACE
                </p>

                <nav aria-label="Admin navigation" className="space-y-2">
                    <a
                        href="#resources"
                        aria-current="page"
                        className="flex items-center gap-3 rounded-xl
              bg-[#f0e8fc] px-4 py-3 text-sm font-semibold text-[#6b43b2]"
                    >
                        <LayoutGrid size={18} />
                        My resources
                    </a>

                    <button
                        type="button"
                        onClick={openProfile}
                        className="flex w-full items-center gap-3 rounded-xl
              px-4 py-3 text-sm text-slate-500 transition
              hover:bg-[#faf7ff]"
                    >
                        <UserRound size={18} />
                        My profile
                    </button>
                </nav>

                <button
                    type="button"
                    onClick={openProfile}
                    aria-label="View your profile"
                    className="mt-auto flex items-center gap-3
            border-t border-[#eee8f6] pt-6 text-left"
                >
                    <span className="grid size-11 shrink-0 place-items-center
            rounded-full bg-[#f0e8fc] text-sm font-semibold text-[#6b43b2]">
                        {initials}
                    </span>

                    <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">
                            {user.name}
                        </span>
                        <span className="mt-1 block text-xs text-slate-500">
                            {user.role}
                        </span>
                    </span>
                </button>
            </aside>

            <main className="lg:ml-60">
                <div className="mx-auto max-w-7xl p-5 md:p-8 xl:p-10">
                    {/* HEADER */}
                    <header className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-semibold
                tracking-tight text-slate-800 sm:text-[28px]">
                                Resource management
                            </h1>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Your spaces and equipment, thoughtfully organized.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={openProfile}
                            aria-label="View your profile"
                            className="grid size-11 shrink-0 place-items-center
                rounded-full bg-[#f0e8fc] text-sm font-semibold
                text-[#6b43b2] ring-4 ring-white transition
                hover:bg-[#e2d4f6]"
                        >
                            {initials}
                        </button>
                    </header>

                    {/* WELCOME BANNER */}
                    <section className="mt-8 flex flex-col items-start
            justify-between gap-6 rounded-3xl border border-[#e2d4f6]
            bg-gradient-to-br from-[#f0e8fc] via-[#faf7ff]
            to-violet-100 p-6 sm:p-8 md:flex-row md:items-center">
                        <div>
                            <p className="flex items-center gap-2 text-[10px]
                font-bold tracking-[0.16em] text-[#8057cc]">
                                <Sparkles size={14} />
                                A LITTLE SPACE FOR BETTER WORK
                            </p>

                            <h2 className="mt-4 text-3xl font-semibold
                leading-tight tracking-tight text-slate-800 sm:text-4xl">
                                The right resources.
                                <br />
                                All in one place.
                            </h2>

                            <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                                Create and manage the resources you share with your workspace.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={openCreate}
                            className={`${primaryButton} shrink-0 shadow-lg shadow-violet-200/40`}
                        >
                            <Plus size={18} />
                            Add resource
                        </button>
                    </section>

                    {/* STATISTICS */}
                    <section
                        aria-label="Resource summary"
                        className="my-6 grid grid-cols-3 gap-3 sm:gap-5"
                    >
                        {statistics.map(({ label, value, icon: Icon }) => (
                            <div
                                key={label}
                                className="flex min-w-0 items-center gap-4 rounded-2xl
                  border border-[#eee8f6] bg-white p-4 sm:p-5"
                            >
                                <span className="hidden size-12 shrink-0 place-items-center
                  rounded-2xl bg-[#faf7ff] text-[#9872d8] xl:grid">
                                    <Icon size={23} />
                                </span>

                                <div className="min-w-0">
                                    <p className="text-[11px] text-slate-500 sm:text-xs">
                                        {label}
                                    </p>

                                    <p
                                        className={`mt-2 break-words font-semibold ${typeof value === "number"
                                            ? "text-2xl text-slate-800 sm:text-3xl"
                                            : "text-sm text-[#8057cc] sm:text-lg"
                                            }`}
                                    >
                                        {value}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </section>

                    {/* RESOURCE LIST */}
                    <section id="resources" className="scroll-mt-6 pt-3">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold tracking-tight">
                                    My resources
                                </h2>

                                <p className="mt-1.5 text-sm text-slate-500">
                                    Made by you. Managed by you.
                                </p>
                            </div>

                            <p className="text-right text-xs text-slate-500">
                                {visibleResources.length} of {myResources.length} resources
                            </p>
                        </div>

                        {/* SEARCH & FILTER */}
                        <div className="my-5 flex flex-col gap-3 sm:flex-row">
                            <div className="relative flex-1">
                                <Search
                                    size={17}
                                    aria-hidden="true"
                                    className="pointer-events-none absolute left-3.5
                    top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="search"
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Search resources..."
                                    aria-label="Search resources by name, location, type or description"
                                    className={`${inputClass} pl-10`}
                                />
                            </div>

                            <select
                                value={typeFilter}
                                onChange={(event) => setTypeFilter(event.target.value)}
                                aria-label="Filter by resource type"
                                className={`${inputClass} sm:w-48`}
                            >
                                <option value="">All types</option>

                                {resourceTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* LAVENDER RESOURCE CARDS */}
                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                            {visibleResources.map((resource) => (
                                <article
                                    key={resource.id}
                                    className="flex min-w-0 flex-col rounded-3xl
                    border border-[#e2d4f6] bg-white p-6
                    shadow-sm shadow-violet-100/30 transition
                    hover:shadow-lg hover:shadow-violet-100/50"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="grid size-14 shrink-0 place-items-center
                      rounded-2xl bg-[#faf7ff] text-[#9872d8]">
                                            <ResourceIcon type={resource.type} />
                                        </span>

                                        <span className="max-w-[65%] break-words rounded-lg
                      bg-[#faf7ff] px-3 py-2 text-xs text-[#8057cc]">
                                            {resource.type}
                                        </span>
                                    </div>

                                    <h3 className="mt-6 break-words text-xl
                    font-semibold tracking-tight text-slate-900">
                                        {resource.name}
                                    </h3>

                                    <p className="mt-2.5 flex items-start gap-2
                    text-sm leading-6 text-[#73849e]">
                                        <MapPin size={17} className="mt-0.5 shrink-0" />
                                        <span className="min-w-0 break-words">
                                            {resource.location}
                                        </span>
                                    </p>

                                    <p className="mb-6 mt-4 flex-1 whitespace-pre-wrap
                    break-words text-sm leading-6 text-slate-500">
                                        {resource.description}
                                    </p>

                                    <div className="flex flex-wrap items-center justify-between
                    gap-3 border-t border-[#eee8f6] pt-5">
                                        <button
                                            type="button"
                                            onClick={() => openDelete(resource)}
                                            aria-label={`Delete ${resource.name}`}
                                            className="inline-flex items-center gap-1.5
                        rounded-md py-1 text-xs text-slate-500
                        transition hover:text-rose-600"
                                        >
                                            <Trash2 size={15} />
                                            Delete
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => openEdit(resource)}
                                            aria-label={`Edit ${resource.name}`}
                                            className="inline-flex items-center gap-1.5
                        rounded-md py-1 text-sm font-semibold
                        text-[#8057cc] transition hover:text-[#55368c]"
                                        >
                                            Edit resource
                                            <ArrowUpRight size={17} />
                                        </button>
                                    </div>
                                </article>
                            ))}

                            {visibleResources.length === 0 && (
                                <div className="col-span-full rounded-3xl border
                  border-dashed border-[#e2d4f6] bg-white px-6 py-12 text-center">
                                    <span className="mx-auto mb-4 grid size-14 place-items-center
                    rounded-2xl bg-[#faf7ff] text-[#9872d8]">
                                        <Layers3 size={26} />
                                    </span>

                                    <h3 className="font-semibold text-slate-700">
                                        {myResources.length
                                            ? "No matching resources"
                                            : "Your next resource starts here"}
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        {myResources.length
                                            ? "Try another search or resource type."
                                            : "Add a space or piece of equipment to get started."}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={myResources.length ? clearFilters : openCreate}
                                        className={`${primaryButton} mt-5`}
                                    >
                                        {myResources.length ? "Clear filters" : "Add resource"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    <footer className="mt-9 text-center text-[11px] text-slate-500">
                        Sample data · Frontend only · Changes reset on refresh
                    </footer>
                </div>
            </main>

            {/* CREATE / EDIT RESOURCE */}
            {(modal?.kind === "create" || modal?.kind === "edit") && (
                <Modal
                    title={modal.kind === "edit" ? "Edit resource" : "Add resource"}
                    onClose={closeModal}
                >
                    <p className="mb-6 mt-3 text-sm leading-6 text-slate-500">
                        Give your resource a name and a few helpful details.
                        All fields are required.
                    </p>

                    <form onSubmit={handleSaveResource} className="space-y-5">
                        {FORM_FIELDS.map(({ name, label, placeholder, maxLength }) => (
                            <div key={name}>
                                <label
                                    htmlFor={`resource-${name}`}
                                    className="mb-2 block text-sm font-medium"
                                >
                                    {label}
                                </label>

                                <input
                                    id={`resource-${name}`}
                                    name={name}
                                    value={draft[name]}
                                    onChange={updateDraft}
                                    placeholder={placeholder}
                                    maxLength={maxLength}
                                    list={name === "type" ? "resource-types" : undefined}
                                    autoFocus={name === "name"}
                                    required
                                    className={inputClass}
                                />
                            </div>
                        ))}

                        <datalist id="resource-types">
                            {resourceTypes.map((type) => (
                                <option key={type} value={type} />
                            ))}
                        </datalist>

                        <div>
                            <label
                                htmlFor="resource-description"
                                className="mb-2 block text-sm font-medium"
                            >
                                Description
                            </label>

                            <textarea
                                id="resource-description"
                                name="description"
                                value={draft.description}
                                onChange={updateDraft}
                                placeholder="What should people know about this resource?"
                                rows={4}
                                maxLength={600}
                                required
                                className={`${inputClass} resize-y`}
                            />

                            <p className="mt-1.5 text-right text-xs text-slate-400">
                                {draft.description.length}/600
                            </p>
                        </div>

                        {error && (
                            <p
                                role="alert"
                                className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700"
                            >
                                {error}
                            </p>
                        )}

                        <div className="flex flex-wrap justify-end gap-3
              border-t border-[#eee8f6] pt-5">
                            <button
                                type="button"
                                onClick={closeModal}
                                className={secondaryButton}
                            >
                                Cancel
                            </button>

                            <button type="submit" className={primaryButton}>
                                {modal.kind === "edit" ? (
                                    <CheckCircle2 size={17} />
                                ) : (
                                    <Plus size={17} />
                                )}
                                {modal.kind === "edit" ? "Save changes" : "Create resource"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* DELETE CONFIRMATION */}
            {modal?.kind === "delete" && selectedResource && (
                <Modal title="Delete resource?" onClose={closeModal}>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                        This removes the resource from your list.
                        This action cannot be undone.
                    </p>

                    <div className="my-6 rounded-2xl border
            border-[#eee8f6] bg-[#faf7ff] p-4">
                        <p className="break-words font-semibold">
                            {selectedResource.name}
                        </p>

                        <p className="mt-2 flex items-start gap-1.5
              text-sm text-slate-500">
                            <MapPin size={16} className="mt-0.5 shrink-0" />
                            <span className="break-words">
                                {selectedResource.location}
                            </span>
                        </p>
                    </div>

                    {error && (
                        <p role="alert" className="mb-4 text-sm text-rose-700">
                            {error}
                        </p>
                    )}

                    <div className="flex flex-wrap justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeModal}
                            autoFocus
                            className={secondaryButton}
                        >
                            Keep resource
                        </button>

                        <button
                            type="button"
                            onClick={handleDeleteResource}
                            className="inline-flex items-center justify-center gap-2
                rounded-xl bg-rose-600 px-4 py-3 text-sm
                font-semibold text-white transition hover:bg-rose-700"
                        >
                            <Trash2 size={16} />
                            Yes, delete
                        </button>
                    </div>
                </Modal>
            )}

            {/* ADMIN PROFILE */}
            {modal?.kind === "profile" && (
                <Modal title="Your profile" onClose={closeModal}>
                    <p className="mt-3 text-sm text-slate-500">
                        Your account information and workspace role.
                    </p>

                    <div className="mt-6 flex items-center gap-4 rounded-2xl
            border border-[#eee8f6] bg-[#faf7ff] p-5">
                        <span className="grid size-16 shrink-0 place-items-center
              rounded-full bg-[#e2d4f6] text-xl font-semibold text-[#6b43b2]">
                            {initials}
                        </span>

                        <div className="min-w-0">
                            <p className="break-words text-lg font-semibold">{user.name}</p>
                            <p className="mt-1 text-xs text-[#8057cc]">{user.role}</p>
                        </div>
                    </div>

                    <dl className="mt-6 space-y-5">
                        <div>
                            <dt className="text-xs text-slate-500">Full name</dt>
                            <dd className="mt-1.5 break-words text-sm font-medium">
                                {user.name}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-xs text-slate-500">Email address</dt>
                            <dd className="mt-1.5 break-all text-sm font-medium">
                                {user.email}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-xs text-slate-500">Role</dt>
                            <dd className="mt-2">
                                <span className="inline-flex items-center gap-1.5 rounded-lg
                  bg-[#f0e8fc] px-3 py-2 text-xs font-medium text-[#6b43b2]">
                                    <ShieldCheck size={15} />
                                    {user.role}
                                </span>
                            </dd>
                        </div>
                    </dl>

                    <div className="mt-7 flex justify-between border-t border-[#eee8f6] pt-5">
                        <button
                            type="button"
                            onClick={()=> {closeModal(); handleLogout();}}
                            className={primaryButton}
                            
                        >
                            Logout
                        </button>
                        <button
                            type="button"
                            onClick={closeModal}
                            className={primaryButton}
                        >
                            Done
                        </button>
                    </div>
                </Modal>
            )}

            {/* NOTIFICATIONS */}
            {toast && (
                <div
                    role="status"
                    className="fixed bottom-5 left-1/2 z-50 flex
            w-[calc(100%_-_2rem)] max-w-md -translate-x-1/2
            items-center gap-3 rounded-2xl bg-slate-800
            px-5 py-4 text-sm text-white shadow-xl"
                >
                    <CheckCircle2 size={19} className="shrink-0 text-[#cdb5ef]" />

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