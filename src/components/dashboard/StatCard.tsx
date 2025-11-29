// components/dashboard/StatCard.tsx

import React from 'react';
import { useTheme } from "@/components/themes/ThemeContext";

// Define the structure for the icon prop
interface StatCardProps {
    title: string;
    value: React.ReactNode;
    colorClass: string;
    icon: React.FC<React.SVGProps<SVGSVGElement> & { size?: number }>;
    // Optional prop for the progress bar (used only for Health Rate)
    showProgressBar?: boolean;
    // ⭐ NEW PROP: Raw percentage value as a number (0-100)
    progressBarValue?: number;
}

const StatCard: React.FC<StatCardProps> = ({ 
    title, 
    value, 
    colorClass, 
    icon: Icon, 
    showProgressBar = false ,
    progressBarValue
}) => {
    // Determine background color for the icon ring using string manipulation
    // e.g., 'text-indigo-600' becomes 'bg-indigo-500/20'
    const iconBgClass = colorClass
        .replace('text-', 'bg-')
        .replace('-400', '-500/20')
        .replace('-600', '-500/20');

    const { theme } = useTheme();
    const cardBg = theme === "dark" ? "bg-slate-900/60 border-white/10 shadow-2xl" : "bg-white/80 border-slate-200 shadow-sm";
        
    // Determine progress bar fill color
    const progressFillClass = colorClass.replace('text-', 'bg-');

    return (
        <div className={`backdrop-blur-xl border ${cardBg} rounded-2xl p-6 shadow-sm dark:shadow-xl transition-colors h-full flex flex-col justify-between`}>
            <div className="flex items-start justify-between">
                <div>
                    <h3 className={`${theme === "dark" ? "text-slate-400" : "text-slate-500"} text-xs uppercase font-bold tracking-wider`}>{title}</h3>
                    <p className={`text-3xl md:text-4xl font-bold mt-2 ${colorClass}`}>
                        {value}
                    </p>
                </div>
                <div className={`p-3 rounded-xl ${iconBgClass}`}>
                    <Icon className={`${colorClass}`} size={24} />
                </div>
            </div>
            
            {/* Conditional Progress Bar */}
            {/* Conditional Progress Bar */}
            {showProgressBar && (
                <div className={`mt-4 w-full ${theme === "dark" ? "bg-slate-700" : "bg-slate-100"} h-2 rounded-full overflow-hidden`}>
                    {/* Check if the numeric value is provided */}
                    {typeof progressBarValue === 'number' && (
                        <div 
                            className={`${theme === "dark" ? "bg-indigo-600" : "bg-indigo-400"} h-full rounded-full`} 
                            // Set the width using the dedicated numeric prop
                            style={{ width: `${progressBarValue}%` }} 
                        ></div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StatCard;