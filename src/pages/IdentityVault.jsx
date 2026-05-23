/**
 * /vault — Seiful de Identitate
 * Full identity vault with tabbed sections for personal data, ID, address, signature, documents, privacy.
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Shield, User, CreditCard, MapPin, PenLine, FolderOpen,
  Lock, Zap, Loader2, CheckCircle2, Eye, EyeOff, Save, AlertTriangle, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { encryptField, decryptField } from '@/lib/security/encryption';
import { validateUploadedFile } from '@/lib/security/fileValidation';
import { checkRateLimit } from '@/lib/security/rateLimiter';
import { audit } from '@/lib/security/auditLogger';

const TABS = [
  { id: 'personal', label: 'Date personale', icon: User },
  { id: 'identity', label: 'Act de identitate', icon: CreditCard },
  { id: 'address', label: 'Adresă', icon: MapPin },
  { id: 'signature', label: 'Semnătură', icon: PenLine },
  { id: 'documents', label: 'Documente încărcate', icon: FolderOpen },
  { id: 'privacy', label: 'Confidențialitate', icon: Lock },
];

function Field({ label, value, onChange, type = 'text', placeholder = '', masked = false }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      <div className="relative">
        <Input
          type={masked && !show ? 'password' : type}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-white/[0.04] border-white/10 text-white placeholder:text-slate-600 rounded-xl pr-9"
        />
        {masked && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}

function maskCNP(cnp) {
  if (!cnp || cnp.length < 7) return cnp;
  return cnp.slice(0, 4) + '******' + cnp.slice(-3);
}

export default function IdentityVault() {
  const [tab, setTab] = useState('personal');
  const [saveMsg, setSaveMsg] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const { data: profiles = [], isLoading: loadingProfile } = useQuery({
    queryKey: ['vault-profile'],
    queryFn: () => base44.entities.UserPrivateProfile.filter({ user_id: user?.email }, '-created_date', 1),
    enabled: !!user?.email,
  });

  const { data: secrets = [], isLoading: loadingSecret } = useQuery({
    queryKey: ['vault-secret'],
    queryFn: () => base44.entities.IdentitySecret.filter({ user_id: user?.email }, '-created_date', 1),
    enabled: !!user?.email,
  });

  const { data: consents = [] } = useQuery({
    queryKey: ['vault-consents'],
    queryFn: () => base44.entities.ConsentLog.filter({ user_id: user?.email }, '-created_date', 20),
    enabled: !!user?.email,
  });

  const profile = profiles[0] || {};
  const secret = secrets[0] || {};

  const [profileData, setProfileData] = useState({});
  const [secretData, setSecretData] = useState({});

  // Sync fetched data into local state — decrypt sensitive fields on load
  React.useEffect(() => { if (profile.id) setProfileData(profile); }, [profile.id]);
  React.useEffect(() => {
    if (secret.id && user?.email) {
      Promise.all([
        decryptField(secret.cnp_raw, user.email),
        decryptField(secret.id_series, user.email),
        decryptField(secret.id_number, user.email),
      ]).then(([cnp_raw, id_series, id_number]) => {
        setSecretData({ ...secret, cnp_raw, id_series, id_number });
      }).catch(() => setSecretData(secret));
    }
  }, [secret.id, user?.email]);

  const saveProfile = useMutation({
    mutationFn: async (data) => {
      const payload = { ...data, user_id: user.email, last_verified_at: new Date().toISOString() };
      return profile.id
        ? base44.entities.UserPrivateProfile.update(profile.id, payload)
        : base44.entities.UserPrivateProfile.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault-profile'] });
      setSaveMsg('Salvat în Seif ✓');
      setTimeout(() => setSaveMsg(''), 2500);
    },
  });

  const saveSecret = useMutation({
    mutationFn: async (data) => {
      const rl = checkRateLimit('file_upload', user.email);
      if (!rl.allowed) throw new Error(rl.message);

      const cnp = data.cnp_raw || '';
      const [enc_cnp, enc_series, enc_number] = await Promise.all([
        encryptField(data.cnp_raw || '', user.email),
        encryptField(data.id_series || '', user.email),
        encryptField(data.id_number || '', user.email),
      ]);
      const payload = {
        ...data,
        user_id: user.email,
        cnp_raw: enc_cnp,
        cnp_masked: cnp ? maskCNP(cnp) : '',
        id_series: enc_series,
        id_number: enc_number,
        verified_by_user_at: new Date().toISOString(),
      };
      await audit.vaultSave(user.email, 'IdentitySecret');
      return secret.id
        ? base44.entities.IdentitySecret.update(secret.id, payload)
        : base44.entities.IdentitySecret.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault-secret'] });
      setSaveMsg('Salvat în Seif ✓');
      setTimeout(() => setSaveMsg(''), 2500);
    },
  });

  const handleDeleteData = async () => {
    await audit.vaultDeleted(user?.email || 'anon');
    if (profile.id) await base44.entities.UserPrivateProfile.delete(profile.id);
    if (secret.id) await base44.entities.IdentitySecret.delete(secret.id);
    queryClient.invalidateQueries({ queryKey: ['vault-profile', 'vault-secret'] });
    setShowDeleteConfirm(false);
    setSaveMsg('Date șterse ✓');
  };

  const isLoading = loadingProfile || loadingSecret || !user;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  const completedFields = [
    profileData.first_name, profileData.last_name, profileData.phone,
    secretData.cnp_raw, secretData.id_series, secretData.id_number,
    profileData.city, profileData.county,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background text-foreground font-inter">
      {/* Header */}
      <div className="border-b border-white/5 px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-bold text-white">NoQueue AI</span>
        </Link>
        <nav className="flex items-center gap-3 text-xs text-slate-400">
          <Link to="/profile" className="hover:text-white transition-colors">Profil</Link>
          <Link to="/cases" className="hover:text-white transition-colors">Dosare</Link>
        </nav>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-white">Seiful de Identitate</h1>
          </div>
          <p className="text-xs text-slate-400">
            Datele oficiale salvate o singură dată, folosite la completarea automată a documentelor. CNP-ul și datele sensibile nu apar niciodată în liste publice.
          </p>
          {/* Completeness bar */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.round((completedFields / 8) * 100)}%` }} />
            </div>
            <span className="text-xs text-slate-400">{Math.round((completedFields / 8) * 100)}% completat</span>
          </div>
        </motion.div>

        {/* Save confirmation */}
        <AnimatePresence>
          {saveMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-success/10 border border-success/25 text-success text-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              {saveMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white/[0.03] border border-white/8 rounded-2xl p-1 overflow-x-auto">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  tab === t.id ? 'bg-primary text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3 h-3" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {tab === 'personal' && (
            <motion.div key="personal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="glass-card rounded-2xl p-5 border border-white/8 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Prenume" value={profileData.first_name} onChange={v => setProfileData(p => ({ ...p, first_name: v }))} placeholder="Ion" />
                  <Field label="Nume de familie" value={profileData.last_name} onChange={v => setProfileData(p => ({ ...p, last_name: v }))} placeholder="Popescu" />
                </div>
                <Field label="Telefon" value={profileData.phone} onChange={v => setProfileData(p => ({ ...p, phone: v }))} placeholder="+40 7XX XXX XXX" />
                <Field label="Email de contact" value={profileData.email} onChange={v => setProfileData(p => ({ ...p, email: v }))} placeholder="email@exemplu.ro" />
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Stare civilă</label>
                  <select
                    value={profileData.marital_status || ''}
                    onChange={e => setProfileData(p => ({ ...p, marital_status: e.target.value }))}
                    className="w-full bg-white/[0.04] border border-white/10 text-white rounded-xl px-3 py-2 text-sm"
                  >
                    <option value="">Selectează</option>
                    <option value="single">Necăsătorit/ă</option>
                    <option value="married">Căsătorit/ă</option>
                    <option value="divorced">Divorțat/ă</option>
                    <option value="widowed">Văduv/ă</option>
                  </select>
                </div>
                <Button onClick={() => saveProfile.mutate(profileData)} disabled={saveProfile.isPending} className="w-full rounded-xl">
                  {saveProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvează în Seif
                </Button>
              </div>
            </motion.div>
          )}

          {tab === 'identity' && (
            <motion.div key="identity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="glass-card rounded-2xl p-5 border border-white/8 space-y-4">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-warning/8 border border-warning/20">
                  <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                  <p className="text-xs text-slate-300">Verifică atent datele înainte de export. Câmpurile sunt mascate în UI.</p>
                </div>
                <Field
                  label="CNP (cod numeric personal)"
                  value={secretData.cnp_raw}
                  onChange={v => setSecretData(s => ({ ...s, cnp_raw: v }))}
                  placeholder="XXXXXXXXXXXXX"
                  masked
                />
                {secretData.cnp_raw && (
                  <p className="text-xs text-slate-500">Afișat ca: {maskCNP(secretData.cnp_raw)}</p>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Serie act" value={secretData.id_series} onChange={v => setSecretData(s => ({ ...s, id_series: v }))} placeholder="XX" masked />
                  <Field label="Număr act" value={secretData.id_number} onChange={v => setSecretData(s => ({ ...s, id_number: v }))} placeholder="XXXXXX" masked />
                </div>
                <Field label="Data nașterii" value={secretData.birth_date} onChange={v => setSecretData(s => ({ ...s, birth_date: v }))} type="date" />
                <Field label="Loc de naștere" value={profileData.birth_place} onChange={v => setProfileData(p => ({ ...p, birth_place: v }))} placeholder="Cluj-Napoca" />
                <Button onClick={() => saveSecret.mutate(secretData)} disabled={saveSecret.isPending} className="w-full rounded-xl">
                  {saveSecret.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvează în Seif
                </Button>
              </div>
            </motion.div>
          )}

          {tab === 'address' && (
            <motion.div key="address" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="glass-card rounded-2xl p-5 border border-white/8 space-y-4">
                <Field label="Adresă (stradă, număr)" value={profileData.address_line_1} onChange={v => setProfileData(p => ({ ...p, address_line_1: v }))} placeholder="Str. Exemplu nr. 1" />
                <Field label="Detalii suplimentare (bloc, apartament)" value={profileData.address_line_2} onChange={v => setProfileData(p => ({ ...p, address_line_2: v }))} placeholder="Bl. A, Ap. 10" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Localitate" value={profileData.city} onChange={v => setProfileData(p => ({ ...p, city: v }))} placeholder="Cluj-Napoca" />
                  <Field label="Județ" value={profileData.county} onChange={v => setProfileData(p => ({ ...p, county: v }))} placeholder="Cluj" />
                </div>
                <Field label="Cod poștal" value={profileData.postal_code} onChange={v => setProfileData(p => ({ ...p, postal_code: v }))} placeholder="400000" />
                <Button onClick={() => saveProfile.mutate(profileData)} disabled={saveProfile.isPending} className="w-full rounded-xl">
                  {saveProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvează în Seif
                </Button>
              </div>
            </motion.div>
          )}

          {tab === 'signature' && (
            <motion.div key="signature" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="glass-card rounded-2xl p-5 border border-white/8 space-y-4">
                <p className="text-sm text-slate-400">Încarcă o imagine cu semnătura ta pentru a fi inclusă în documentele generate.</p>
                {secretData.signature_file_url && (
                  <div className="rounded-xl border border-white/10 p-3 bg-white/[0.02]">
                    <p className="text-xs text-slate-400 mb-2">Previzualizare semnătură</p>
                    <img src={secretData.signature_file_url} alt="Semnătură" className="max-h-20 object-contain" />
                  </div>
                )}
                <label className="block">
                  <span className="text-xs text-slate-400">Upload semnătură (PNG/JPG)</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="mt-1 block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const validation = validateUploadedFile(file);
                      if (!validation.valid) { await audit.fileRejected(user?.email || 'anon', validation.error); alert(validation.error); return; }
                      const rl = checkRateLimit('file_upload', user?.email || 'anon');
                      if (!rl.allowed) { alert(rl.message); return; }
                      const { file_url } = await base44.integrations.Core.UploadFile({ file });
                      await audit.fileUploaded(user?.email || 'anon', file.type);
                      setSecretData(s => ({ ...s, signature_file_url: file_url }));
                    }}
                  />
                </label>
                <Button onClick={() => saveSecret.mutate(secretData)} disabled={saveSecret.isPending} className="w-full rounded-xl">
                  {saveSecret.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvează în Seif
                </Button>
              </div>
            </motion.div>
          )}

          {tab === 'documents' && (
            <motion.div key="documents" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="glass-card rounded-2xl p-5 border border-white/8 space-y-4">
                <p className="text-sm text-slate-400">Documente încărcate: față CI, verso CI, fotografie.</p>
                {[
                  { key: 'id_front_file_url', label: 'CI — față' },
                  { key: 'id_back_file_url', label: 'CI — verso' },
                  { key: 'headshot_file_url', label: 'Fotografie față' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <p className="text-xs text-slate-400 mb-1">{label}</p>
                    {profileData[key] && (
                      <img src={profileData[key]} alt={label} className="w-24 h-16 object-cover rounded-lg border border-white/10 mb-2" />
                    )}
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const validation = validateUploadedFile(file);
                        if (!validation.valid) { await audit.fileRejected(user?.email || 'anon', validation.error); alert(validation.error); return; }
                        const rl = checkRateLimit('file_upload', user?.email || 'anon');
                        if (!rl.allowed) { alert(rl.message); return; }
                        const { file_url } = await base44.integrations.Core.UploadFile({ file });
                        await audit.fileUploaded(user?.email || 'anon', file.type);
                        const updated = { ...profileData, [key]: file_url, user_id: user.email };
                        setProfileData(updated);
                        profile.id
                          ? await base44.entities.UserPrivateProfile.update(profile.id, updated)
                          : await base44.entities.UserPrivateProfile.create(updated);
                        queryClient.invalidateQueries({ queryKey: ['vault-profile'] });
                        setSaveMsg('Fișier salvat ✓');
                        setTimeout(() => setSaveMsg(''), 2500);
                      }}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === 'privacy' && (
            <motion.div key="privacy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="space-y-4">
                <div className="glass-card rounded-2xl p-5 border border-white/8">
                  <h3 className="text-sm font-semibold text-white mb-3">Confidențialitate și controlul datelor</h3>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    Ai dreptul de a accesa, rectifica, șterge sau exporta datele tale. Datele sensibile (CNP, serie/număr act) sunt stocate separat și nu apar în liste publice.
                  </p>

                  {/* Consent history */}
                  {consents.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-slate-400 mb-2">Istoricul consimțămintelor</p>
                      <div className="space-y-2">
                        {consents.map(c => (
                          <div key={c.id} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                            <span className="text-slate-300">{c.consent_type?.replace('_', ' ')}</span>
                            <span className={c.accepted ? 'text-success' : 'text-destructive'}>
                              {c.accepted ? '✓ Acceptat' : '✗ Refuzat'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full rounded-xl border-white/10 text-slate-300 hover:text-white"
                      onClick={() => {
                        const data = { profile: profileData, consents };
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a'); a.href = url; a.download = 'noqueue-datele-mele.json'; a.click();
                      }}
                    >
                      Exportă toate datele mele
                    </Button>

                    {!showDeleteConfirm ? (
                      <Button
                        variant="outline"
                        className="w-full rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        Șterge datele mele
                      </Button>
                    ) : (
                      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 space-y-3">
                        <p className="text-xs text-destructive font-semibold">Ești sigur? Această acțiune este ireversibilă.</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setShowDeleteConfirm(false)} className="flex-1 border-white/10">Anulează</Button>
                          <Button size="sm" onClick={handleDeleteData} className="flex-1 bg-destructive hover:bg-destructive/90">Șterge definitiv</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}