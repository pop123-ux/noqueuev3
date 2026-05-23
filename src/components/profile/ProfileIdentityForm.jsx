import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { validateCNP, birthDateFromCNP } from '@/lib/documents/profileFieldMap';
import { getHeight, getEyeColor } from '@/lib/profile/profileBiometricSelector';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2 } from 'lucide-react';

const schema = z.object({
  first_name:     z.string().min(1, 'Required'),
  last_name:      z.string().min(1, 'Required'),
  cnp:            z.string().refine(v => !v || validateCNP(v).valid, { message: 'Invalid CNP checksum' }),
  sex:            z.enum(['M', 'F', '']).optional(),
  birth_date:     z.string().optional(),
  birth_place:    z.string().optional(),
  father_name:    z.string().optional(),
  mother_name:    z.string().optional(),
  email:          z.string().email('Invalid email').optional().or(z.literal('')),
  phone:          z.string().optional(),
  citizenship:    z.string().optional(),
  address_line_1: z.string().optional(),
  address_line_2: z.string().optional(),
  city:           z.string().optional(),
  county:         z.string().optional(),
  postal_code:    z.string().optional(),
  country:        z.string().optional(),
  id_series:      z.string().max(2, 'Max 2 chars').optional(),
  id_number:      z.string().max(8).optional(),
  id_issued_by:   z.string().optional(),
  id_issue_date:  z.string().optional(),
  id_expiry_date: z.string().optional(),
  marital_status: z.enum(['single', 'married', 'divorced', 'widowed', '']).optional(),
  height_cm:      z.coerce.number().min(50).max(250).optional().or(z.literal('')),
  eye_color:      z.string().optional(),
});

function Field({ label, error, children, required }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-destructive mt-0.5">{error}</p>}
    </div>
  );
}

function FormInput({ label, name, register, errors, type = 'text', required, placeholder }) {
  return (
    <Field label={label} error={errors[name]?.message} required={required}>
      <Input
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className="bg-white/[0.04] border-white/10 text-white placeholder:text-slate-600 h-9 text-sm focus:border-primary/50"
      />
    </Field>
  );
}

const COUNTIES = [
  'Alba','Arad','Argeș','Bacău','Bihor','Bistrița-Năsăud','Botoșani','Brașov','Brăila',
  'Buzău','Caraș-Severin','Călărași','Cluj','Constanța','Covasna','Dâmbovița','Dolj',
  'Galați','Giurgiu','Gorj','Harghita','Hunedoara','Ialomița','Iași','Ilfov','Maramureș',
  'Mehedinți','Mureș','Neamț','Olt','Prahova','Satu Mare','Sălaj','Sibiu','Suceava',
  'Teleorman','Timiș','Tulcea','Vaslui','Vâlcea','Vrancea','Municipiul București',
];

export default function ProfileIdentityForm({ profile, onSave, saving }) {
  const {
    register, handleSubmit, formState: { errors }, setValue, watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name:     profile?.first_name || '',
      last_name:      profile?.last_name || '',
      cnp:            profile?.cnp || '',
      sex:            profile?.sex || '',
      birth_date:     profile?.birth_date || '',
      birth_place:    profile?.birth_place || '',
      father_name:    profile?.father_name || '',
      mother_name:    profile?.mother_name || '',
      email:          profile?.email || '',
      phone:          profile?.phone || '',
      citizenship:    profile?.citizenship || 'RO',
      address_line_1: profile?.address_line_1 || '',
      address_line_2: profile?.address_line_2 || '',
      city:           profile?.city || '',
      county:         profile?.county || '',
      postal_code:    profile?.postal_code || '',
      country:        profile?.country || 'Romania',
      id_series:      profile?.id_series || '',
      id_number:      profile?.id_number || '',
      id_issued_by:   profile?.id_issued_by || '',
      id_issue_date:  profile?.id_issue_date || '',
      id_expiry_date: profile?.id_expiry_date || '',
      marital_status: profile?.marital_status || '',
      // Biometric fields — auto-default if missing
      height_cm:      profile?.height_cm || getHeight(profile),
      eye_color:      profile?.eye_color || getEyeColor(profile),
    },
  });

  // Auto-derive birth date from CNP
  const cnpVal = watch('cnp');
  useEffect(() => {
    if (cnpVal?.length === 13 && validateCNP(cnpVal).valid) {
      const bd = birthDateFromCNP(cnpVal);
      if (bd) setValue('birth_date', bd);
      // Auto-set sex from CNP first digit
      const s = String(cnpVal)[0];
      if (['1', '3', '5', '7'].includes(s)) setValue('sex', 'M');
      else if (['2', '4', '6', '8'].includes(s)) setValue('sex', 'F');
    }
  }, [cnpVal, setValue]);

  const section = (title) => (
    <div className="col-span-2 mt-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
        <div className="flex-1 h-px bg-primary/20" />
        {title}
        <div className="flex-1 h-px bg-primary/20" />
      </h3>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
        {section('Personal Details')}
        <FormInput label="Last name (Nume)" name="last_name" register={register} errors={errors} required />
        <FormInput label="First name (Prenume)" name="first_name" register={register} errors={errors} required />

        <Field label="CNP (13 digits)" error={errors.cnp?.message} required>
          <Input
            placeholder="1234567890123"
            {...register('cnp')}
            maxLength={13}
            className="bg-white/[0.04] border-white/10 text-white placeholder:text-slate-600 h-9 text-sm font-mono focus:border-primary/50"
          />
        </Field>

        <Field label="Sex" error={errors.sex?.message}>
          <select
            {...register('sex')}
            className="w-full h-9 px-3 rounded-md bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50"
          >
            <option value="">— Select —</option>
            <option value="M">Male (Masculin)</option>
            <option value="F">Female (Feminin)</option>
          </select>
        </Field>

        <FormInput label="Date of birth" name="birth_date" register={register} errors={errors} type="date" />
        <FormInput label="Place of birth (Localitatea nașterii)" name="birth_place" register={register} errors={errors} placeholder="Cluj-Napoca" />
        <FormInput label="Father's first name" name="father_name" register={register} errors={errors} />
        <FormInput label="Mother's first name" name="mother_name" register={register} errors={errors} />

        {/* Biometric fields for passport auto-fill */}
        <Field label="Înălțime (cm)" error={errors.height_cm?.message}>
          <Input
            type="number"
            min={50} max={250}
            placeholder="175"
            {...register('height_cm')}
            className="bg-white/[0.04] border-white/10 text-white placeholder:text-slate-600 h-9 text-sm focus:border-primary/50"
          />
          <p className="text-[10px] text-slate-600 mt-0.5 flex items-center gap-1">
            <span className="text-accent">✦</span> Folosit pentru auto-completare pasaport (Semnalmente)
          </p>
        </Field>

        <Field label="Culoarea ochilor" error={errors.eye_color?.message}>
          <select
            {...register('eye_color')}
            className="w-full h-9 px-3 rounded-md bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50"
          >
            <option value="">— Selecteaza —</option>
            <option value="Căprui">Căprui</option>
            <option value="Albaștri">Albaștri</option>
            <option value="Verzi">Verzi</option>
            <option value="Negri">Negri</option>
            <option value="Gri">Gri</option>
            <option value="Căprui-verzui">Căprui-verzui</option>
            <option value="Hazel">Hazel</option>
            <option value="Altele">Altele</option>
          </select>
          <p className="text-[10px] text-slate-600 mt-0.5 flex items-center gap-1">
            <span className="text-accent">✦</span> Folosit pentru auto-completare pasaport (Semnalmente)
          </p>
        </Field>

        <Field label="Marital status">
          <select
            {...register('marital_status')}
            className="w-full h-9 px-3 rounded-md bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50"
          >
            <option value="">— Select —</option>
            <option value="single">Single (Necăsătorit/ă)</option>
            <option value="married">Married (Căsătorit/ă)</option>
            <option value="divorced">Divorced (Divorțat/ă)</option>
            <option value="widowed">Widowed (Văduv/ă)</option>
          </select>
        </Field>

        {section('Contact')}
        <FormInput label="Email" name="email" register={register} errors={errors} type="email" placeholder="your@email.ro" />
        <FormInput label="Phone" name="phone" register={register} errors={errors} placeholder="+40 7XX XXX XXX" />
        <FormInput label="Citizenship" name="citizenship" register={register} errors={errors} placeholder="RO" />

        {section('Address / Domiciliu')}
        <div className="sm:col-span-2">
          <FormInput label="Street address (Stradă, nr.)" name="address_line_1" register={register} errors={errors} placeholder="Str. Exemplu nr. 1, Ap. 2" />
        </div>
        <FormInput label="Address line 2" name="address_line_2" register={register} errors={errors} />
        <FormInput label="City (Localitate)" name="city" register={register} errors={errors} placeholder="Cluj-Napoca" />

        <Field label="County (Județ)" error={errors.county?.message}>
          <select
            {...register('county')}
            className="w-full h-9 px-3 rounded-md bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50"
          >
            <option value="">— Select county —</option>
            {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <FormInput label="Postal code" name="postal_code" register={register} errors={errors} placeholder="400001" />
        <FormInput label="Country" name="country" register={register} errors={errors} placeholder="Romania" />

        {section('Identity Card (Carte de Identitate)')}
        <FormInput label="CI Series (Serie)" name="id_series" register={register} errors={errors} placeholder="CJ" />
        <FormInput label="CI Number (Număr)" name="id_number" register={register} errors={errors} placeholder="123456" />
        <div className="sm:col-span-2">
          <FormInput label="Issued by (Emisă de)" name="id_issued_by" register={register} errors={errors} placeholder="SPCLEP Cluj-Napoca" />
        </div>
        <FormInput label="Issue date" name="id_issue_date" register={register} errors={errors} type="date" />
        <FormInput label="Expiry date" name="id_expiry_date" register={register} errors={errors} type="date" />
      </div>

      <div className="pt-6">
        <Button
          type="submit"
          disabled={saving}
          className="w-full bg-primary hover:bg-primary/90 rounded-xl h-11"
        >
          {saving
            ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving…</>
            : <><CheckCircle2 className="w-4 h-4 mr-2" />Save Profile</>
          }
        </Button>
      </div>
    </form>
  );
}