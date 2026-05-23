/**
 * EditableProfileForm — inline editor for the user's Safe Profile.
 *
 * Pre-populates from the existing UserPrivateProfile record (already fetched by
 * pages/Profile.jsx) and updates it via base44.entities.UserPrivateProfile.update().
 * On success, invalidates the 'profile-hub' query so the rest of the app sees
 * the latest auto-fill data immediately.
 */
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save, CheckCircle2, Pencil } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const FIELDS = [
  { name: 'first_name', label: 'Prenume', placeholder: 'Alexandru' },
  { name: 'last_name', label: 'Nume', placeholder: 'Pop' },
  { name: 'phone', label: 'Telefon', placeholder: '+40 7xx xxx xxx' },
  { name: 'address_line_1', label: 'Adresă', placeholder: 'Str. Decebal nr. 55 ap. 1', full: true },
  { name: 'city', label: 'Oraș', placeholder: 'Cluj-Napoca' },
  { name: 'county', label: 'Județ', placeholder: 'Cluj' },
];

export default function EditableProfileForm({ profile, userEmail }) {
  const [editing, setEditing] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const queryClient = useQueryClient();

  const defaultValues = FIELDS.reduce((acc, f) => {
    acc[f.name] = profile?.[f.name] || '';
    return acc;
  }, {});

  const { register, handleSubmit, reset, formState: { isDirty, errors } } = useForm({ defaultValues });

  // Re-sync the form whenever the underlying profile changes (after a refetch).
  useEffect(() => { reset(defaultValues); /* eslint-disable-next-line */ }, [profile?.id, profile?.updated_date]);

  const mutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        ...values,
        full_name: [values.first_name, values.last_name].filter(Boolean).join(' ').trim() || profile?.full_name,
      };
      if (profile?.id) {
        return base44.entities.UserPrivateProfile.update(profile.id, payload);
      }
      return base44.entities.UserPrivateProfile.create({ user_id: userEmail, email: userEmail, ...payload });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-hub'] });
      setSavedAt(Date.now());
      setEditing(false);
    },
  });

  const onSubmit = (values) => mutation.mutate(values);

  return (
    <div className="glass-card rounded-2xl p-5 border border-white/8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-white">Date pentru auto-completare</p>
          <p className="text-[11px] text-slate-500">Folosite la completarea automată a documentelor.</p>
        </div>
        {!editing && (
          <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="rounded-xl">
            <Pencil className="w-3.5 h-3.5 mr-1.5" /> Editează
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FIELDS.map(f => (
          <div key={f.name} className={f.full ? 'sm:col-span-2' : ''}>
            <label className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">{f.label}</label>
            <Input
              {...register(f.name, f.name === 'phone' ? { pattern: { value: /^[+\d\s()-]{6,}$/, message: 'Telefon invalid' } } : {})}
              disabled={!editing || mutation.isPending}
              placeholder={f.placeholder}
              className="mt-1 bg-background/40 border-white/10 text-white placeholder:text-slate-600 disabled:opacity-70"
            />
            {errors[f.name] && <p className="text-[10px] text-destructive mt-1">{errors[f.name].message}</p>}
          </div>
        ))}

        {editing && (
          <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={mutation.isPending}
              onClick={() => { reset(defaultValues); setEditing(false); }}
              className="text-slate-400"
            >
              Anulează
            </Button>
            <Button type="submit" size="sm" disabled={mutation.isPending || !isDirty} className="rounded-xl bg-primary hover:bg-primary/90">
              {mutation.isPending ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
              Salvează
            </Button>
          </div>
        )}
      </form>

      {savedAt && !editing && (
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-green-400">
          <CheckCircle2 className="w-3.5 h-3.5" /> Salvat. Auto-completarea va folosi datele noi.
        </div>
      )}
      {mutation.isError && (
        <p className="mt-3 text-[11px] text-destructive">Eroare la salvare. Încearcă din nou.</p>
      )}
    </div>
  );
}