import { useState } from "react";
import { Button } from "@heroui/react";
import Navbar from '@/components/navbar/navbar';
import UserAvatar from '@/components/navbar/user-avatar';
import useAuth from '@/hooks/use_auth';
import api from '@/api/axios';

const factions = [
    {
        key: "ENL",
        label: "Enlightened",
        description: "The Enlightened believe the Shapers are guiding humanity toward a new stage of evolution.",
        color: "text-enl-foreground",
        border: "border-enl",
        bg: "bg-enl/10",
    },
    {
        key: "RES",
        label: "Resistance",
        description: "The Resistance fights to protect humanity's free will from the influence of the Shapers.",
        color: "text-res-foreground",
        border: "border-res",
        bg: "bg-res/10",
    },
] as const;

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [selected, setSelected] = useState<string | undefined>(user?.faction);
    const [hidePhoto, setHidePhoto] = useState(user?.hide_picture ?? false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const factionDirty = selected !== user?.faction;
    const photoSettingDirty = hidePhoto !== (user?.hide_picture ?? false);
    const isDirty = factionDirty || photoSettingDirty;

    const handleSave = async () => {
        if (!isDirty) return;
        setSaving(true);
        setError(null);
        try {
            const body: Record<string, unknown> = {};
            if (factionDirty && selected) body.faction = selected;
            if (photoSettingDirty) body.hide_picture = hidePhoto;
            await api.patch('/users/me', body);
            updateUser({ ...(factionDirty && selected ? { faction: selected } : {}), ...(photoSettingDirty ? { hide_picture: hidePhoto } : {}) });
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

                <div className="mb-6">
                    <p className="font-semibold mb-1">Faction</p>
                    <p className="text-foreground/60 text-sm mb-4">
                        Your faction is shown on the leaderboard.
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

                <div className="mb-6">
                    <p className="font-semibold mb-1">Privacy</p>
                    <p className="text-foreground/60 text-sm mb-4">
                        Control what others see on the leaderboard.
                    </p>
                    <button
                        onClick={() => setHidePhoto((v: boolean) => !v)}
                        className="w-full text-left rounded-lg border border-foreground/10 hover:border-foreground/25 p-4 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-sm">Hide profile picture</p>
                                <p className="text-foreground/60 text-sm mt-0.5">Show initials instead of your Telegram photo</p>
                            </div>
                            <div className={`w-10 h-6 rounded-full transition-colors shrink-0 flex items-center px-0.5 ${hidePhoto ? "bg-foreground" : "bg-foreground/20"}`}>
                                <div className={`w-5 h-5 rounded-full bg-background transition-transform ${hidePhoto ? "translate-x-4" : "translate-x-0"}`} />
                            </div>
                        </div>
                    </button>
                </div>

                {error && <p className="text-danger text-sm mb-3">{error}</p>}

                <Button
                    variant="primary"
                    isDisabled={!isDirty}
                    isPending={saving}
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
