import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SearchableSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder?: string;
    error?: string;
    onBlur?: () => void;
}

export function SearchableSelect({ value, onChange, options, placeholder, error, onBlur }: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                if (onBlur) onBlur();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onBlur]);

    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes((value || '').toLowerCase())
    );

    const handleSelect = (option: string) => {
        onChange(option);
        setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue);
        setIsOpen(true);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="relative">
                <input
                    type="text"
                    className={`form-input w-full pr-10 ${error ? 'border-red-500' : ''}`}
                    placeholder={placeholder}
                    value={value || ''}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                />
                <div
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <ChevronDown size={16} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <div
                                key={option}
                                className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm flex items-center justify-between"
                                onClick={() => handleSelect(option)}
                            >
                                <span>{option}</span>
                                {value === option && <Check size={14} className="text-green-500" />}
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-2 text-sm text-gray-500">
                            No matching options
                        </div>
                    )}

                    {/* Explicit "Other" option as requested */}
                    <div
                        className="px-4 py-2 border-t border-gray-100 bg-gray-50 hover:bg-gray-100 cursor-pointer text-sm text-blue-600 font-medium"
                        onClick={() => {
                            // Focus input to allow typing custom value
                            setIsOpen(false);
                            // We don't change value, just close so user can type
                        }}
                    >
                        + Other (Type manually)
                    </div>
                </div>
            )}
            {error && <p className="form-error">{error}</p>}
        </div>
    );
}
