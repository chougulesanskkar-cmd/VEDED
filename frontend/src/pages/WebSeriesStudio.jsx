import React, { useEffect, useState } from "react";
import GenerationStudio from "@/components/GenerationStudio";
import { api } from "@/lib/api";
import { Monitor } from "lucide-react";

const STYLES = [
    { id: "sci-fi-epic", label: "Sci-Fi Epic", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600" },
    { id: "dark-fantasy", label: "Dark Fantasy", image: "https://images.unsplash.com/photo-1519638399535-1b036603ac77?w=600" },
    { id: "slice-of-life", label: "Slice of Life", image: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=600" },
];
const RATIOS = [
    { id: "16:9", label: "16:9" },
    { id: "21:9", label: "21:9" },
];

export default function WebSeriesStudio() {
    const [creations, setCreations] = useState([]);
    useEffect(() => { api.get("/veded/creations").then((r) => setCreations((r.data.items || []).filter(c => c.type === "video"))); }, []);
    const onCreate = (c) => setCreations([c, ...creations]);
    const onDelete = async (id) => { await api.delete(`/veded/creations/${id}`); setCreations(creations.filter(c => c.id !== id)); };
    return (
        <GenerationStudio
            kind="video"
            title="Web Series"
            subtitle="Episode planner + cast bibles for character consistency across a season."
            placeholder="Describe your episode… e.g., 'Ep 2: The Archivist enters the neon vault. Reveal the missing codex.'"
            stylePresets={STYLES}
            aspectRatios={RATIOS}
            creations={creations}
            onCreate={onCreate}
            onDelete={onDelete}
            accentIcon={Monitor}
            testIdPrefix="webseries"
        />
    );
}
