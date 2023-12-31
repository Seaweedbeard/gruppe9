import pool from "./mysql-pool";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { Tag } from "./tag-service";
import { Sporsmal } from "./sporsmal-service";

export type SporsmalTag = {
	sporsmalid: number;
	tagid: number;
};

class SporsmalTagService {
	/**
	 * Get question with given id.
	 */
	getTagsForSporsmal(sporsmalid: number) {
		//Gets all tags for a question
		return new Promise<Tag[]>((resolve, reject) => {
			pool.query(
				"SELECT t.tagid, t.navn, t.forklaring FROM Tag t JOIN SporsmalTag s ON t.tagid = s.tagid WHERE s.sporsmalid = ?",
				[sporsmalid],
				(error, results: RowDataPacket[]) => {
					if (error) return reject(error);

					const roundedResults = results.map((result) => {
						return {
							...result,
						};
					});

					resolve(roundedResults as Tag[]);
				}
			);
		});
	}
	/**
	 * Get all questions.
	 */
	getSporsmalForTags(tagid: number) {
		//Gets all questions for a tag
		return new Promise<Sporsmal[]>((resolve, reject) => {
			pool.query(
				"SELECT s.sporsmalid, s.tittel, s.innhold, s.poeng, UNIX_TIMESTAMP(s.dato), UNIX_TIMESTAMP(s.sistendret), s.bestsvarid, s.ersvart FROM Sporsmal s JOIN SporsmalTag st ON s.sporsmalid = st.sporsmalid WHERE tagid = ?",
				[tagid],
				(error, results: RowDataPacket[]) => {
					if (error) return reject(error);

					const roundedResults = results.map((result) => {
						return {
							...result,
						};
					});

					resolve(roundedResults as Sporsmal[]);
				}
			);
		});
	}

	/**
	 * Create new question having the given title.
	 *
	 * Resolves the newly created question id.
	 */
	createRelation(sporsmalid: Number, tagid: Number) {
		return new Promise<number>((resolve, reject) => {
			//check if relation already exists
			pool.query(
				"SELECT * FROM SporsmalTag WHERE sporsmalid = ? AND tagid = ?",
				[sporsmalid, tagid],
				(error, results: RowDataPacket[]) => {
					if (error) return reject(error);
					if (results.length > 0) reject("Relasjon eksisterer allerede");
				}
			);

			//check if tag and sporsmal with respective ID's exist
			pool.query(
				"SELECT * FROM Tag WHERE tagid = ?",
				[tagid],
				(error, results: RowDataPacket[]) => {
					if (error) return reject(error);
					if (results.length == 0) reject("Tag eksisterer ikke");
				}
			);
			pool.query(
				"SELECT * FROM Sporsmal WHERE sporsmalid = ?",
				[sporsmalid],
				(error, results: RowDataPacket[]) => {
					if (error) return reject(error);
					if (results.length == 0) reject("Sporsmal eksisterer ikke");
				}
			);

			pool.query(
				"INSERT INTO SporsmalTag(sporsmalid, tagid) VALUES (?, ?) ",
				[sporsmalid, tagid],
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
	 * Delete question with given id.
	 *
	 * Deleting a question will also delete all answers to that question.
	 */
	deleteRelation(sporsmalid: number, tagid: number) {
		return new Promise<void>((resolve, reject) => {
			pool.query(
				"DELETE FROM SporsmalTag WHERE sporsmalid = ? AND tagid = ?",
				[sporsmalid, tagid],
				(error, results: ResultSetHeader) => {
					if (error) return reject(error);
					if (results.affectedRows == 0) reject(new Error("Ingen rad slettet"));

					resolve();
				}
			);
		});
	}
}

const sporsmalTagService = new SporsmalTagService();
export default sporsmalTagService;
