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
      console.log(service.getAllServices());
      return menu();

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
        console.log(service.getServiceById(id));
        menu();
      });
      break;

    case '4':
      rl.question('ID: ', id => {
        rl.question('New title: ', title => {
          console.log(service.updateService(id, { title }));
          menu();
        });
      });
      break;

    case '5':
      rl.question('ID: ', id => {
        console.log(service.deleteService(id));
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