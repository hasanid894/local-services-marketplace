# Implementimi

Ky file përshkruan atë që kam zbatuar në projekt, si funksionon në praktikë dhe pse u bënë disa zgjedhje

## Çfarë ndërtova?

Kam përdorur `Service` si model kryesor dhe lidha gjithçka përmes të njëjtës rrjedhë:

`UI -> Service layer -> Repository -> CSV file`

Mbajta të dyja ndërfaqet(interfaces) aktive:

- menyja e konsolës në `backend/ui/menu.js`
- ndërfaqja web në `frontend/src/App.js`

Të dyja përdorin të njëjtën logjikë backend/service, kështu që sjellja është konsistente.

## Service model dhe ruajtja e të dhënave

Modeli është në `backend/models/Service.js` dhe ka këto fusha:

- `id`
- `providerId`
- `title`
- `description`
- `category`
- `location`
- `price`
- `status`
- `createdAt`

Të dhënat ruhen në CSV (`backend/data/csv/services.csv`) përmes njëgeneric File Repository(`backend/repositories/FileRepository.js`).

Metodat e përdorura të depozitimit(repository):

- `getAll()`
- `getById(id)`
- `add(entity)`
- `save()`
- `update(id, updatedData)`
- `delete(id)`

Pse e implementova kështu:

- e lehtë për t’u testuar pa një bazë të dhënash
- ndarje e qartë midis logjikës së biznesit dhe qëndrueshmërisë
- Repository e ripërdorshme edhe për modele të tjera

## Logjika e Service layer

Logjika kryesore është në `backend/services/ServiceService.js`.

Metodat kryesore:

- `list(filter)`
- `add(data)`
- `findById(id)`

Metoda shtesë:

- `updateService(id, data)`
- `deleteService(id)`

Validimi aktualisht i zbatuar:

- titulli/emri nuk mund të jetë bosh
- çmimi duhet të jetë më i madh se 0

Filtrimi mbështet kategorinë/vendndodhjen/ofruesin. Përputhja e kategorisë dhe vendndodhjes nuk është e ndjeshme ndaj shkronjave të mëdha dhe tolerohet (tekst i pjesshëm).

Shërbimi merr repository nëpërmjet konstruktorit (dependency injection), kështu që unë mund të ndërroj storage-n më vonë pa rishkruar logjikën e shërbimit.

## API dhe controller flow

Service endpoints janë në `backend/routes/serviceRoutes.js` dhe `backend/controllers/serviceController.js`:

- `GET /api/services`
- `GET /api/services/:id`
- `POST /api/services`
- `PUT /api/services/:id`
- `DELETE /api/services/:id`

Controllers e thërrasin service, dhe service e thërret repository.Nuk ka qasje të drejtpërdrejtë në skedarë nga ndërfaqja e përdoruesit.

## Console UI

Menuja e konsolës në `backend/ui/menu.js` mbështet:

1. list (with optional filter input)
2. add
3. find by id
4. update
5. delete
0. exit

Kjo është e dobishme për testim të shpejtë dhe verifikim të plotë të CRUD pa browsing tools.

## Frontend UI

Ndërfaqja web (`frontend/src/App.js` + `frontend/src/App.css`) mbështet:

- listimin e shërbimeve
- filtrimin sipas kategorisë/vendndodhjes
- gjetjen sipas ID-së
- shtimin/përditësimin/fshirjen
- statusin e dukshëm të lidhjes së backend-it

## Role behavior (demo-safe RBAC)

Fillimisht, të gjithë perdoruesit mund të ndryshonin shërbimet sepse CRUD ishte objektivi i parë.
Pas kësaj, shtova kufizime rolesh për ta bërë sjelljen më të afërt me një treg të vërtetë.

Middleware: `backend/middleware/authMiddleware.js`

Titujt e demove aktuale:

- `x-user-role`: `customer`, `provider`, `admin`
- `x-user-id`: numeric id

Rregullat tani:

- `klient`: vetëm për lexim të shërbimeve
- `ofrues`: mund të krijojë/përditësojë/fshijë vetëm shërbimet e veta
- `administrator`: akses i plotë

Frontend përfshin një role/user switcher kështu që kjo veqori mund të testohet shpejt.

Pse kjo qasje:

- e mban implementimin të thjeshtë dhe transparent
- zbaton lejet në backend (jo vetëm fshehjen e UI)
- e lehtë për t'u zëvendësuar më vonë me autentifikim JWT

## Si të ekzekutohet:

Backend API:

```bash
cd backend
npm install
npm start
```

Backend console menu:

```bash
cd backend
npm run menu
```

Frontend:

```bash
cd frontend
npm install
npm start
```

Root shortcuts:

```bash
npm run backend
npm run frontend
```

## Screenshots per verifikim 

## Console menu me opsionet list/add/find/update/delete:
<img width="1041" height="233" alt="image" src="https://github.com/user-attachments/assets/157cce9e-d78e-42aa-899b-011acc3f06d2" />
Kur zgjedhet opsioni 1:

<img width="1056" height="753" alt="image" src="https://github.com/user-attachments/assets/9cb9c280-c854-4393-9c70-69cbd0632a77" />
<img width="1176" height="630" alt="image" src="https://github.com/user-attachments/assets/0977f968-8573-4a00-a819-1ce84a7c9527" />
<img width="1127" height="670" alt="image" src="https://github.com/user-attachments/assets/2313f7bf-a161-41de-8a52-e34c574d0e68" />

Opsioni 2:

<img width="718" height="414" alt="image" src="https://github.com/user-attachments/assets/f531b3c6-20d7-4720-b8e4-4edc325d1a5d" />

Opsioni 3:

<img width="679" height="378" alt="image" src="https://github.com/user-attachments/assets/bd7e9e17-3f13-4020-9f93-1e2a9b259fdc" />

Opsioni 4:

<img width="735" height="412" alt="image" src="https://github.com/user-attachments/assets/60327665-6f07-4b84-9442-6f6eef2b1024" />

Opsioni 5:

<img width="761" height="127" alt="image" src="https://github.com/user-attachments/assets/643eeb6c-affd-4d12-8bfb-671ba2090ff7" />



## Frontend list + filter + add/update/delete 
<img width="991" height="837" alt="image" src="https://github.com/user-attachments/assets/dfb92b72-3d1f-4277-8125-968c5f85cd5d" />
<img width="1034" height="853" alt="image" src="https://github.com/user-attachments/assets/3f0d5b5c-d5a9-4ba5-bd09-bf37a7350a2d" />
<img width="992" height="799" alt="image" src="https://github.com/user-attachments/assets/7024f5bb-487a-4b31-8a95-210ce782fe98" />


## Role switch behavior (customer vs provider/admin)
<img width="1044" height="505" alt="image" src="https://github.com/user-attachments/assets/0c06969d-9e66-4794-9052-26d7df510779" />
<img width="1062" height="836" alt="image" src="https://github.com/user-attachments/assets/f77de987-67c0-4726-87e5-379e4e62aaf4" />
<img width="1024" height="867" alt="image" src="https://github.com/user-attachments/assets/f8e1a756-7f96-46a5-a6b1-4e8c03a33e95" />

Admini gjithashtu mund të përditësojë/fshijë të gjitha shërbimet ekzistuese, siç tregohet në screenshots  të mëparshme.
