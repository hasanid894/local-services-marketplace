const readline = require('readline');
const FileRepository = require('../repositories/FileRepository');
const ServiceService = require('../services/ServiceService');
const Service = require('../models/Service');
const path = require('path');

const repo = new FileRepository(
  path.join(__dirname, '../data/csv/services.csv'),
  Service.fromCSV,
  Service.csvHeader
);

const service = new ServiceService(repo);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function menu() {
  console.log('\n1.List  2.Add  3.Find  4.Update  5.Delete  0.Exit');
  rl.question('Choose: ', handle);
}

function handle(opt) {
  switch (opt) {
    case '1':
      rl.question('Filter category (optional): ', category => {
        rl.question('Filter location (optional): ', location => {
          const result = service.list({ category, location });
          console.log(result);
          menu();
        });
      });
      return;

    case '2':
      rl.question('Title: ', title => {
        rl.question('Price: ', price => {
          try {
            console.log(service.createService({
              providerId: 1,
              title,
              description: '',
              category: 'General',
              location: 'Kosovo',
              price: Number(price)
            }));
          } catch (e) {
            console.log(e.message);
          }
          menu();
        });
      });
      break;

    case '3':
      rl.question('ID: ', id => {
        console.log(service.findById(id));
        menu();
      });
      break;

    case '4':
      rl.question('ID: ', id => {
        rl.question('New title: ', title => {
          try {
            console.log(service.updateService(id, { title }));
          } catch (e) {
            console.log(e.message);
          }
          menu();
        });
      });
      break;

    case '5':
      rl.question('ID: ', id => {
        try {
          console.log(service.deleteService(id));
        } catch (e) {
          console.log(e.message);
        }
        menu();
      });
      break;

    case '0':
      rl.close();
      break;

    default:
      menu();
  }
}

menu();