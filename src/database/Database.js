import SQLite from 'react-native-sqlite-storage';
import config from '../config/config';
import { onError } from '../services/ErrorService';

SQLite.enablePromise(true);

const database_name = 'Reactoffline.db';
const database_version = '1.0';
const database_displayname = 'SQLite React Offline Database';
const database_size = 10000000;

export class UserLocationsDatabase {
  initDB() {
    let db;
    return new Promise(async (resolve, reject) => {
      try {
        await SQLite.echoTest();

        const DB = await SQLite.openDatabase(
          database_name,
          database_version,
          database_displayname,
          database_size
        );

        db = DB;

        await db.executeSql('CREATE TABLE IF NOT EXISTS Samples (lat,long,accuracy,startTime,endTime,geoHash,wifiHash,hash);');

        resolve(db);
      } catch (error) {
        reject(error);
        onError({ error });
      }
    });
  }

  listSamples() {
    return new Promise(async (resolve) => {
      try {
        const db = await this.initDB();

        db.transaction(async (tx) => {
          try {
            const [_, results] = await tx.executeSql('SELECT * FROM Samples', []);

            const samples = [];
            const len = results.rows.length;

            for (let i = 0; i < len; i++) {
              const row = results.rows.item(i);
              samples.push(row);
            }

            resolve(samples);
          } catch (error) {
            onError({ error });
          }
        });
      } catch (error) {
        onError({ error });
      }
    });
  }

  updateLastSampleEndTime(endTime) {
    return new Promise(async (resolve) => {
      try {
        const db = await this.initDB();

        db.transaction(async (tx) => {
          try {
            const [_, results] = await tx.executeSql(`UPDATE Samples set endTime=${endTime} WHERE rowid=(SELECT MAX(rowid) from Samples)`);

            if (results.rows.length > 0) {
              const row = results.rows.item(0);
              resolve(row);
            } else {
              resolve(null);
            }
          } catch (error) {
            onError({ error });
          }
        });
      } catch (error) {
        onError({ error });
      }
    });
  }

  addSample(sample) {
    return new Promise(async (resolve) => {
      try {
        const db = await this.initDB();

        db.transaction(async (tx) => {
          try {
            const [_, results] = await tx.executeSql('INSERT INTO Samples VALUES (?,?,?,?,?,?,?,?)', [sample.lat, sample.long, sample.accuracy, sample.startTime, sample.endTime, sample.geoHash, sample.wifiHash, sample.hash]);
            resolve(results);
          } catch (error) {
            onError({ error });
          }
        });
      } catch (error) {
        onError({ error });
      }
    });
  }

  insertBulkSamples(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.initDB();

        await db.transaction(async (tx) => {
          try {
            data = data.replace(/[()]/g, '').split(',');
            data = data.map(sample => isNaN(parseFloat(sample)) ? sample : parseFloat(sample));

            const numberOfBulks = Math.ceil(data.length / 800);
            const bulks = Array.from({ length: numberOfBulks }, (_, index) => data.slice(index * 800, (index + 1) * 800));

            await Promise.all(bulks.map((bulkData) => {
              const samples = Array.from({ length: bulkData.length / 8 }, () => '(?,?,?,?,?,?,?,?)').toString();
              return tx.executeSql(`INSERT INTO Samples VALUES ${samples}`, bulkData);
            }));

            resolve();
          } catch (error) {
            onError({ error });
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  purgeSamplesTable(timestamp) {
    return new Promise(async (resolve) => {
      try {
        const db = await this.initDB();

        db.transaction(async (tx) => {
          try {
            await tx.executeSql('DELETE FROM Samples WHERE endTime < ?', [timestamp]);
            resolve(true);
          } catch (error) {
            onError({ error });
          }
        });
      } catch (error) {
        onError({ error });
      }
    });
  }

  updateSamplesToUTC() {
    return new Promise(async (resolve) => {
      try {
        const db = await this.initDB();

        db.transaction(async (tx) => {
          try {
            const [_, results] = await tx.executeSql('UPDATE Samples set startTime = startTime - 7200000, endTime = endTime - 7200000');
            resolve(results);
          } catch (error) {
            onError({ error });
          }
        });
      } catch (error) {
        onError({ error });
      }
    });
  }

  getLastPointEntered() {
    return new Promise(async (resolve) => {
      try {
        const db = await this.initDB();

        db.transaction(async (tx) => {
          try {
            const [_, results] = await tx.executeSql('SELECT * from Samples WHERE rowid=(SELECT MAX(rowid) from Samples)');
            if (results.rows.length > 0) {
              const row = results.rows.item(0);
              resolve(row);
            } else {
              resolve(null);
            }
          } catch (error) {
            onError({ error });
          }
        });
      } catch (error) {
        onError({ error });
      }
    });
  }
}

export class IntersectionSickDatabase {
  initDB() {
    let db;
    return new Promise(async (resolve, reject) => {
      try {
        await SQLite.echoTest();

        const DB = await SQLite.openDatabase(
          database_name,
          database_version,
          database_displayname,
          database_size
        );

        db = DB;

        await db.executeSql('CREATE TABLE IF NOT EXISTS IntersectingSick (OBJECTID,Name,Place,Comments,fromTime,toTime,long,lat);');

        resolve(db);
      } catch (error) {
        reject(error);
        onError({ error });
      }
    });
  }

  listAllRecords() {
    return new Promise(async (resolve) => {
      try {
        const db = await this.initDB();

        db.transaction(async (tx) => {
          try {
            const [_, results] = await tx.executeSql('SELECT * FROM IntersectingSick', []);

            const IntersectingSick = [];
            const len = results.rows.length;

            for (let i = 0; i < len; i++) {
              const row = results.rows.item(i);
              IntersectingSick.push(row);
            }

            resolve(IntersectingSick);
          } catch (error) {
            onError({ error });
          }
        });
      } catch (error) {
        onError({ error });
      }
    });
  }

  containsObjectID(OBJECTID) {
    return new Promise(async (resolve) => {
      try {
        const db = await this.initDB();

        db.transaction(async (tx) => {
          try {
            const [_, results] = await tx.executeSql(`SELECT * FROM IntersectingSick WHERE OBJECTID =${OBJECTID}`);

            resolve(results.rows.length > 0);
          } catch (error) {
            onError({ error });
          }
        });
      } catch (error) {
        onError({ error });
      }
    });
  }

  addSickRecord(record) {
    return new Promise(async (resolve) => {
      try {
        const db = await this.initDB();

        db.transaction(async (tx) => {
          try {
            const [_, results] = await tx.executeSql('INSERT INTO IntersectingSick VALUES (?,?,?,?,?,?,?,?)',
              [
                record.properties.Key_Field,
                record.properties.Name,
                record.properties.Place,
                record.properties.Comments,
                record.properties.fromTime_utc,
                record.properties.toTime_utc,
                record.geometry.coordinates[config().sickGeometryLongIndex],
                record.geometry.coordinates[config().sickGeometryLatIndex]
              ]);

            resolve(results);
          } catch (error) {
            onError({ error });
          }
        });
      } catch (error) {
        onError({ error });
      }
    });
  }
}

// TODO see if relevant and remove if not/fix if does.
// export class WifiMacAddressDatabase {
//   initDB() {
//     let db;
//     return new Promise((resolve, reject) => {
//       SQLite.echoTest()
//         .then(() => {
//           SQLite.openDatabase(
//             database_name,
//             database_version,
//             database_displayname,
//             database_size
//           )
//             .then((DB) => {
//               db = DB;
//               db.executeSql('CREATE TABLE IF NOT EXISTS wifiTable (wifiHash, wifiList);')
//                 .then(() => { resolve(db); })
//                 .catch((error) => {
//                   console.log(error);
//                   reject(error);
//                 });
//             });
//         })
//         .catch((error) => {
//           console.log(error);
//         })
//         .catch((error) => {
//           console.log('echoTest failed - plugin not functional');
//         });
//     });
//   }
//
//   closeDatabase(db) {
//     if (db) {
//       db.close()
//         .catch((error) => {
//           // this.errorCB(error);
//           // TODO makes unhandled promise reject in addSample function - need to check why
//         });
//     }
//   }
//
//   listAllRecords() {
//     return new Promise((resolve) => {
//       this.initDB().then((db) => {
//         db.transaction((tx) => {
//           tx.executeSql('SELECT * FROM wifiTable', []).then(([tx, results]) => {
//             const IntersectingSick = [];
//             const len = results.rows.length;
//             for (let i = 0; i < len; i++) {
//               const row = results.rows.item(i);
//               IntersectingSick.push(row);
//             }
//             resolve(IntersectingSick);
//           });
//         }).then((result) => {
//           this.closeDatabase(db);
//         }).catch((err) => {
//           console.log(err);
//         });
//       }).catch((err) => {
//         console.log(err);
//       });
//     });
//   }
//
//   addWifiMacAddresses(record) {
//     return new Promise((resolve) => {
//       this.initDB().then((db) => {
//         db.transaction((tx) => {
//           tx.executeSql('INSERT INTO wifiTable VALUES (?,?)', [record.wifiHash, record.wifiList]).then(([tx, results]) => {
//             resolve(results);
//           });
//         }).then((result) => {
//           this.closeDatabase(db);
//         }).catch((err) => {
//           console.log(err);
//         });
//       }).catch((err) => {
//         console.log(err);
//       });
//     });
//   }
//
//   containsWifiHash(wifiHash) {
//     return new Promise((resolve) => {
//       this.initDB().then((db) => {
//         db.transaction((tx) => {
//           tx.executeSql('SELECT * FROM wifiTable WHERE wifiHash = ?', [wifiHash]).then(([tx, results]) => {
//             resolve(results.rows.length > 0);
//           });
//         }).then((result) => {
//           this.closeDatabase(db);
//         }).catch((err) => {
//           console.log(err);
//         });
//       }).catch((err) => {
//         console.log(err);
//       });
//     });
//   }
// }
