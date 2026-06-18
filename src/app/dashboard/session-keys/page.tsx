"use client";

import { useWallet } from "@/providers/wallet-provider";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  EyeOff,
  Eye,
  Key,
  Loader2,
  Plus,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface SessionKeyData {
  _id: string;
  name: string;
  publicKey: string;
  status: "pending" | "active" | "expired" | "revoked";
  permissions: {
    canTrade: boolean;
    canSwap: boolean;
    canStake: boolean;
    canTransfer: boolean;
  };
  authorizationMessage?: string;
  expiresAt?: string;
  createdAt: string;
}

function uint8ToBase64(arr: Uint8Array): string {
  return btoa(String.fromCharCode(...Array.from(arr)));
}

function truncatePk(s: string, front = 14, back = 10) {
  if (s.length <= front + back + 3) return s;
  return `${s.slice(0, front)}…${s.slice(-back)}`;
}

function StatusBadge({ status }: { status: SessionKeyData["status"] }) {
  const cfg = {
    pending: {
      cls: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      label: "Pending Auth",
    },
    active: {
      cls: "bg-green-500/20 text-green-400 border-green-500/30",
      label: "Active",
    },
    expired: {
      cls: "bg-slate-500/20 text-slate-400 border-slate-500/30",
      label: "Expired",
    },
    revoked: {
      cls: "bg-red-500/20 text-red-400 border-red-500/30",
      label: "Revoked",
    },
  }[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.cls}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  );
}

export default function SessionKeysPage() {
  const { address, walletType, connected } = useWallet();
  const [keys, setKeys] = useState<SessionKeyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [hideRevoked, setHideRevoked] = useState(false);

  // SOL balances for active keys: publicKey → balance
  const [balances, setBalances] = useState<Record<string, number | null>>({});

  // Generate form state
  const [formName, setFormName] = useState("Trading Session");
  const [formCanTrade, setFormCanTrade] = useState(true);
  const [formCanSwap, setFormCanSwap] = useState(true);
  const [formExpiry, setFormExpiry] = useState<number | null>(null); // null = unlimited
  const [generating, setGenerating] = useState(false);
  const [formError, setFormError] = useState("");

  // Per-key action loading: maps _id → action string
  const [actionLoading, setActionLoading] = useState<Record<string, string>>(
    {},
  );
  const [fundingKeyId, setFundingKeyId] = useState<string | null>(null);
  const [fundAmount, setFundAmount] = useState("0.01");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const notify = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const loadKeys = useCallback(async () => {
    try {
      const res = await fetch("/api/session-keys");
      if (res.ok) {
        const data = await res.json();
        setKeys(data.sessionKeys ?? []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  // Listen for tour actions (e.g., auto-open form)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ action: string }>).detail;
      if (detail.action === "open-session-key-form") {
        setShowForm(true);
      }
    };
    window.addEventListener("tour-step-action", handler);
    return () => window.removeEventListener("tour-step-action", handler);
  }, []);

  // Fetch SOL balances for active keys
  useEffect(() => {
    const activeKeys = keys.filter((k) => k.status === "active");
    if (activeKeys.length === 0) return;

    activeKeys.forEach(async (key) => {
      if (balances[key.publicKey] !== undefined) return;
      try {
        const res = await fetch(`/api/wallet/balance?address=${key.publicKey}`);
        if (res.ok) {
          const data = await res.json();
          setBalances((prev) => ({ ...prev, [key.publicKey]: data.balance }));
        }
      } catch {
        setBalances((prev) => ({ ...prev, [key.publicKey]: null }));
      }
    });
  }, [keys]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredKeys = hideRevoked
    ? keys.filter((k) => k.status !== "revoked")
    : keys;
  const revokedCount = keys.filter((k) => k.status === "revoked").length;

  const handleGenerate = async () => {
    if (!address) {
      notify("Connect your wallet first", false);
      return;
    }
    setGenerating(true);
    setFormError("");
    try {
      const res = await fetch("/api/session-keys/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          name: formName.trim() || "Trading Session",
          permissions: { canTrade: formCanTrade, canSwap: formCanSwap },
          expirationHours: formExpiry,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setShowForm(false);
      setFormName("Trading Session");
      notify("Session key generated — authorize it to activate.");
      await loadKeys();
      // Notify tour
      window.dispatchEvent(new CustomEvent("tour:key-generated"));
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to generate");
    } finally {
      setGenerating(false);
    }
  };

  const getProvider = () => {
    const w = window as unknown as Record<string, unknown>;
    let raw: unknown;
    if (walletType === "phantom") raw = w.solana;
    else if (walletType === "solflare") raw = w.solflare;
    else if (walletType === "backpack") raw = w.backpack;
    else raw = w.solana;
    if (!raw)
      throw new Error(`${walletType ?? "Wallet"} not found. Please reconnect.`);
    return raw as {
      signMessage: (
        m: Uint8Array,
        enc?: string,
      ) => Promise<{ signature: Uint8Array }>;
      signAndSendTransaction: (
        tx: Transaction,
      ) => Promise<{ signature: string }>;
    };
  };

  const handleAuthorize = async (key: SessionKeyData) => {
    if (!address || !key.authorizationMessage) return;
    setActionLoading((p) => ({ ...p, [key._id]: "authorizing" }));
    try {
      const provider = getProvider();
      const encoded = new TextEncoder().encode(key.authorizationMessage);
      const { signature } = await provider.signMessage(encoded, "utf8");
      const sigB64 = uint8ToBase64(signature);

      const res = await fetch("/api/session-keys/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionKeyId: key._id,
          signature: sigB64,
          walletAddress: address,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authorization failed");
      notify("Session key is now active!");
      await loadKeys();
      // Notify tour
      window.dispatchEvent(new CustomEvent("tour:key-authorized"));
    } catch (e) {
      notify(e instanceof Error ? e.message : "Authorization failed", false);
    } finally {
      setActionLoading((p) => ({ ...p, [key._id]: "" }));
    }
  };

  const handleFund = async (key: SessionKeyData) => {
    if (!address) return;
    const amt = parseFloat(fundAmount);
    if (isNaN(amt) || amt <= 0) {
      notify("Enter a valid SOL amount", false);
      return;
    }
    setActionLoading((p) => ({ ...p, [key._id]: "funding" }));
    try {
      const provider = getProvider();
      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL ??
          "https://rpc.shyft.to/?api_key=7qhRMpY3b2gYksci",
        "confirmed",
      );
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(address),
          toPubkey: new PublicKey(key.publicKey),
          lamports: Math.floor(amt * LAMPORTS_PER_SOL),
        }),
      );
      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = new PublicKey(address);

      const { signature } = await provider.signAndSendTransaction(tx);
      notify(`Sent ${amt} SOL! Tx: ${signature.slice(0, 12)}…`);
      setFundingKeyId(null);
      setFundAmount("0.01");
      // Notify tour
      window.dispatchEvent(new CustomEvent("tour:key-funded"));
    } catch (e) {
      notify(e instanceof Error ? e.message : "Transfer failed", false);
    } finally {
      setActionLoading((p) => ({ ...p, [key._id]: "" }));
    }
  };

  const handleRevoke = async (key: SessionKeyData) => {
    setActionLoading((p) => ({ ...p, [key._id]: "revoking" }));
    try {
      const res = await fetch(`/api/session-keys/${key._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Revoke failed");

      const parts: string[] = ["Session key revoked."];
      if (data.swapSignatures?.length)
        parts.push(`Sold ${data.swapSignatures.length} token(s).`);
      if (data.closeSignatures?.length)
        parts.push(`Closed ${data.closeSignatures.length} account(s).`);
      if (data.solDrainSignature) parts.push("SOL returned to wallet.");
      if (data.drainWarning) parts.push(`Warning: ${data.drainWarning}`);

      notify(parts.join(" "), !data.drainWarning);
      await loadKeys();
      // Notify tour
      window.dispatchEvent(new CustomEvent("tour:key-revoked"));
    } catch (e) {
      notify(e instanceof Error ? e.message : "Failed to revoke key", false);
    } finally {
      setActionLoading((p) => ({ ...p, [key._id]: "" }));
    }
  };

  const copyKey = (publicKey: string) => {
    navigator.clipboard.writeText(publicKey);
    setCopiedKey(publicKey);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isActionable = (status: SessionKeyData["status"]) =>
    status === "active" || status === "pending";

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-xl text-sm font-bold shadow-xl border backdrop-blur-sm ${
              toast.ok
                ? "bg-green-500/20 border-green-500/30 text-green-300"
                : "bg-red-500/20 border-red-500/30 text-red-300"
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
            Session <span className="text-primary">Keys</span>
          </h1>
          <p className="text-slate-400 max-w-xl">
            Generate session keypairs that let the trading bot execute swaps on
            your behalf. Fund them with SOL so they can pay for transaction
            fees.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {revokedCount > 0 && (
            <button
              onClick={() => setHideRevoked((v) => !v)}
              data-tour="hide-revoked"
              className={`px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border ${
                hideRevoked
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              {hideRevoked ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
              {hideRevoked ? "Show Revoked" : "Hide Revoked"}
              <span className="text-xs opacity-60">({revokedCount})</span>
            </button>
          )}
          <button
            onClick={() => {
              setShowForm((v) => !v);
              setFormError("");
            }}
            data-tour="new-session-key"
            className="px-6 py-3 rounded-xl bg-primary text-background-dark text-sm font-black transition-all hover:opacity-90 flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            {showForm ? (
              <X className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {showForm ? "Cancel" : "New Session Key"}
          </button>
        </div>
      </motion.div>

      {/* Generate Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <div
              className="glassmorphism rounded-2xl p-8 border-l-4 border-l-primary"
              data-tour="session-key-form"
            >
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                Generate New Session Key
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: name + expiry */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">
                      Key Name
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Trading Session"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">
                      Expiration
                    </label>
                    <select
                      value={formExpiry ?? ""}
                      onChange={(e) =>
                        setFormExpiry(
                          e.target.value === ""
                            ? null
                            : parseInt(e.target.value),
                        )
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none [&>option]:bg-slate-900 [&>option]:text-white"
                    >
                      <option value="">Unlimited</option>
                      <option value="24">24 hours</option>
                      <option value="168">7 days</option>
                      <option value="720">30 days</option>
                      <option value="8760">1 year</option>
                    </select>
                  </div>
                </div>

                {/* Right: permissions */}
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-primary uppercase tracking-widest">
                    Permissions
                  </label>
                  {[
                    {
                      key: "canTrade",
                      label: "Can Trade Assets",
                      desc: "Execute market orders",
                      val: formCanTrade,
                      set: setFormCanTrade,
                    },
                    {
                      key: "canSwap",
                      label: "Can Swap Tokens",
                      desc: "Use DEX aggregators (Jupiter)",
                      val: formCanSwap,
                      set: setFormCanSwap,
                    },
                  ].map((p) => (
                    <div
                      key={p.key}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5"
                    >
                      <div>
                        <p className="text-sm font-bold text-white">
                          {p.label}
                        </p>
                        <p className="text-xs text-slate-500">{p.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={p.val}
                          onChange={(e) => p.set(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {formError && (
                <p className="mt-4 text-sm text-red-400 font-mono">
                  {formError}
                </p>
              )}

              <div className="mt-6 pt-5 border-t border-white/10 flex justify-end">
                <button
                  onClick={handleGenerate}
                  disabled={generating || !connected}
                  className="px-8 py-3 rounded-xl bg-primary text-background-dark font-black text-sm transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Key className="w-4 h-4" />
                  )}
                  {generating ? "Generating…" : "Generate Key"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keys list */}
      <div data-tour="session-keys-area">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : keys.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glassmorphism rounded-2xl p-16 flex flex-col items-center text-center border border-white/5"
          >
            <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
              <Key className="w-9 h-9 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              No session keys yet
            </h3>
            <p className="text-slate-400 text-sm mb-6 max-w-sm">
              Generate your first session key to let the trading bot execute
              swaps on your behalf.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 rounded-xl bg-primary text-background-dark text-sm font-black hover:opacity-90 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Generate First Key
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4" data-tour="session-keys-list">
            {filteredKeys.map((key, i) => (
              <motion.div
                key={key._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glassmorphism rounded-2xl border border-white/5 overflow-hidden"
              >
                <div className="p-6 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-bold text-white text-base">
                        {key.name}
                      </span>
                      <StatusBadge status={key.status} />
                      {key.status === "active" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-primary/10 text-primary border-primary/20">
                          <Wallet className="w-3 h-3" />
                          {balances[key.publicKey] !== undefined
                            ? balances[key.publicKey] !== null
                              ? `${balances[key.publicKey]!.toFixed(4)} SOL`
                              : "— SOL"
                            : "Loading…"}
                        </span>
                      )}
                    </div>

                    {/* Public key row */}
                    <div className="flex items-center gap-2 mb-3">
                      <code className="text-xs font-mono text-slate-300 bg-white/5 px-3 py-1.5 rounded-lg">
                        {truncatePk(key.publicKey)}
                      </code>
                      <button
                        onClick={() => copyKey(key.publicKey)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-primary transition-colors"
                        title="Copy public key"
                      >
                        {copiedKey === key.publicKey ? (
                          <Check className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <a
                        href={`https://solscan.io/account/${key.publicKey}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-primary transition-colors"
                        title="View on Solscan"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* Permissions + expiry */}
                    <div className="flex items-center flex-wrap gap-2">
                      {key.permissions.canTrade && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary/15 text-primary border border-primary/20">
                          Trade
                        </span>
                      )}
                      {key.permissions.canSwap && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary/15 text-primary border border-primary/20">
                          Swap
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500 ml-1">
                        {key.expiresAt
                          ? `Expires ${new Date(
                              key.expiresAt,
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}`
                          : "Never expires"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {isActionable(key.status) && (
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {key.status === "pending" && (
                        <button
                          onClick={() => handleAuthorize(key)}
                          disabled={!!actionLoading[key._id] || !connected}
                          {...(i === 0 ? { "data-tour": "key-authorize" } : {})}
                          className="px-4 py-2 rounded-xl bg-primary text-background-dark text-xs font-black transition-all hover:opacity-90 disabled:opacity-40 flex items-center gap-1.5"
                        >
                          {actionLoading[key._id] === "authorizing" ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <ArrowRight className="w-3.5 h-3.5" />
                          )}
                          Authorize
                        </button>
                      )}
                      {key.status === "active" && (
                        <button
                          onClick={() => {
                            setFundingKeyId(
                              fundingKeyId === key._id ? null : key._id,
                            );
                            setFundAmount("0.01");
                          }}
                          disabled={!!actionLoading[key._id] || !connected}
                          {...(i === 0 ? { "data-tour": "key-fund" } : {})}
                          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5 border border-white/10"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          Fund
                        </button>
                      )}
                      <button
                        onClick={() => handleRevoke(key)}
                        disabled={!!actionLoading[key._id]}
                        {...(i === 0 ? { "data-tour": "key-revoke" } : {})}
                        className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5 border border-red-500/20"
                      >
                        {actionLoading[key._id] === "revoking" ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        Revoke
                      </button>
                    </div>
                  )}
                </div>

                {/* Fund inline panel */}
                <AnimatePresence>
                  {fundingKeyId === key._id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="px-6 pb-6 border-t border-white/5 pt-5"
                        {...(i === 0 ? { "data-tour": "key-fund-panel" } : {})}
                      >
                        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
                          Fund Session Key
                        </p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="relative">
                            <input
                              type="text"
                              value={fundAmount}
                              onChange={(e) => {
                                if (/^\d*\.?\d*$/.test(e.target.value))
                                  setFundAmount(e.target.value);
                              }}
                              placeholder="0.01"
                              className="w-36 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none pr-12"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-mono">
                              SOL
                            </span>
                          </div>
                          <button
                            onClick={() => handleFund(key)}
                            disabled={!!actionLoading[key._id]}
                            className="px-5 py-2.5 rounded-xl bg-primary text-background-dark text-xs font-black transition-all hover:opacity-90 disabled:opacity-40 flex items-center gap-1.5"
                          >
                            {actionLoading[key._id] === "funding" ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Wallet className="w-3.5 h-3.5" />
                            )}
                            Send SOL
                          </button>
                          <button
                            onClick={() => setFundingKeyId(null)}
                            className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="mt-2 text-[11px] text-slate-500">
                          SOL is sent from your connected wallet to this session
                          key address to cover transaction fees.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
