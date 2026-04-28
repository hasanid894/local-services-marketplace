# Demo Plan — Local Services Marketplace

**Autor:** Devlete Hasani  
**Fakulteti:** Fakulteti i Inxhinierisë Mekanike dhe Kompjuterike
**Data:** Prill 2026

---

## 1.Titulli i Projektit

**Local Services Marketplace**

Një platformë web full-stack që lidh klientët në Kosovë me ofrues lokalë të shërbimeve — hidraulikë, elektricistë, tutorë, pastrues dhe të tjerë.

---

## 2.Problemi që zgjidh platforma

Gjetja e një profesionisti të besueshëm në Kosovë është kryesisht informale — njerëzit mbështeten në fjalë goje, grupe në Facebook ose hamendësim. Nuk ekziston një vend qendror dhe transparent ku mund të:

- shfletohen lista të verifikuara të shërbimeve lokale,
- krahasohen çmimet dhe lexohen vlerësime reale nga klientët, ose
- rezervohet një ofrues dhe të ndiqet procesi i punës deri në përfundim.

Ky projekt e zëvendëson këtë proces informal me një treg dixhital të strukturuar ku çdo ndërveprim — nga zbulimi deri te rezervimi dhe vlerësimi — është i dukshëm, i bazuar në status dhe i përgjegjshëm.

---

## 3. Përdoruesit kryesorë

| Roli | Kush janë | Çfarë bëjnë |
|---|---|---|
| **Klienti** | Çdo person që kërkon shërbim lokal | Shfleton lista, krijon rezervime, lë vlerësime pas shërbimit |
| **Ofruesi i shërbimit** | Hidraulik, elektricist, tutor, pastrues, etj. | Publikon shërbime, pranon ose refuzon rezervime, ndërton reputacion përmes vlerësimeve |
| **Administratori** | Moderator i platformës | Ka qasje të plotë — menaxhon përdoruesit, rezervimet dhe mund të heqë vlerësime abuzive |

---

## 4. Flow për demonstrim

### Rrjedha e zgjedhur: Regjistrim → Hyrje → Shfletim → Rezervim → Ndjekje e statusit

**Hapat::**

1. Regjistrohet një llogari e re si **Customer** 
2. Log in → ridrejtim automatik në Dashboard-in e Klientit
3. Navigim në **Marketplace** → shfletim i shërbimeve, përdorim i filtrave sipas kategorisë/vendndodhjes
4. Klikim në **Book** për një shërbim → hapet formulari i rezervimit i parambushur (pa nevojë për ID manuale)
5. Zgjedhje e datës → konfirmim i rezervimit → shfaqet mesazh suksesi
6. Navigim ne **Bookings** → shfaqet rezervimi i ri me status `pending`
7. *(Kalimi në llogarinë e Provider* → aprovimi i rezervimit → statusi ndryshon në `confirmed`
8. Kthim te Customer → rifreskim → shfaqet statusi i përditësuar

**Pse ky flow?**

Përfshin të gjitha funksionalitetet kryesore në një rrugë të vetme: **autentikimi**, **zbulimi i shërbimeve**, **hyrja e të dhënave**, **kontrolli i qasjes sipas rolit** dhe i gjithë **cikli i rezervimit**. Është vlera thelbësore e platformës dhe zgjat më pak se 3 minuta gjatë demonstrimit live.

---

## 5.Një problem real i zgjidhur

### Problemi
Kartat statistikore në dashboard (“Active bookings”, “Completed”, “Awaiting response”) shfaqnin gjithmonë **zero**, edhe pse në databazë ekzistonin rezervime reale.

### Ku ndodhi
`CustomerDashboard.js` dhe `ProviderDashboard.js` — ne `useMemo` që numëron rezervimet sipas statusit.
### Shkaku
Frontend filtronte statuset me stringje në **Title Case** (`'Pending'`, `'Approved'`, `'Completed'`), ndërsa PostgreSQL dhe `BookingService` ruajnë statuset në **lowercase** (`'pending'`, `'confirmed'`, `'completed'`, `'cancelled'`).Për më tepër, UI përdorte `'Approved'` ndërsa backend përdor `'confirmed'`.

Për shkak se JavaScript është case-sensitive, `b.status === 'Pending'` nuk perputhej me `'pending'`, dhe rezultati ishte gjithmonë 0.

### Zgjidhja
I zëvendësova të gjitha statuset Title Case me versionet reale lowercase në të dy dashboard-et dhe u korrigjua `'Approved'` → `'confirmed'`. Gjithashtu i shtova klasat CSS `status-pill-confirmed` dhe `status-pill-cancelled` për shfaqjen e saktë të badge-ve.

**File të ndryshuara:** `CustomerDashboard.js`, `ProviderDashboard.js`, `App.css`

---

## 6. Çfarë ende duhet përmirësuar

### Konfirmimi i rezervimit — mungesë e njoftimeve

Kur një ofrues aprovon ose refuzon një rezervim, klienti nuk ka mënyrë të njoftohet në kohë reale përveçse duke rifreskuar manualisht faqen e Bookings. `NotificationService` ekziston në backend dhe është i integruar në container-in e varësive, por nuk dërgon ende njoftime reale.

Rregullimi do të kërkonte ose lidhjen e `NotificationService` me një ofrues email-i (p.sh. SendGrid ose Nodemailer) ose zbatimin e një etikete të thjeshtë njoftimi brenda aplikacionit që pyet `GET /api/notifications` në frontend. Modeli i të dhënave tashmë përfshin një tabelë `notifications` në skemën e bazës së të dhënave, kështu që shtresa e persistencës është gati - vetëm mekanizmi i shpërndarjes mungon.

---

## 7. Struktura e prezantimit (5–7 minuta)

| Segmenti | Kohëzgjatja | Përmbajtja |
|---|---|---|
| **Hyrje** | ~1 min | Çfarë është projekti, çfarë problemi zgjidh, kush e përdor |
| **Demo e drejtpërdrejtë** | ~3 min | Rrjedha e plotë: Regjistrim → Hyrje → Dashboard → Marketplace → Rezervim → Ndjekje |
| **Shpjegim teknik** | ~1 min | Arkitekturë e shtresuar Routes → Controllers → Services → Repositories → DB), DI container, modaliteti i ruajtjes së dyfishtë |
| **Problem + zgjidhje** | ~1 min | Gabimi i mospërputhjes së statusit: çfarë ishte, ku u fsheh, si e gjeta dhe e rregullova |
| **Përfundim** | ~30 sek | Çfarë ka ende nevojë për përmirësim (njoftimet e rezervimit), çfarë do të trajtoja më pas |

---

## 8. Part 3 - Gatishmëria për demo

### 8.1 Rrjedha e prezantimit

Më poshtë është rendi i saktë që do të ndjek gjatë demonstrimit të drejtpërdrejtë:

| # | Veprimi | Çfarë sheh audiencas |
|---|---|---|
| 1 | Hap aplikacionin në `http://localhost:3000` | Faqja kryesore — emri i projektit, seksioni i heroit, thirrja për veprim |
| 2 | Klikoni **Register** — plotësoni emrin, email-in, fjalëkalimin, rolin = Klient | Formulari i regjistrimit dorëzohet, JWT lëshohet, ridrejtohet në Panelin e Kontrollit |
| 3 | Shfaq **Dashboard** i klientit | Kartat e statistikave (rezervime aktive, të përfunduara, vlerësime), lidhje veprimi të shpejtë |
| 4 | Shko te **Marketplace** (Faqja e Shërbimeve) | Listat e shërbimeve  |
| 5 | Filtro sipas kategorisë| Lista ngushtohet në kohë reale — demonstron funksionin e filtrit |
| 6 | Klikoni **Book** në një sherbim | Faqja e rezervimit hapet e para-mbushur — nuk kërkohet hyrje manuale e ID |
| 7 | Zgjidhni një datë, klikoni **Confirm Booking** | Shfaqet success banner; rezervimi u ruajt me statusin `pending` |
| 8 | Shkoni te faqja **Bookings** | Karta e re e rezervimit është e dukshme me statusin `pending` |
| 9 | Dilni → hyni si **Provider** | Shfaqet Paneli i Ofruesit |
| 10 | Shkoni te **Bookings** → klikoni **Approve** | Statusi përditësohet në `confirmed`  menjëherë |
| 11 | Dilni → hyni përsëri si **Customer** | Faqja e Rezervimeve tregon se statusi tani lexon `confirmed` |
| 12 | Shkoni te **Reviews** | Shfaqje e vlerësimeve|

**Koha e vlerësuar për këtë segment demo të drejtpërdrejtë: afërsisht 3 minuta** (nga prezantimi total prej 5–7 minutash i përshkruar në Seksionin 7).

---

### 8.2 Backup Plan 

| Skenari | Veprimi |
|---|---|
| **PostgreSQL nuk punon** | Kalon në modalitetin CSV: vendos `USE_DB=false` në `backend/.env` dhe rinis me `node server.js`. Aplikacioni i plotë funksionon pa një bazë të dhënash. |
| **Backend nuk starton** | Hap `README.md` → Seksioni 4 (Fillimi) dhe kalo nëpër hapat e konfigurimit verbalisht. Shfaqni `docs/architecture.md` si një pamje vizuale të dizajnit të sistemit. |
| **Renia e frontendit ose faqja bosh** | Shfaqniscreenshots të përgatitura paraprakisht të secilës faqe (Faqja Kryesore, Shërbimet, Rezervimet, Paneli i Kontrollit, Shqyrtimet) të ruajtura lokalisht. Trego rrjedhën duke përdorur pamjet e ekranit. |
| **Rrjedha e rezervimit ndërpritet në mes të demo-s** | Kthehuni te llogaria e ofruesit të paracaktuar e cila tashmë ka rezervime të konfirmuara. Shfaqni listën e Rezervimeve dhe etiketat e statusit direkt pa krijuar një rezervim të ri drejtpërdrejt. |
| **Login dështon** | Përdorni llogaritë demo të krijuara paraprakisht, kredencialet e të cilave janë shënuar jashtë linje. Nëse auth është tërësisht i prishur, trego rrjedhën JWT në `AuthService.js` dhe kodin e middleware-it të auth direkt. |

---

### 8.3 Lista e Kontrollit

Përfunduar para prezantimit:

- [] Ekzekutova rrjedhën e plotë të demos (Register → Book → Approve → Confirm) te pakten nje here.
- [] Verifikova që ekzistojnë llogaritë demo të klientit dhe ofruesit dhe hyra saktë
- [] Konfirmova që të paktën 3 lista shërbimesh janë të dukshme në faqen e Marketplace.
- [] Konfirmova që të paktën 1 vlerësim është i dukshëm me emra të vërtetë (jo ID të papërpunuara)
- [] Testova modalitetin rezervë CSV (`USE_DB=false`) — aplikacioni funksionon pa PostgreSQL
- [] Mata kohën e seksionit të demonstrimit të drejtpërdrejtë — qëndron nën 3 minuta
- [] Ushtrova shpjegimin teknik të arkitekturës së shtresuar në një minutë
- [] Ushtrova shpjegimin e bug (mospërputhja e status case) në një minutë

---
