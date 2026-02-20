'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
    text: string;
}

export function InfoTooltip({ text }: InfoTooltipProps) {
    const [isOpen, setIsOpen] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const iconRef = useRef<HTMLButtonElement>(null);

    // Close on click outside
    useEffect(() => {
        if (!isOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node) &&
                iconRef.current && !iconRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isOpen]);

    return (
        <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: '8px' }}>
            <button
                ref={iconRef}
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen); }}
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
                style={{
                    background: 'none',
                    border: 'none',
                    padding: '2px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    color: 'var(--text-muted)',
                    opacity: 0.6,
                    transition: 'opacity 0.2s, color 0.2s',
                }}
                onFocus={() => setIsOpen(true)}
                onBlur={() => setIsOpen(false)}
                aria-label="Scoring information"
            >
                <Info size={16} />
            </button>
            {isOpen && (
                <div
                    ref={tooltipRef}
                    style={{
                        position: 'absolute',
                        bottom: 'calc(100% + 8px)',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm, 8px)',
                        padding: '10px 14px',
                        fontSize: '12px',
                        lineHeight: 1.5,
                        color: 'var(--text-secondary)',
                        whiteSpace: 'normal',
                        width: 'max-content',
                        maxWidth: '280px',
                        zIndex: 50,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                        backdropFilter: 'blur(12px)',
                        animation: 'tooltipFadeIn 0.15s ease-out',
                    }}
                >
                    {/* Arrow */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-5px',
                        left: '50%',
                        transform: 'translateX(-50%) rotate(45deg)',
                        width: '10px',
                        height: '10px',
                        background: 'var(--bg-card)',
                        borderRight: '1px solid var(--border-subtle)',
                        borderBottom: '1px solid var(--border-subtle)',
                    }} />
                    {text}
                </div>
            )}
            <style>{`
                @keyframes tooltipFadeIn {
                    from { opacity: 0; transform: translateX(-50%) translateY(4px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `}</style>
        </span>
    );
}
