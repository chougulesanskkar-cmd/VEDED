import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Sparkles, Zap, Coins } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function Pricing() {
    const { user } = useAuth();
    const [plans, setPlans] = useState({ veded: [], bookstream: [], topups: [] });
    const [loading, setLoading] = useState(null);

    useEffect(() => { api.get("/plans").then((r) => setPlans(r.data)); }, []);

    const checkout = async (packageId) => {
        setLoading(packageId);
        try {
            const origin = window.location.origin;
            const { data } = await api.post("/payments/checkout", { package_id: packageId, origin_url: origin });
            if (data.checkout_url) {
                window.location.href = data.checkout_url;
            } else {
                toast.error("Could not start checkout");
            }
        } catch (e) {
            toast.error(e?.response?.data?.detail || "Checkout failed");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="space-y-10">
            <div className="text-center max-w-2xl mx-auto">
                <div className="v-chip v-chip-lime inline-flex mb-4">FLEXIBLE PLANS · CANCEL ANY TIME</div>
                <h1 className="font-display-tight font-black text-4xl lg:text-5xl">Pick a plan that ships your masterpiece.</h1>
                <p className="text-neutral-400 mt-3">All plans include the full studio suite. Upgrade for more credits, priority queues and Book Stream access.</p>
            </div>

            <Tabs defaultValue="veded" className="w-full">
                <TabsList className="mx-auto bg-[var(--v-surface-2)] border border-[var(--v-border)]">
                    <TabsTrigger value="veded" className="data-[state=active]:bg-[var(--v-lime)] data-[state=active]:text-black" data-testid="tab-veded">VEDED Creation</TabsTrigger>
                    <TabsTrigger value="bookstream" className="data-[state=active]:bg-[var(--v-lime)] data-[state=active]:text-black" data-testid="tab-bookstream">Book Stream OTT</TabsTrigger>
                    <TabsTrigger value="topups" className="data-[state=active]:bg-[var(--v-lime)] data-[state=active]:text-black" data-testid="tab-topups">Top-Up Packs</TabsTrigger>
                </TabsList>

                <TabsContent value="veded" className="mt-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {plans.veded?.map((p) => (
                            <PlanCard key={p.id} plan={p} onBuy={() => checkout(p.id)} loading={loading === p.id} owned={user?.veded_tier === p.id} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="bookstream" className="mt-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {plans.bookstream?.map((p) => (
                            <PlanCard key={p.id} plan={p} onBuy={() => checkout(p.id)} loading={loading === p.id} owned={user?.bookstream_tier === p.id} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="topups" className="mt-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {plans.topups?.map((p) => (
                            <TopUpCard key={p.id} pack={p} onBuy={() => checkout(p.id)} loading={loading === p.id} />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function PlanCard({ plan, onBuy, loading, owned }) {
    const highlight = plan.highlight;
    return (
        <div className={`v-card p-6 flex flex-col relative ${highlight ? "border-[var(--v-lime)] v-glow-lime" : ""}`} data-testid={`plan-${plan.id}`}>
            {highlight && (
                <div className="absolute -top-2.5 left-6 v-chip v-chip-lime text-[9px]">MOST POPULAR</div>
            )}
            <div className="font-display font-bold text-lg">{plan.name}</div>
            <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display-tight font-black text-4xl">${plan.price_usd}</span>
                <span className="text-xs text-neutral-500">/mo</span>
            </div>
            <ul className="mt-5 space-y-2 text-sm text-neutral-300 flex-1">
                {plan.features?.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                        <Check size={14} className="text-[var(--v-lime)] mt-0.5 shrink-0" />
                        <span>{f}</span>
                    </li>
                ))}
            </ul>
            <div className="mt-5 grid grid-cols-2 gap-2 text-[11px] text-neutral-400">
                {plan.credits?.image !== undefined && <div><span className="text-[var(--v-lime)] font-bold">{plan.credits.image}</span> images</div>}
                {plan.credits?.video !== undefined && <div><span className="text-[var(--v-lime)] font-bold">{plan.credits.video}</span> videos</div>}
                {plan.credits?.audio_chars !== undefined && <div><span className="text-[var(--v-lime)] font-bold">{(plan.credits.audio_chars/1000).toFixed(0)}k</span> audio chars</div>}
                {plan.credits?.dubbing !== undefined && plan.credits.dubbing > 0 && <div><span className="text-[var(--v-lime)] font-bold">{plan.credits.dubbing}</span> dubs</div>}
            </div>
            <button
                data-testid={`buy-${plan.id}`}
                disabled={loading || owned || plan.price_usd === 0}
                onClick={onBuy}
                className={`v-btn w-full mt-6 disabled:opacity-60 ${highlight ? "v-btn-lime" : "v-btn-ghost"}`}
            >
                {owned ? "Current plan" : plan.price_usd === 0 ? "Included free" : loading ? "Loading…" : (
                    <>
                        <Sparkles size={14} /> Upgrade
                    </>
                )}
            </button>
        </div>
    );
}

function TopUpCard({ pack, onBuy, loading }) {
    const perks = [];
    if (pack.image) perks.push(`+${pack.image} images`);
    if (pack.video) perks.push(`+${pack.video} videos`);
    if (pack.dubbing) perks.push(`+${pack.dubbing} dub credits`);
    if (pack.cash_credit) perks.push(`+$${pack.cash_credit} API credit`);
    return (
        <div className="v-card p-6" data-testid={`topup-${pack.id}`}>
            <div className="flex items-center gap-2">
                <Coins size={16} className="text-[var(--v-lime)]" />
                <div className="font-display font-bold text-lg">{pack.name}</div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display-tight font-black text-3xl">${pack.price_usd}</span>
                <span className="text-xs text-neutral-500">one-time</span>
            </div>
            <ul className="mt-4 space-y-1.5 text-sm text-neutral-300">
                {perks.map((p) => (
                    <li key={p} className="flex items-center gap-2"><Zap size={12} className="text-[var(--v-lime)]" />{p}</li>
                ))}
            </ul>
            <button data-testid={`buy-${pack.id}`} disabled={loading} onClick={onBuy} className="v-btn v-btn-lime w-full mt-5 disabled:opacity-60">
                {loading ? "Loading…" : "Buy pack"}
            </button>
        </div>
    );
}
