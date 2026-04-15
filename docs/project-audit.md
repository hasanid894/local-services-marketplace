# Auditimi i Projektit — Local Services Marketplace

**Autori:** Devlete Hasani  
**Data:** 15 Prill 2026  
**Detyrë Kursi:** Project Audit & Improvement Sprint (Pjesa 1)

---

## 1. Përshkrimi i Shkurtër i Projektit

### Çfarë bën sistemi?

Local Services Marketplace është një platformë web full-stack që lidh klientët me ofrues të shërbimeve lokale në Kosovë. Përdoruesit mund të shfletojnë shërbime (hidraulikë, elektriçistë, tutorë, pastrues, etj.), të krijojnë llogari, të rezervojnë shërbime dhe të lënë vlerësime. Ofruesit e shërbimeve mund të menaxhojnë listat e tyre dhe t'i përgjigjen rezervimeve. Administratorët kanë qasje të plotë në të gjitha të dhënat.

### Kush janë përdoruesit kryesorë?

| Roli | Përshkrimi |
|------|------------|
| **Klient (Customer)** | Shfleton shërbime, krijon rezervime, lë vlerësime |
| **Ofrues (Provider)** | Krijon dhe menaxhon listat e shërbimeve, miraton/refuzon rezervimet |
| **Administrator (Admin)** | Ka qasje të plotë në të dhëna dhe mund të moderojë platformën |

### Çfarë është funksionaliteti kryesor?

1. **Autentikimi** — Regjistrim dhe hyrje me JWT dhe enkriptim të fjalëkalimit me bcrypt
2. **Menaxhimi i shërbimeve** — CRUD i plotë për listat e shërbimeve me filtrim sipas kategorisë dhe lokacionit
3. **Rezervimet** — Klientët krijojnë rezervime; ofruesit i miratojnë, refuzojnë ose i shënojnë si të kompletuara
4. **Vlerësimet** — Klientët mund të lënë komente dhe vlerësime numerike për shërbime
5. **Modaliteti dual i ruajtjes** — Sistemi mund të funksionojë me skedarë CSV ose me bazë të dhënash PostgreSQL, i kontrolluar nga variabla e mjedisit (`USE_DB=true`)

---

## 2. Çfarë Funksionon Mirë

### 2.1 — Arkitekturë e Pastër në Shtresa

Projekti ndan saktë përgjegjësitë në shtresa të dallueshme: **Routes → Controllers → Services → Repositories → Database**. Çdo shtresë ka një detyrë dhe nuk ndërhyn në shtresat me të cilat nuk duhet të ketë kontakt. Për shembull, `BookingService.js` nuk trajton asnjëherë kërkesa HTTP — ajo është përgjegjësi e kontrolluesit. Kjo e bën kodin të lexueshëm dhe të lehtë për t'u ndryshuar.

### 2.2 — Repository Pattern me Ruajtje Duale

Ndërfaqja `IRepository` dhe modeli factory (p.sh. `createUserRepository()`) lejojnë që i gjithë backend-i të kalojë nga modaliteti CSV në PostgreSQL duke ndryshuar vetëm një variabël mjedisi. Shtresa e shërbimeve nuk ka nevojë të ndryshojë fare. Kjo tregon një kuptim solid të **Parimit të Inversimit të Varësisë (DIP)** dhe **Parimit Hapur/Mbyllur (OCP)** nga SOLID.

### 2.3 — Autentikim Real me JWT dhe Kontroll i Qasjes Bazuar në Role

Sistemi i autentikimit është me të vërtetë i sigurt: fjalëkalimet hashohen me bcrypt, JWT-të nënshkruhen me çelës sekret, tokenat skadojnë pas 7 ditësh, dhe qasja në rrugë kontrollohet me middleware `verifyToken` dhe `requireRole`. Llogaritë administrative nuk mund të regjistrohen vetë — ky është dizajni i saktë. Fushat e ndjeshme si `passwordHash` hiqen para se të kthehen të dhënat e përdoruesit në frontend.

### 2.4 — Validimi i Hyrjeve në Shtresën e Shërbimeve

Validimi i rregullave të biznesit gjendet brenda klasave të shërbimeve, jo në kontrollues apo rrugë. Për shembull, `ServiceService.createService()` verifikon që titulli nuk është bosh, çmimi është numër pozitiv, dhe kategoria është e dhënë. Ky është niveli i duhur ku validimi i përket — do të thotë që rregullat zbatohen pavarësisht se si thirret shërbimi.

### 2.5 — Teste Ekzistuese për Logjikën Kryesore

Projekti ka një dosje `tests/` me `serviceService.test.js` dhe `fileRepository.test.js`. Skedari i testit të shërbimit mbulon rastet normale, rastet kufitare (titull bosh, çmim negativ, çmim jo-numerik) dhe ID-të joekzistente. Kjo tregon ndërgjegjësim se softueri ka nevojë për teste, jo vetëm demostrime funksionale.

---

## 3. Dobësitë e Projektit

### Dobësia 1 — Testet Janë të Prishura dhe Nuk Integrohen në CI

Skedari `serviceService.test.js` thërret metoda si `svc.add()`, `svc.list()`, `svc.findById()`, `svc.updateService()`, dhe `svc.deleteService()` drejtpërdrejt në instancën e `ServiceService`. Megjithatë, klasa reale `ServiceService` nuk ka metoda me emrat `add()`, `list()`, apo `findById()`. Emrat e vërtetë të metodave janë `createService()`, `getAllServices()`, dhe `getServiceById()`. Kjo do të thotë se **testet nuk ekzekutohen realisht kundër kodit real**. Ato do të dështonin menjëherë nëse ekzekutoheshin me `npm test`. Për më tepër, nuk ka GitHub Actions apo ndonjë runner automatik testesh të konfiguruar.

### Dobësia 2 — Kontrolluesit Krijojnë Instanca të Repositories Direkt (Pa Injektim Varësie)

Në çdo skedar kontrollues, repository dhe shërbimi krijohen në nivelin kryesor:

```js
// bookingController.js
const repo = createBookingRepository();
const bookingService = new BookingService(repo);
```

Kjo do të thotë se kontrolluesi krijon varësitë e veta dhe nuk ka mënyrë t'i zëvendësojë ato për teste apo mjedise të ndryshme pa edituar skedarin e kontrolluesit. Një dizajn më i mirë do të ishte injektimi i shërbimit si parametër (injektim varësie / dependency injection). Kjo gjithashtu do të thotë se ndryshimi i burimit të të dhënave në një kontrollues nuk e ndryshon automatikisht atë në të tjerët — secili duhet të përditësohet individualisht.

### Dobësia 3 — Vlerat e Statusit Janë Jokonzistente: Frontend Përdor Shkronja të Mëdha, Backend Përdor të Vogla

Skema e bazës së të dhënave dhe `BookingService` përdorin vlera të statusit me shkronja të vogla: `'pending'`, `'confirmed'`, `'completed'`, `'cancelled'`. Megjithatë, `BookingsPage.js` në frontend përdor vlera me shkronja të mëdha në `STATUS_COLORS`:

```js
const STATUS_COLORS = {
  Pending: '#f59e0b',
  Approved: '#10b981',   // "Approved" nuk është status valid në DB
  Rejected: '#ef4444',   // "Rejected" nuk është status valid në DB
  Completed: '#6366f1',
};
```

Backend-i përdor `'confirmed'` dhe `'cancelled'`, por frontend-i shfaq `'Approved'` dhe `'Rejected'`. Kjo jokonzistencë do të thotë se shiritat e statusit nuk do të shfaqin kurrë ngjyrën e duhur në modalitetin e bazës së të dhënave, dhe të dhënat e shfaqura nuk përputhen me atë që API-ja kthen realisht.

### Dobësia 4 — Formulari i Rezervimit Kërkon nga Përdoruesit të Shkruajnë Service ID dhe Provider ID

Në `BookingsPage.js`, formulari i krijimit të rezervimit ka dy fusha numerike të papërpunuara:

```jsx
<input placeholder="Service ID *" type="number" ... />
<input placeholder="Provider ID *" type="number" ... />
```

Ky është një gabim themelor i dizajnit të ndërfaqes. Përdoruesit realë nuk e dinë ID-në e brendshme të shërbimit apo ofruesit në bazën e të dhënave. Formulari duhet të tregojë një menu zgjedhëse (dropdown) ose të paraplohet automatikisht nga klikimi i butonit "Book" në faqen e shërbimeve. Kërkesa që përdoruesit të shkruajnë ID-të e brendshme të bazës së të dhënave është një gabim themelor i dizajnit të UI-t.

### Dobësia 5 — Nuk Ka Kufizim të Kërkesave apo Tituj Bazë Sigurie

Aplikacioni Express në `app.js` zbaton vetëm `cors()` dhe `express.json()`. Mungon:
- **Kufizimi i normës (Rate limiting)** — një përdorues ose skript mund të dërgojë mijëra përpjekje hyrjeje në `/api/auth/login` pa u bllokuar (sulm brute-force i fjalëkalimit)
- **Helmet** — titujt e sigurisë HTTP (p.sh. `X-Content-Type-Options`, `X-Frame-Options`) mungojnë
- **Kufizimi i CORS** — `app.use(cors())` pa konfigurim lejon kërkesa nga çdo origjinë, gjë që është e pasigurt për prodhim

### Dobësia 6 — Kërkesat UPDATE Dinamike Përdorin Emra Kolonash të Pavaliduara

Në `DatabaseRepository.js`, metoda `update()` ndërton një klauzolë SQL `SET` dinamikisht nga çelësat e pranishëm në `updatedData`:

```js
const setClauses = entries.map(([col], i) => `${col} = $${i + 1}`).join(', ');
```

Emrat e kolonave (variabla `col`) futen drejtpërdrejt në vargun SQL pa asnjë kontroll apo listë të bardhë (whitelist). Ndërsa vlerat e parametrizuara (`$1`, `$2`) mbrojnë kundër injektimit SQL për *vlerat*, *emrat e kolonave* vetë nuk mund të parametrizohen — SQL nuk e mbështet këtë. Çdo repository konkret (p.sh. `UserRepository`, `BookingRepository`) ka `colMap`-in e vet që përktheu çelësat camelCase para thirrjes së `super.update()`, gjë që e zbut pjesërisht këtë — por klasa bazë vetë nuk ka mbrojtje, që do të thotë çdo repository që harron të implementojë një override është i cenueshëm në heshtje.

### Dobësia 7 — `NotificationService.js` Është Kod Stub pa Funksionalitet Real

Skedari `backend/services/NotificationService.js` ekziston në projekt por përmban vetëm deklarata `console.log`. Nuk është i lidhur me asnjë rrugë, kontrollues, apo kanal real njoftimesh (email, SMS, push). Kjo krijon konfuzion — një zhvillues që lexon kodin mund të presë që ai të funksionojë, vetëm për të zbuluar se nuk bën asgjë. Për më tepër, skedari nuk thirret askund në projekt — asnjë kontrollues apo shërbim nuk e importon.

---

## 4. Tri Përmirësimet që Do të Implementohen

### Përmirësimi 1 — Rregullimi dhe Harmonizimi i Testeve

**Problemi:**  
`serviceService.test.js` thërret emra metodash joekzistente (`svc.add()`, `svc.list()`, `svc.findById()`). Testet do të dështojnë menjëherë kur ekzekutohen me `npm test`. Teste që nuk ekzekutohen realisht japin një ndjenjë të rreme sigurie — beson se kodi është testuar, por nuk është.

**Zgjidhja:**  
Do të përditësoj të gjitha thirrjet e testeve që të përputhen me emrat e metodave reale në `ServiceService.js` (`createService()`, `getAllServices()`, `getServiceById()`). Do të rishkruaj rastet e testit që të përdorin `async/await` meqë shërbimi është asinkron. Do të shtoj teste për `AuthService` (regjistrim, hyrje, email i duplikuar) dhe do të konfigurojë `package.json` të ekzekutojë testet me `jest`.

**Pse ka rëndësi:**  
Testet janë mjeti më i rëndësishëm për kapjen e regresioneve — gabimeve të futura kur ndryshon kod ekzistues. Nëse testet janë të prishura, ato nuk ofrojnë asnjë mbrojtje. Rregullimi i tyre do të thotë se ndryshimet e ardhshme të kodit mund të verifikohen automatikisht, duke reduktuar mundësinë e prishjes së diçkaje që ka funksionuar më parë.

---

### Përmirësimi 2 — Rregullimi i Jokonzistencës së Statusit të Rezervimit

**Problemi:**  
Backend-i dhe baza e të dhënave përdorin `'pending'`, `'confirmed'`, `'completed'`, `'cancelled'`. Frontend-i përdor `'Pending'`, `'Approved'`, `'Rejected'`, `'Completed'`. Vlerat nuk përputhen. Shiritat e statusit do të kenë gjithmonë ngjyrën e paracaktuar gri, dhe butonat e veprimit të ofruesit dërgojnë vlera statusi të pavlefshme tek API.

**Zgjidhja:**  
Do të standardizoj sipas vlerave të backend-it. Do të përditësoj `BookingsPage.js` në frontend që të përdorë vlerat e sakta me shkronja të vogla (`pending`, `confirmed`, `completed`, `cancelled`) dhe do të ndryshoj butonat e veprimit të statusit që të dërgojnë `'confirmed'` në vend të `'Approved'` dhe `'cancelled'` në vend të `'Rejected'`. Do të përditësoj gjithashtu `STATUS_COLORS` për të përputhur me vlerat e sakta.

**Pse ka rëndësi:**  
Konsistenca e të dhënave ndërmjet frontend-it dhe backend-it është themelore. Kur ato nuk pajtohen, funksionet duken të funksionojnë gjatë zhvillimit por dështojnë në mënyrë të heshtur në prodhim. Një rezervim që duhet të shfaqet si "Confirmed" do të shfaqet gri dhe pa stil, dhe butonat e veprimit të ofruesit do të dërgojnë vlera statusi të pavlefshme tek API.

---

### Përmirësimi 3 — Plotësimi i Dokumentacionit Teknik të Mungueshëm në README

**Problemi:**  
README aktualisht përshkruan konceptin dhe arkitekturën e projektit, por i mungon i gjithë informacioni teknik praktik që u nevojitet zhvilluesve për ta ekzekutuar projektin. Konkretisht:
- Nuk ka asnjë përshkrim të variablave të detyrueshme `.env` (p.sh. `DB_HOST`, `DB_PASSWORD`, `JWT_SECRET`, `USE_DB`) — një zhvillues që klonon repository-n nuk di çfarë të vendosë në skedarin `.env`
- Udhëzimet e konfigurimit tregojnë vetëm `node server.js`, por projekti tani kërkon edhe një bazë të dhënash PostgreSQL dhe aplikimin e skemës — ai hap nuk është dokumentuar askund
- Nuk ka listë të endpoint-eve të API, ndaj është e pamundur të testohet backend-i pa lexuar të gjithë skedarët e rrugëve manualisht
- README ende thotë "integrimi me PostgreSQL është i planifikuar" ndërkohë që ai tashmë është implementuar plotësisht

**Zgjidhja:**  
Do të shtojë një seksion **Konfigurimi & Instalimi** në README që përfshin: një tabelë të të gjitha variablave të mjedisit me qëllimin dhe vlerat shembull, hapat për të aplikuar skemën e bazës së të dhënave, dhe një tabelë përmbledhëse të endpoint-eve kryesore të API (metoda, shtegu, autentikimi i kërkuar). Përmbajtja ekzistuese e përshkrimit të projektit do të mbetet e pandryshuar — vetëm seksionet teknike të munguara do t'i shtojë.

**Pse ka rëndësi:**  
Një README që nuk mund të udhëzojë dikë drejt një konfigurimi lokal punues është dokumentacion i paplotë. Kjo nuk ka lidhje me gjuhën — bëhet fjalë për informacionin teknik që mungon tërësisht. Çdo rishikues, shok klase, apo punëdhënës i ardhshëm që klonon këtë repository nuk do të jetë në gjendje ta ekzekutojë pa lexuar kodin burimor.

---

## 5. Një Pjesë që Nuk e Kuptoj Plotësisht Akoma

### Sjellja e middleware-it `attachDemoUser` në rrugët publike

Në `authMiddleware.js`, ekziston një funksion i quajtur `attachDemoUser`. Ai përdoret në rrugët GET për shërbime — nëse një token i vlefshëm Bearer është i pranishëm, e dekodon dhe e bashkëngjet përdoruesin; përndryshe vendos një përdorues të paracaktuar mysafir (`{ id: 0, role: 'customer' }`).

Ajo që nuk e kuptoj plotësisht është *pse* rrugët kanë nevojë për një objekt të paracaktuar përdoruesi kur nuk ka autentikim. Nëse shoh `serviceController.js`, kontrolluesi përdor `req.user.role` për të vendosur nëse një ofrues lejohet të përditësojë një shërbim — por për rrugët GET, ai kontroll nuk zbatohet kurrë. Kështu pyetja ime është: **çfarë në kod lexon realisht objektin mysafir `req.user` të vendosur nga `attachDemoUser` në një kërkesë GET, dhe a do të digjej diçka nëse middleware-i thjesht do të hiqej nga ato rrugë?**

E kuptoj qëllimin (të ruajë një formë konsistente të `req.user` në të gjitha rrugët), por nuk jam e sigurt nëse ka kod tjetër diku që varet nga ky sjellje dhe që nuk e kam gjetur, apo nëse është thjesht një konventë mbrojtëse. Kuptimi i kompozimit të middleware — kur middleware-i është vërtet i nevojshëm kundrejt atij mbrojtës — është diçka që dua ta hetoj më thellë.


