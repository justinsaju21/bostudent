import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

export function generateId(): string {
    return Math.random().toString(36).substring(2, 11);
}

export function formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short' });
}

export function getEmbedUrl(url: string): string {
    if (!url) return '';

    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

    // Google Drive
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    if (driveMatch) return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;

    // Loom
    const loomMatch = url.match(/loom\.com\/share\/([^?]+)/);
    if (loomMatch) return `https://www.loom.com/embed/${loomMatch[1]}`;

    return url;
}

export function getLevelBadgeColor(level: string): string {
    const colors: Record<string, string> = {
        zone: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        district: 'bg-green-500/20 text-green-400 border-green-500/30',
        state: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        national: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        international: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[level] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
}

export function getIndexBadgeColor(status: string): string {
    const colors: Record<string, string> = {
        scopus: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        sci: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        ugc: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        none: 'bg-gray-800/20 text-gray-500 border-gray-800/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
}
