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

async function handle(opt) {
  switch (opt.trim()) {
    // ── 1. List ────────────────────────────────────────────────────────────
    case '1':
      rl.question('Filter by category ID (leave blank for all): ', async categoryId => {
        rl.question('Filter by location (leave blank for all): ', async location => {
          try {
            const filter = {};
            if (categoryId) filter.categoryId = Number(categoryId);
            if (location) filter.location = location;
            
            const result = await service.getAllServices(filter);
            if (result.length === 0) {
              console.log('No services found matching your filters.');
            } else {
              console.log(`\nFound ${result.length} service(s):`);
              result.forEach(s =>
                console.log(`  [${s.id}] ${s.title} — Category ID: ${s.categoryId} — ${s.location} — €${s.price}`)
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
          const parsedPrice = Number(priceInput);
          if (!priceInput.trim() || isNaN(parsedPrice)) {
            console.log('Error: Please enter a valid number for price.');
            return menu();
          }

          rl.question('Category ID (number): ', async categoryIdInput => {
            rl.question('Location (optional): ', async location => {
              try {
                const categoryId = Number(categoryIdInput) || 1; // Default to 1 if invalid
                const created = await service.createService({
                  providerId: 1,
                  categoryId,
                  title,
                  description: '',
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
      rl.question('Enter ID: ', async idInput => {
        const id = Number(idInput);
        if (!idInput.trim() || isNaN(id) || !Number.isInteger(id) || id <= 0) {
          console.log('Error: Please enter a valid ID (positive integer).');
          return menu();
        }
        try {
          const found = await service.getServiceById(id);
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
          rl.question('New price (leave blank to keep current): ', async priceInput => {
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
              const updated = await service.updateService(id, updateData);
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
      rl.question('Enter ID to delete: ', async idInput => {
        const id = Number(idInput);
        if (!idInput.trim() || isNaN(id) || !Number.isInteger(id) || id <= 0) {
          console.log('Error: Please enter a valid ID (positive integer).');
          return menu();
        }
        try {
          const result = await service.deleteService(id);
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