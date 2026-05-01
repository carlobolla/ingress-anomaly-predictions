const styles: Record<string, { color: string; bg: string }> = {
    ENL: { color: 'text-enl-foreground', bg: 'bg-enl/30' },
    RES: { color: 'text-res-foreground', bg: 'bg-res/30' },
};

interface Props {
    faction: string | null | undefined;
    className?: string;
}

const FactionBadge = ({ faction, className = '' }: Props) => {
    if (!faction) return null;
    const style = styles[faction];
    if (!style) return null;
    return (
        <span className={`shrink-0 text-xs font-mono px-1.5 py-0.5 rounded ${style.color} ${style.bg} ${className}`}>
            {faction}
        </span>
    );
};

export default FactionBadge;
