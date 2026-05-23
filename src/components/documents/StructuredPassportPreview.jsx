/**
 * StructuredPassportPreview.jsx
 * Visual HTML preview of the Romanian passport form (Anexa 10)
 * Renders individual character boxes, checkboxes, and form structure
 * 
 * CIORNA — not an official form
 */
import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { mapProfileToPassportForm } from '@/services/documents/passportFieldMapper';
import { getHeight, getEyeColor } from '@/lib/profile/profileBiometricSelector';

// ── Primitives ─────────────────────────────────────────────────────

function CharBox({ char, missing }) {
  return (
    <div
      className={`
        inline-flex items-center justify-center
        font-mono text-[10px] font-bold uppercase select-none
        border border-gray-400
        ${missing ? 'bg-yellow-50 border-yellow-400' : char ? 'bg-blue-50 text-blue-800' : 'bg-white'}
      `}
      style={{ width: 14, height: 14, minWidth: 14, margin: '0 0.5px' }}
    >
      {char || ''}
    </div>
  );
}

function CharBoxRow({ chars, missing = false, label, labelWidth = 0 }) {
  const anyMissing = missing && chars.every(c => !c);
  return (
    <div className="flex items-center gap-0.5 flex-wrap">
      {chars.map((ch, i) => (
        <CharBox key={i} char={ch} missing={anyMissing} />
      ))}
      {anyMissing && (
        <span className="ml-1 text-[9px] text-yellow-600 font-medium flex items-center gap-0.5">
          <AlertTriangle className="w-2.5 h-2.5" /> lipsa
        </span>
      )}
    </div>
  );
}

function Checkbox({ checked, label, missing }) {
  return (
    <div className="flex items-center gap-1">
      <div
        className={`w-3.5 h-3.5 border flex items-center justify-center shrink-0
          ${checked ? 'bg-blue-600 border-blue-700' : 'bg-white border-gray-500'}`}
      >
        {checked && <span className="text-white text-[9px] font-bold leading-none">X</span>}
      </div>
      {label && <span className="text-[9px] leading-tight">{label}</span>}
    </div>
  );
}

function FormRow({ label, labelW = 60, children, bg = 'white', highlight }) {
  return (
    <div className={`flex items-stretch border border-gray-400 -mt-px ${highlight ? 'ring-1 ring-yellow-400' : ''}`}>
      {label && (
        <div
          className="flex items-center justify-center shrink-0 bg-gray-200 border-r border-gray-400 px-1 py-1 text-center"
          style={{ width: labelW, minWidth: labelW }}
        >
          <span className="text-[9px] font-bold leading-tight">{label}</span>
        </div>
      )}
      <div className={`flex-1 flex items-center px-1.5 py-1 bg-${bg}`}>
        {children}
      </div>
    </div>
  );
}

function SectionHeader({ children }) {
  return (
    <div className="bg-gray-300 border border-gray-400 -mt-px px-2 py-1 text-center">
      <span className="text-[9px] font-bold italic">{children}</span>
    </div>
  );
}

// ── Main Preview ────────────────────────────────────────────────────

export default function StructuredPassportPreview({ profile, options = {} }) {
  const [zoom, setZoom] = useState(1);
  // Apply biometric defaults for preview
  const profileWithDefaults = profile ? {
    ...profile,
    height_cm: getHeight(profile),
    eye_color: getEyeColor(profile),
  } : null;
  const data = mapProfileToPassportForm(profileWithDefaults, options);

  return (
    <div className="space-y-3">
      {/* Zoom controls */}
      <div className="flex items-center gap-2 justify-end">
        <span className="text-[10px] text-slate-500">Zoom</span>
        {[0.75, 1, 1.25, 1.5].map(z => (
          <button
            key={z}
            onClick={() => setZoom(z)}
            className={`px-2 py-0.5 rounded text-[10px] border transition-all ${
              zoom === z ? 'bg-primary text-white border-primary' : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/30'
            }`}
          >
            {Math.round(z * 100)}%
          </button>
        ))}
      </div>

      {/* Draft banner */}
      <div className="bg-yellow-400 text-[9px] font-bold text-center py-1 text-navy-900 tracking-wide rounded-t">
        CIORNA GENERATA — VERIFICATI INAINTE DE DEPUNERE — Generated draft — review before submission
      </div>

      {/* Form container */}
      <div className="overflow-auto rounded-b border-2 border-blue-300" style={{ background: '#f0f8ff' }}>
        <div
          className="font-serif text-black mx-auto"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            width: 530,
            padding: '12px 16px',
            background: 'white',
            fontFamily: 'Times New Roman, Times, serif',
          }}
        >
          {/* Title */}
          <div className="text-center mb-2">
            <div className="flex items-center justify-between px-2">
              <div />
              <div>
                <div className="text-sm font-bold underline">CERERE</div>
                <div className="text-[10px] font-bold">pentru eliberarea unui nou pasaport</div>
              </div>
              <div className="text-[10px] font-bold self-start">Anexa 10</div>
            </div>
          </div>

          {/* ROW 1: CNP + SEX + Data nasterii */}
          <div className="flex items-stretch border border-gray-400">
            {/* CNP label */}
            <div className="bg-gray-200 border-r border-gray-400 flex items-center justify-center px-1.5 shrink-0" style={{ width: 28 }}>
              <span className="text-[9px] font-bold">CNP</span>
            </div>
            {/* CNP boxes */}
            <div className="flex items-center px-1 py-1.5 flex-1">
              <CharBoxRow chars={data.cnpBoxes} missing={data.missing.includes('CNP')} />
            </div>
            {/* Sex */}
            <div className="border-l border-gray-400 flex items-center gap-1.5 px-2 shrink-0">
              <span className="text-[9px] font-bold">Sex</span>
              <div className="flex flex-col gap-0.5">
                <Checkbox checked={data.sexM} label="M" />
                <Checkbox checked={data.sexF} label="F" />
              </div>
              {data.missing.includes('Sex') && <AlertTriangle className="w-2.5 h-2.5 text-yellow-500" />}
            </div>
            {/* Data nasterii */}
            <div className="border-l border-gray-400 flex items-center gap-1 px-2 shrink-0">
              <span className="text-[9px] font-bold">Data nasterii</span>
              <div>
                <CharBoxRow chars={[...data.birthDate.day, ...data.birthDate.month, ...data.birthDate.year]} missing={data.missing.includes('Data nasterii')} />
                <div className="flex gap-0 mt-0.5">
                  {['Z','Z','L','L','A','A','A','A'].map((l,i)=>(
                    <span key={i} className="text-[7px] text-gray-500 text-center" style={{width:15}}>
                      {i===2||i===4?' ':l}
                      {(i===1||i===3)?<span className="opacity-0">_</span>:null}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ROW 2: Numele */}
          <FormRow label="Numele" labelW={48} highlight={data.missing.includes('Nume')}>
            <CharBoxRow chars={data.numeBoxes} missing={data.missing.includes('Nume')} />
          </FormRow>

          {/* ROW 3: Prenumele */}
          <FormRow label="Prenumele" labelW={52} highlight={data.missing.includes('Prenume')}>
            <CharBoxRow chars={data.prenumeBoxes} missing={data.missing.includes('Prenume')} />
          </FormRow>

          {/* ROW 4: Numele anterior */}
          <FormRow label="Numele anterior" labelW={70}>
            <CharBoxRow chars={data.numeAnteriorBoxes} />
          </FormRow>

          {/* ROW 5: Tata + Mama */}
          <div className="border border-gray-400 -mt-px">
            <div className="flex justify-around text-[9px] font-bold bg-gray-50 border-b border-gray-400 py-0.5">
              <span>Prenumele tatalui</span>
              <span>Prenumele mamei</span>
            </div>
            <div className="flex">
              <div className="flex-1 flex items-center px-1 py-1.5 border-r border-gray-400">
                <CharBoxRow chars={data.tatBoxes} missing={data.missing.includes('Prenumele tatalui')} />
              </div>
              <div className="flex-1 flex items-center px-1 py-1.5">
                <CharBoxRow chars={data.mamBoxes} missing={data.missing.includes('Prenumele mamei')} />
              </div>
            </div>
          </div>

          {/* ROW 6: Locul nasterii + Judet */}
          <div className="flex items-stretch border border-gray-400 -mt-px">
            <div className="bg-gray-200 border-r border-gray-400 flex items-center justify-center px-1 shrink-0" style={{width:62}}>
              <span className="text-[9px] font-bold text-center leading-tight">Locul nasterii</span>
            </div>
            <div className="flex-1 flex items-center px-1 py-1.5">
              <CharBoxRow chars={data.locuNasterii} missing={data.missing.includes('Locul nasterii')} />
            </div>
            <div className="border-l border-gray-400 flex items-center gap-1 px-2 shrink-0">
              <span className="text-[9px] font-bold">Judetul</span>
              <CharBoxRow chars={data.judetBoxes} missing={data.missing.includes('Judet')} />
            </div>
          </div>

          {/* ROW 7: Domiciliu */}
          <div className="flex items-stretch border border-gray-400 -mt-px">
            <div className="bg-gray-200 border-r border-gray-400 flex items-center px-1.5 shrink-0" style={{width:46}}>
              <span className="text-[9px] font-bold">Domiciliul</span>
            </div>
            <div className="flex-1 px-2 py-1.5">
              {data.domiciliu ? (
                <span className="text-[9px] font-bold text-blue-700">{data.domiciliu}</span>
              ) : (
                <span className="text-[9px] text-yellow-600 flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5" /> lipsa din Seif
                </span>
              )}
            </div>
          </div>

          {/* ROW 8: Telefon */}
          <div className="flex items-stretch border border-gray-400 -mt-px">
            <div className="bg-gray-200 border-r border-gray-400 flex items-center px-1.5 shrink-0" style={{width:38}}>
              <span className="text-[9px] font-bold">Telefon</span>
            </div>
            <div className="flex-1 px-2 py-1.5">
              {data.telefon ? (
                <span className="text-[9px] font-bold text-blue-700">{data.telefon}</span>
              ) : (
                <span className="text-[9px] text-yellow-600 flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5" /> lipsa din Seif
                </span>
              )}
            </div>
          </div>

          {/* DECLARATION SECTION */}
          <SectionHeader>
            <span className="underline font-extrabold">Declar pe propria raspundere ca</span>
            {' '}(marcati cu X situatia corespunzatoare)
          </SectionHeader>

          {/* Passport possession */}
          <div className="flex items-stretch border border-gray-400 -mt-px">
            <div className="flex-1 flex items-center gap-2 px-2 py-1.5 border-r border-gray-400">
              <Checkbox checked={!data.hasPreviousPassport} />
              <span className="text-[9px] font-bold underline">nu posed pasaport simplu</span>
            </div>
            <div className="flex-1 px-2 py-1.5">
              <div className="flex items-center gap-1 mb-1">
                <Checkbox checked={data.hasPreviousPassport} />
                <span className="text-[8px] font-bold underline">posed (am posedat) pasaportul simplu nr.</span>
                <CharBoxRow chars={data.prevPassportBoxes} />
              </div>
              <div className="text-[8px] text-gray-700">
                eliberat la data de {' '}
                <span className="inline-flex gap-0.5">
                  {['','','','','','','',''].map((_, i) => (
                    <CharBox key={i} char="" />
                  ))}
                </span>
                {' '} de formatiunea de pasapoarte
              </div>
              <div className="text-[8px] text-gray-700 mt-0.5">
                din judetul{' '}
                <span className="font-bold text-blue-700">{data.prevPassportCounty || '________________________'}</span>
              </div>
              <div className="text-[8px] text-gray-700 mt-0.5">
                si solicit un nou pasaport deoarece ________________________
              </div>
            </div>
          </div>

          {/* MA LEGITIMEZ */}
          <div className="border border-gray-400 -mt-px">
            <div className="flex items-stretch">
              {/* Left label */}
              <div className="bg-gray-200 border-r border-gray-400 px-1 py-1 shrink-0 flex flex-col justify-center" style={{width:50}}>
                <div className="text-[9px] font-bold">Ma</div>
                <div className="text-[9px] font-bold">legitimez</div>
                <div className="text-[8px]">cu (marcati</div>
                <div className="text-[8px]">cu X)</div>
              </div>
              {/* ID types */}
              <div className="flex-1 border-r border-gray-400 px-1 py-1 space-y-0.5">
                {[
                  { label: 'carte de identitate', checked: true },
                  { label: 'buletin de identitate', checked: false },
                  { label: 'adeverinta provizorie de identitate', checked: false },
                  { label: 'certificat de nastere', checked: false },
                ].map((item, i) => (
                  <Checkbox key={i} checked={item.checked} label={item.label} />
                ))}
              </div>
              {/* CI details */}
              <div className="flex-1 px-2 py-1 space-y-1">
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[8px]">seria</span>
                  <CharBoxRow chars={data.idSeries} missing={data.missing.includes('Seria CI')} />
                  <span className="text-[8px]">nr</span>
                  <CharBoxRow chars={data.idNumber} missing={data.missing.includes('Nr. CI')} />
                  <span className="text-[8px]">eliberat la</span>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[8px]">data de</span>
                  <CharBoxRow chars={['','','','','','','','']} />
                  <span className="text-[8px]">de</span>
                  <span className="text-[8px] text-blue-700">
                    {profile?.id_issued_by || '________________'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* URGENCY ROW */}
          <div className="bg-gray-200 border border-gray-400 -mt-px px-2 py-1.5 flex items-center gap-3">
            <span className="text-[9px] font-bold flex-1">
              Solicit eliberarea pasaportului in regim de urgenta.
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <Checkbox checked={data.urgentDA} label="DA" />
              <Checkbox checked={data.urgentNU} label="NU" />
              <span className="text-[8px] text-gray-600">(Marcati cu X)</span>
            </div>
          </div>

          {/* SEMNALMENTE + SEMNATURA */}
          <div className="flex items-stretch border border-gray-400 -mt-px" style={{minHeight:60}}>
            {/* Semnalmente */}
            <div className="border-r border-gray-400 bg-gray-100 shrink-0 px-1 py-1" style={{width:110}}>
              <div className="text-[8px] font-bold mb-1 flex items-center gap-1">
                Semnalmente
                {(data.heightCm || data.eyeColor) && (
                  <span className="text-[7px] bg-green-100 text-green-700 px-1 rounded font-semibold">AUTO</span>
                )}
              </div>
              <div className="flex items-end gap-1">
                <div>
                  <div className="text-[7px] text-gray-500">Inaltimea</div>
                  <div className={`border flex items-center justify-center font-bold text-[9px] ${data.heightCm ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-400 bg-white text-gray-300'}`}
                    style={{width:28, height:16}}>
                    {data.heightCm || ''}
                  </div>
                  <div className="text-[7px] text-gray-500">cm</div>
                </div>
                <div>
                  <div className="text-[7px] text-gray-500">Culoarea ochilor</div>
                  <div className={`border flex items-center justify-center font-bold text-[7px] ${data.eyeColor ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-400 bg-white'}`}
                    style={{width:60, height:16}}>
                    {data.eyeColor ? data.eyeColor.slice(0, 8) : (
                      <span className="text-yellow-400 text-[6px]">lipsa</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Data depunerii */}
            <div className="flex-1 border-r border-gray-400 px-1 py-1">
              <div className="text-[8px] font-bold mb-1 flex items-center gap-1">
                Data depunerii cererii
                <span className="text-[7px] bg-blue-100 text-blue-700 px-1 rounded font-semibold">AUTO</span>
              </div>
              <CharBoxRow chars={data.submissionDateBoxes} />
            </div>
            {/* Semnatura */}
            <div className="flex-1 flex flex-col items-center justify-between py-1 px-1">
              {data.signatureUrl ? (
                <div className="flex-1 flex items-center justify-center w-full">
                  <img
                    src={data.signatureUrl}
                    alt="Semnatura"
                    className="max-h-10 max-w-full object-contain"
                    style={{ filter: 'contrast(1.4) brightness(0.85)' }}
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-[7px] text-yellow-500 text-center leading-tight">semnatura<br/>lipsa din Seif</span>
                </div>
              )}
              <span className="text-[8px] font-bold text-gray-700 mt-0.5">Semnatura</span>
            </div>
          </div>

          {/* Legal footer */}
          <div className="mt-1 space-y-0.5">
            <p className="text-[8px]">Cererea completata cu date inexacte si omisiuni este nula de drept.</p>
            <p className="text-[8px] font-bold italic">
              Sunt de acord cu prelucrarea datelor prezentate in conformitate cu Legea 677/2001.
            </p>
          </div>
        </div>
      </div>

      {/* Missing fields summary */}
      {data.missing.length > 0 && (
        <div className="rounded-xl p-3 space-y-1.5"
          style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.25)' }}>
          <p className="text-[10px] font-bold text-warning uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3" /> {data.missing.length} camp(uri) lipsa din Seif
          </p>
          <div className="flex flex-wrap gap-1.5">
            {data.missing.map((f, i) => (
              <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.missing.length === 0 && (
        <div className="rounded-xl p-3 flex items-center gap-2"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
          <p className="text-[11px] text-green-400 font-semibold">
            Toate campurile completate din Seif. Verifica datele inainte de export.
          </p>
        </div>
      )}
    </div>
  );
}