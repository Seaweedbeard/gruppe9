import pool from './mysql-pool';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export type Svar = {
  svarid?: number; //svarid is handled by the database
  svartekst: string;
  poeng: number;
  sporsmalid: number;
  erbest: boolean;
  dato: Date;
  sistendret: Date;
  ersvar: boolean;
  svarsvarid?: number | null; //svarsvarid is based on if ersvar is true or false
};

class SvarService {
  /**
   * Get task with given id.
   */
  get(sporsmalid: number, svarid: number) {
    //Also use this to get comments.
    return new Promise<Svar | undefined>((resolve, reject) => {
      pool.query('SELECT svarid, svartekst, poeng, sporsmalid, erbest, UNIX_TIMESTAMP(dato) as dato, UNIX_TIMESTAMP(sistendret) as sistendret, ersvar, svarsvarid FROM Svar WHERE sporsmalid = ? AND svarid = ?;', [sporsmalid, svarid], (error, results: RowDataPacket[]) => {
        if (error) return reject(error);

        const roundedResults = results.map(result => {
          return {
            ...result,
            dato: new Date(result.dato * 1000),
            sistendret: new Date(result.sistendret * 1000),
          };
        });

        resolve(roundedResults[0] as Svar);
      });
    });
  }

  /**
   * Get all tasks.
   */
  getAll(sporsmalid: number) {
    return new Promise<Svar[]>((resolve, reject) => {
      pool.query('SELECT svarid, svartekst, poeng, sporsmalid, erbest, UNIX_TIMESTAMP(dato) as dato, UNIX_TIMESTAMP(sistendret) as sistendret, ersvar, svarsvarid FROM Svar WHERE sporsmalid = ?;', [sporsmalid], (error, results: RowDataPacket[]) => {
        if (error) return reject(error);

        const roundedResults = results.map(result => {
          return {
            ...result,
            dato: new Date(result.dato * 1000),
            sistendret: new Date(result.sistendret * 1000),
          };
        });

        resolve(roundedResults as Svar[]);
      });
    });
  }

  /**
   * Create new comment having the given title.
   *
   * Resolves the newly created task id.
   */
  create(svar: Svar) {
    const unixDato = Math.floor(svar.dato.getTime() / 1000);
    const unixSistendret = Math.floor(svar.sistendret.getTime() / 1000);

    return new Promise<number>((resolve, reject) => {
      pool.query('INSERT INTO Svar(svartekst, poeng, sporsmalid, erbest, dato, sistendret, ersvar, svarsvarid) VALUES (?, ?, ?, ?, FROM_UNIXTIME(?), FROM_UNIXTIME(?), ?, ?) ', [svar.svartekst, svar.poeng, svar.sporsmalid, svar.erbest, unixDato, unixSistendret, svar.ersvar, svar.svarsvarid], (error, results: ResultSetHeader) => {
        if (error) {
          return reject(error);
        }
        resolve(results.insertId);
      });
    });
  }

  /**
   * Updates a task with a given ID
   */
  update(svar: Svar) {
    const unixSistendret = Math.floor(new Date().getTime() / 1000);
    return new Promise<number>((resolve, reject) => {
      //dato will not change after initial insert, however sistendret updates for every change
      //Absolutely no need to edit sporsmalid, as a comment is tied to a sporsmalid
      //ersvar and svarsvarid should not be changed, as they are set on creation and will remain that way
      pool.query('UPDATE Svar SET svartekst=?, poeng=?, erbest=?, sistendret=FROM_UNIXTIME(?) WHERE svarid=?', [svar.svartekst, svar.poeng, svar.erbest, unixSistendret, svar.svarid], (error, results: ResultSetHeader) => {
        if (error) return reject(error);
        if (results.affectedRows == 0) reject(new Error('No row updated'));

        resolve(results.affectedRows);
      })
      })
    }

  /**
   * Delete task with given id.
   */
  delete(id: number) {
    return new Promise<void>((resolve, reject) => {
      pool.query('DELETE FROM Svar WHERE svarid = ?', [id], (error, results: ResultSetHeader) => {
        if (error) return reject(error);
        if (results.affectedRows == 0) reject(new Error('No row deleted'));

        resolve();
      });
    });
  }
}

const svarService = new SvarService();
export default svarService;