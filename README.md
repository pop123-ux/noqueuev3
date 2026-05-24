# NoQueue v3 — Sistemul Civic Digital al României

> Creat pentru **Cluj Hackathon 2026**  
> Proiect realizat de Team **Code Blooded**:
> **Pop Alexandru — Team Leader**  
> **Eric Ștefan Blideran**  
> **Darius Drînda**  
> **Paul Ilișan**

O platformă civică modernă care ajută cetățenii să evite cozile inutile, să înțeleagă birocrația, să pregătească automat documentele și să gestioneze evenimente importante din viață într-un singur loc digital.

---

# Demo Live

**Aplicație live:**  
`https://cluj-queue-clear.base44.app`

**Repository GitHub:**  
`https://github.com/pop123-ux/NoQueuev3`

---

# Ce este NoQueue?

NoQueue este un asistent civic bazat pe AI și un spațiu digital pentru gestionarea documentelor și serviciilor publice din România.

În loc ca utilizatorii să caute informații pe zeci de site-uri guvernamentale, să imprime formulare neclare sau să stea la cozi greșite, NoQueue oferă un flux simplificat și ghidat:

1. Utilizatorul își verifică identitatea o singură dată printr-un flux inspirat de ROeID.
2. NoQueue creează un profil securizat („Safe Profile”) cu date reutilizabile.
3. Utilizatorul spune ce are nevoie:
   - „Mi-am pierdut buletinul”
   - „Am nevoie de pașaport”
   - „Mă mut în România”
   - „Am nevoie de certificat fiscal”
4. Aplicația identifică instituția corectă, documentele necesare, pașii procedurali și timpul economisit.
5. Utilizatorul primește un spațiu dedicat cazului, liste de pregătire, remindere și un istoric civic complet.

NoQueue nu este doar un chatbot. Este un sistem civic digital care combină identitate, documente, AI, audit și fluxuri administrative într-o experiență modernă și ușor de folosit.

---

# Problema

Cetățenii români pierd ore întregi din cauza birocrației fragmentate:

- Nu este clar ce instituție rezolvă fiecare problemă.
- Documentele necesare sunt greu de găsit sau împrăștiate pe mai multe site-uri.
- Oamenii trebuie să revină de mai multe ori deoarece lipsește un act.
- Experiența digitală a instituțiilor este deseori lentă și neadaptată pentru mobil.
- Datele personale trebuie introduse din nou și din nou.
- Cetățenii străini care se mută în România întâmpină dificultăți și mai mari.
- Nu există un dashboard civic unificat pentru documente, cazuri și expirări.

---

# Soluția

NoQueue transformă birocrația în fluxuri digitale ghidate.

Platforma ajută utilizatorii să:

- Înțeleagă exact ce trebuie să facă.
- Creeze cazuri administrative din limbaj natural.
- Fie direcționați către instituția corectă.
- Genereze fișe de pregătire și seturi de documente.
- Stocheze documente într-un seif digital.
- Monitorizeze expirarea actelor.
- Utilizeze onboarding securizat inspirat de ROeID.
- Activeze autentificare 2FA pentru acțiuni sensibile.
- Păstreze un istoric civic imuabil.
- Estimeze timpul economisit prin evitarea cozilor.

---

# Exemple de Fluxuri

## 1. Buletin pierdut

Utilizatorul spune:

> „Mi-am pierdut buletinul.”

NoQueue oferă:

- Declarația necesară.
- Lista documentelor pentru SPCLEP.
- Checklist de pregătire.
- Estimare de timp economisit.
- Ghidare către instituția corectă.
- Salvarea cazului în dashboard.
- Înregistrare în istoricul civic.

---

## 2. Cerere Pașaport

Utilizatorul spune:

> „Am nevoie de pașaport.”

NoQueue oferă:

- Ghid pentru programare.
- Lista documentelor necesare.
- Informații despre taxe.
- Fișă de pregătire.
- Mențiunea că formularul oficial este completat doar de autorități.
- Ghid către procesul oficial ePașapoarte.

---

## 3. Mutare în România

Utilizatorul spune:

> „Mă mut în România.”

NoQueue generează:

- Pași pentru rezidență.
- Ghid pentru asigurare medicală.
- Înregistrare fiscală.
- Instituții relevante.
- Estimare a procesului birocratic.
- Timp economisit estimat.

---

# Funcționalități Principale

## Dashboard Civic NoQueue OS

Dashboard-ul principal afișează:

- Timp economisit.
- Cazuri active.
- Evenimente importante.
- Formulare pregătite.
- Cozi evitate.
- Drumuri evitate.
- Documente care expiră.
- Istoric civic complet.

---

## Safe Profile

Profilul securizat stochează informații reutilizabile precum:

- Prenume
- Nume
- Data nașterii
- Locul nașterii
- Adresă
- Oraș
- Județ
- Serie CI
- Număr CI
- Expirare CI
- Cetățenie

Datele sensibile sunt mascate sau criptate în prototip.

---

## Verificare Identitate Tip ROeID

Fluxul de onboarding include:

1. Introducere email
2. Upload CI
3. OCR automat
4. Verificarea datelor extrase
5. Verificare 2FA
6. Crearea profilului
7. Înregistrare în timeline

Acesta este un prototip demonstrativ și nu un sistem oficial guvernamental.

---

## OCR pentru Carte de Identitate

Aplicația poate extrage date din CI și permite utilizatorului să confirme informațiile înainte de salvare.

OCR-ul nu este considerat sursă finală fără verificarea utilizatorului.

---

## Autentificare cu Doi Factori (2FA)

NoQueue include suport TOTP compatibil cu Google Authenticator:

- Configurare QR
- Cod secret manual
- Verificare cu cod de 6 cifre
- Coduri backup
- Confirmare înainte de acțiuni sensibile

---

## Clasificator AI pentru Cazuri Administrative

Utilizatorul poate scrie:

- „Trebuie să îmi schimb buletinul”
- „Mi-a expirat permisul”
- „Am nevoie de cazier”
- „Vreau să deschid o firmă”

Aplicația returnează:

- Procedura corectă
- Instituția responsabilă
- Documentele necesare
- Posibilitatea online/offline
- Avertismente și riscuri
- Următorul pas

---

# Principiu Legal Important

> NoQueue NU generează documente oficiale false.

Dacă un formular trebuie completat exclusiv de autorități, aplicația generează doar o fișă de pregătire clar marcată.

---

# Evenimente de Viață

NoQueue permite pornirea fluxurilor administrative din evenimente reale:

- Mi-am pierdut buletinul
- M-am mutat
- M-am căsătorit
- Am avut un copil
- Am nevoie de asigurare medicală
- Am deschis o firmă

---

# Digital Vault

Seiful digital permite:

- Stocarea documentelor
- Căutare rapidă
- Monitorizarea expirării
- Descărcarea fișierelor
- Reutilizarea datelor verificate

---

# Timeline Civic

Sunt înregistrate acțiuni precum:

- Identitate verificată
- Document generat
- Caz creat
- Profil actualizat
- Semnătură aprobată

---

# Gateway AI Securizat

NoQueue folosește un model AI securizat:

- Eliminare PII înainte de request-uri AI
- Detectare prompt injection
- Logging și audit
- Validare răspunsuri
- Protecție împotriva scurgerii datelor personale

---

# Protecție Prompt Injection

Sunt detectate expresii precum:

- „Ignore previous instructions”
- „Reveal system prompt”
- „Dump database”
- „Developer mode”

Conținutul suspect este blocat sau sanitizat.

---

# Audit Logging

Sunt înregistrate evenimente precum:

- Upload fișier
- Document generat
- Tentativă de injection
- Salvare în vault
- Export date

Datele sensibile sunt mascate automat.
