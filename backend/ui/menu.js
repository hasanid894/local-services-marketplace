const readline = require('readline');
const FileRepository = require('../repositories/FileRepository');
const DatabaseRepository = require('../repositories/DatabaseRepository');
const ServiceService = require('../services/ServiceService');
const Service = require('../models/Service');
const path = require('path');

// ─── Repository selection (mirrors serviceController.js config) ────────────
function createRepository() {
  if (process.env.USE_DB === 'true') {
    console.log('[Config] USE_DB=true → using DatabaseRepository (in-memory skeleton).');
    return new DatabaseRepository('services');
  }
  return new FileRepository(
    path.join(__dirname, '../data/csv/services.csv'),
    Service.fromCSV,
    Service.csvHeader
  );
}

const repo = createRepository();
const service = new ServiceService(repo);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function menu() {
  console.log('\n─────────────────────────────────────────');
  console.log('  Local Services Marketplace — Console UI');
  console.log('─────────────────────────────────────────');
  console.log('  1. List services');
  console.log('  2. Add service');
  console.log('  3. Find by ID');
  console.log('  4. Update service');
  console.log('  5. Delete service');
  console.log('  0. Exit');
  console.log('─────────────────────────────────────────');
  rl.question('Choose an option: ', handle);
}

function handle(opt) {
  switch (opt.trim()) {
    // ── 1. List ────────────────────────────────────────────────────────────
    case '1':
      rl.question('Filter by category (leave blank for all): ', category => {
        rl.question('Filter by location (leave blank for all): ', location => {
          try {
            const result = service.list({ category, location });
            if (result.length === 0) {
              console.log('No services found matching your filters.');
            } else {
              console.log(`\nFound ${result.length} service(s):`);
              result.forEach(s =>
                console.log(`  [${s.id}] ${s.title} — ${s.category} — ${s.location} — €${s.price}`)
              );
            }
          } catch (e) {
            console.log(`Error: ${e.message}`);
          }
          menu();
        });
      });
      return;

    // ── 2. Add ─────────────────────────────────────────────────────────────
    case '2':
      rl.question('Title: ', title => {
        rl.question('Price: ', priceInput => {
          // Case 2: user types "abc" for price → clear message, no crash
          const parsedPrice = Number(priceInput);
          if (!priceInput.trim() || isNaN(parsedPrice)) {
            console.log('Error: Please enter a valid number for price.');
            return menu();
          }

          rl.question('Category (optional): ', category => {
            rl.question('Location (optional): ', location => {
              try {
                const created = service.createService({
                  providerId: 1,
                  title,
                  description: '',
                  category: category || 'General',
                  location: location || 'Kosovo',
                  price: parsedPrice
                });
                console.log('Service created:', created);
              } catch (e) {
                console.log(`Error: ${e.message}`);
              }
              menu();
            });
          });
        });
      });
      return;

    // ── 3. Find ────────────────────────────────────────────────────────────
    case '3':
      rl.question('Enter ID: ', idInput => {
        // Case 3: invalid / non-numeric ID input
        const id = Number(idInput);
        if (!idInput.trim() || isNaN(id) || !Number.isInteger(id) || id <= 0) {
          console.log('Error: Please enter a valid ID (positive integer).');
          return menu();
        }
        try {
          const found = service.findById(id);
          if (!found) {
            console.log(`Item not found: no service with id ${id}.`);
          } else {
            console.log(found);
          }
        } catch (e) {
          console.log(`Error: ${e.message}`);
        }
        menu();
      });
      return;

    // ── 4. Update ──────────────────────────────────────────────────────────
    case '4':
      rl.question('Enter ID to update: ', idInput => {
        const id = Number(idInput);
        if (!idInput.trim() || isNaN(id) || !Number.isInteger(id) || id <= 0) {
          console.log('Error: Please enter a valid ID (positive integer).');
          return menu();
        }
        rl.question('New title (leave blank to keep current): ', titleInput => {
          rl.question('New price (leave blank to keep current): ', priceInput => {
            const updateData = {};
            if (titleInput.trim()) updateData.title = titleInput.trim();

            if (priceInput.trim()) {
              const parsedPrice = Number(priceInput);
              if (isNaN(parsedPrice)) {
                console.log('Error: Please enter a valid number for price.');
                return menu();
              }
              updateData.price = parsedPrice;
            }

            try {
              const updated = service.updateService(id, updateData);
              console.log('Service updated:', updated);
            } catch (e) {
              console.log(`Error: ${e.message}`);
            }
            menu();
          });
        });
      });
      return;

    // ── 5. Delete ──────────────────────────────────────────────────────────
    case '5':
      rl.question('Enter ID to delete: ', idInput => {
        const id = Number(idInput);
        if (!idInput.trim() || isNaN(id) || !Number.isInteger(id) || id <= 0) {
          console.log('Error: Please enter a valid ID (positive integer).');
          return menu();
        }
        try {
          const result = service.deleteService(id);
          console.log(result.message);
        } catch (e) {
          console.log(`Error: ${e.message}`);
        }
        menu();
      });
      return;

    // ── 0. Exit ────────────────────────────────────────────────────────────
    case '0':
      console.log('Goodbye!');
      rl.close();
      break;

    default:
      console.log('Invalid option. Please choose 0–5.');
      menu();
  }
}

menu();