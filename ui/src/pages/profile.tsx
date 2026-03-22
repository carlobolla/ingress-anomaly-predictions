import { useState } from "react";
import { Button } from "@heroui/react";
import { Navbar, UserAvatar } from "../components";
import { useAuth } from "../hooks";
import api from "../api/axios";

const factions = [
    {
        key: "ENL",
        label: "Enlightened",
        description: "The Enlightened believe the Shapers are guiding humanity toward a new stage of evolution.",
        color: "text-success",
        border: "border-success",
        bg: "bg-success/10",
    },
    {
        key: "RES",
        label: "Resistance",
        description: "The Resistance fights to protect humanity's free will from the influence of the Shapers.",
        color: "text-primary",
        border: "border-primary",
        bg: "bg-primary/10",
    },
] as const;

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [selected, setSelected] = useState<string | undefined>(user?.faction);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isDirty = selected !== user?.faction;

    const handleSave = async () => {
        if (!selected || !isDirty) return;
        setSaving(true);
        setError(null);
        try {
            await api.patch('/users/me/faction', { faction: selected });
            updateUser({ faction: selected });
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch {
            setError("Failed to save. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="my-5 container px-3 sm:px-0 mx-auto">
                <h1 className="text-2xl font-semibold mb-6">Profile</h1>

                <UserAvatar size="lg" />

                {/* Faction selection */}
                <div className="mb-6">
                    <p className="font-semibold mb-1">Faction</p>
                    <p className="text-foreground/60 text-sm mb-4">
                        Your faction is shown on the leaderboard and used to track your prediction tendencies.
                    </p>
                    <div className="space-y-3">
                        {factions.map((f) => {
                            const isSelected = selected === f.key;
                            return (
                                <button
                                    key={f.key}
                                    onClick={() => setSelected(f.key)}
                                    className={`w-full text-left rounded-lg border p-4 transition-colors ${
                                        isSelected
                                            ? `${f.border} ${f.bg}`
                                            : "border-foreground/10 hover:border-foreground/25"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className={`font-semibold ${isSelected ? f.color : ""}`}>{f.label}</span>
                                        {isSelected && (
                                            <span className={`text-xs font-mono ${f.color}`}>selected</span>
                                        )}
                                    </div>
                                    <p className="text-foreground/60 text-sm mt-1">{f.description}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {error && <p className="text-danger text-sm mb-3">{error}</p>}

                <Button
                    color="primary"
                    isDisabled={!isDirty || !selected}
                    isLoading={saving}
                    onPress={handleSave}
                >
                    {saved ? "Saved!" : "Save changes"}
                </Button>

                <div className="mt-12 pt-6 border-t border-foreground/10">
                    <p className="font-semibold mb-1">Delete account</p>
                    <p className="text-foreground/60 text-sm mb-3">
                        To have your account and prediction history removed, message{" "}
                        <a
                            href="https://t.me/carlobolla"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground underline underline-offset-2"
                        >
                            @carlobolla
                        </a>{" "}
                        on Telegram.
                    </p>
                </div>
            </div>
        </>
    );
};

export default Profile;
