export function formatDuration(minutes: number): string {
    if (!minutes) return "0 mins";

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}${mins > 0 ? ` ${mins} min${mins > 1 ? 's' : ''}` : ''}`;
    }

    return `${mins} min${mins > 1 ? 's' : ''}`;
}

export function formatRelativeDate(dateString: string | Date): string {
    const date = new Date(dateString);
    const now = new Date();

    // Reset time part for date comparison
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const n = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffTime = n.getTime() - d.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return "Today";
    } else if (diffDays === 1) {
        return "Yesterday";
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
}
