import React from "react";

export default function VededLogo({ size = "md", subtitle = true, dataTestId = "veded-logo" }) {
    const scale = size === "sm" ? 0.75 : size === "lg" ? 1.35 : 1;
    return (
        <div className="flex items-center gap-3" data-testid={dataTestId} style={{ transform: `scale(${scale})`, transformOrigin: "left center" }}>
            <div className="relative">
                <svg width="38" height="38" viewBox="0 0 40 40" fill="none">
                    <path d="M6 8 L20 32 L34 8" stroke="#c3f400" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 8 L20 24 L28 8" stroke="#c3f400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
                    <circle cx="20" cy="34" r="1.6" fill="#c3f400" />
                </svg>
                <div className="absolute inset-0 rounded-full v-glow-lime pointer-events-none" />
            </div>
            <div className="leading-none">
                <div className="font-display-tight font-black text-[26px] tracking-[-0.06em]" style={{ color: "#c3f400" }}>VEDED</div>
                {subtitle && (
                    <div className="text-[9px] font-semibold tracking-[0.3em] text-neutral-400 mt-0.5">CREATIVE SUITE</div>
                )}
            </div>
        </div>
    );
}
