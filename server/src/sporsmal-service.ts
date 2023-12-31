import pool from "./mysql-pool";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import svarService from "./svar-service";
import sporsmalTagService from "./sporsmalTag-service";

export type Sporsmal = {
	sporsmalid?: number; //sporsmalid is handled by the database
	tittel: string;
	innhold: string;
	poeng: number;
	dato: Date;
	sistendret: Date;
	bestsvarid: number | null;
	ersvart: boolean;
};

class SporsmalService {
	/**
	 * Get question with given id.
	 */
	get(id: number) {
		//Also use this to get comments.
		return new Promise<Sporsmal | undefined>((resolve, reject) => {
			pool.query(
				"SELECT sporsmalid, tittel, innhold, poeng, UNIX_TIMESTAMP(dato) as dato, UNIX_TIMESTAMP(sistendret) as sistendret, bestsvarid, ersvart FROM Sporsmal WHERE sporsmalid = ?",
				[id],
				(error, results: RowDataPacket[]) => {
					if (error) return reject(error);

					const roundedResults = results.map((result) => {
						return {
							...result,
							dato: new Date(result.dato * 1000),
							sistendret: new Date(result.sistendret * 1000),
						};
					});

					resolve(roundedResults[0] as Sporsmal);
				}
			);
		});
	}
	/**
	 * Get all questions.
	 */
	getAll() {
		return new Promise<Sporsmal[]>((resolve, reject) => {
			pool.query(
				"SELECT sporsmalid, tittel, innhold, poeng, UNIX_TIMESTAMP(dato) as dato, UNIX_TIMESTAMP(sistendret) as sistendret, bestsvarid, ersvart FROM Sporsmal;",
				[],
				(error, results: RowDataPacket[]) => {
					if (error) return reject(error);

					const roundedResults = results.map((result) => {
						return {
							...result,
							dato: new Date(result.dato * 1000),
							sistendret: new Date(result.sistendret * 1000),
						};
					});

					resolve(roundedResults as Sporsmal[]);
				}
			);
		});
	}

	// getUnanswered() {
	//   return new Promise<Sporsmal[]>((resolve, reject) => {
	//     pool.query('SELECT sporsmalid, tittel, innhold, poeng, UNIX_TIMESTAMP(dato) as dato, UNIX_TIMESTAMP(sistendret) as sistendret, bestsvarid, ersvart FROM Sporsmal WHERE ersvart = 0;', [], (error, results: RowDataPacket[]) => {
	//       if (error) return reject(error);

	//       const roundedResults = results.map(result => {
	//         return {
	//           ...result,
	//           dato: new Date(result.dato * 1000),
	//           sistendret: new Date(result.sistendret * 1000),
	//         };
	//       });

	//       resolve(roundedResults as Sporsmal[]);
	//     });
	//   });
	// }

	/**
	 * Create new question having the given title.
	 *
	 * Resolves the newly created question id.
	 */
	create(sporsmal: Sporsmal) {
		const unixDato = Math.floor(sporsmal.dato.getTime() / 1000);
		const unixSistendret = Math.floor(sporsmal.sistendret.getTime() / 1000);

		return new Promise<number>((resolve, reject) => {
			pool.query(
				"INSERT INTO Sporsmal(tittel, innhold, poeng, dato, sistendret, bestsvarid, ersvart) VALUES (?, ?, ?, FROM_UNIXTIME(?), FROM_UNIXTIME(?), null, false) ",
				[
					sporsmal.tittel,
					sporsmal.innhold,
					sporsmal.poeng,
					unixDato,
					unixSistendret,
					null,
					false,
				],
				(error, results: ResultSetHeader) => {
					if (error) {
						return reject(error);
					}
					resolve(results.insertId);
				}
			);
		});
	}

	/**
	 * Updates a question with a given ID
	 */
	update(sporsmal: Sporsmal, updateTime: boolean) {
		const unixSistendret = updateTime
			? Math.floor(new Date().getTime() / 1000)
			: Math.floor(new Date(sporsmal.sistendret).getTime() / 1000);
		//const unixSistendret = Math.floor(new Date().getTime() / 1000);
		return new Promise<number>((resolve, reject) => {
			//dato will not change after initial insert, however sistendret updates for every change where updateTime = true.
			pool.query(
				"UPDATE Sporsmal SET tittel=?, innhold=?, poeng=?, sistendret=FROM_UNIXTIME(?), bestsvarid=? WHERE sporsmalid=?",
				[
					sporsmal.tittel,
					sporsmal.innhold,
					sporsmal.poeng,
					unixSistendret,
					sporsmal.bestsvarid,
					sporsmal.sporsmalid,
				],
				(error, results: ResultSetHeader) => {
					if (error) return reject(error);
					if (results.affectedRows == 0)
						reject(new Error("Ingen rad oppdatert"));

					//Checks if answer put as bestsvar exists. If not, returns an error.
					if (sporsmal.bestsvarid != null) {
						pool.query(
							"SELECT * FROM Svar WHERE svarid = ?",
							[sporsmal.bestsvarid],
							(error, results: RowDataPacket[]) => {
								if (error) return reject(error);
								if (results.length == 0)
									reject(new Error('Ingen svar funnet med gitt "bestsvarid"'));
							}
						);
					}

					resolve(results.affectedRows);
				}
			);
		});
	}

	/**
	 * Delete question with given id.
	 *
	 * Deleting a question will also delete all answers to that question.
	 */
	delete(sporsmalid: number) {
		return new Promise<void>((resolve, reject) => {
			pool.query(
				"DELETE FROM Sporsmal WHERE sporsmalid = ?",
				[sporsmalid],
				async (error, results: ResultSetHeader) => {
					if (error) return reject(error);
					if (results.affectedRows == 0) reject(new Error("Ingen rad slettet"));

					await svarService.delete(sporsmalid, true);
					pool.query('DELETE FROM SporsmalTag WHERE sporsmalid = ?', [sporsmalid]);

					resolve();
				}
			);
		});
	}
}

const sporsmalService = new SporsmalService();
export default sporsmalService;
