import express from "express";
import svarService from "./svar-service";
import FavorittService from "./favoritt-service";

/**
 * Express router containing task methods.
 */
const router = express.Router();

router.get("/sporsmal/:sporsmalid/svar", (request, response) => {
	const sporsmalid: number = Number(request.params.sporsmalid);
	svarService
		.getAll(sporsmalid)
		.then((rows) => response.send(rows))
		.catch((error) => response.status(500).send(error));
});

router.get("/sporsmal/:sporsmalid/svar/:svarid", (request, response) => {
	const sporsmalid: number = Number(request.params.sporsmalid);
	const svarid: number = Number(request.params.svarid);
	svarService
		.get(sporsmalid, svarid)
		.then((svar) => {
			svar
				? response.send(svar)
				: response.status(404).send("Svar ikke funnet");
		})
		.catch((error) => response.status(500).send(error));
});

// Example request body: { title: "Ny oppgave" }
// Example response body: { id: 4 }
router.post("/sporsmal/:sporsmalid/svar", (request, response) => {
	if (request.params.sporsmalid != request.body.sporsmalid)
		response.status(400).send("Sporsmalid in url and body does not match");
	const data = request.body;
	const roundedDate = new Date(Math.floor(Date.now() / 1000) * 1000);
	data.dato = new Date(roundedDate);
	data.sistendret = new Date(roundedDate);
	if (data && data.svartekst && data.svartekst.length != 0)
		svarService
			.create(data)
			.then((id) => response.send({ id: id }))
			.catch((error) => {
				response.status(500).send(error);
			});
	else response.status(400).send("Mangler svar tekst");
});

router.put("/sporsmal/:sporsmalid/svar", (request, response) => {
	const data = request.body[0];
	const updateTime = request.body[1];
	if (
		typeof data.svarid == "number" &&
		typeof data.svartekst == "string" &&
		data.svartekst.length > 0 &&
		typeof data.poeng == "number" &&
		typeof data.sporsmalid == "number"
	) {
		svarService
			.update(data, updateTime)
			.then(() => response.send())
			.catch((error) => response.status(500).send(error));
	} else response.status(400).send("Savner kommentar id");
});

router.delete("/sporsmal/:sporsmalid/svar/:svarid", (request, response) => {
	const svarid: number = Number(request.params.svarid);
	svarService
		.delete(svarid)
		.then((_result) => {
			response.send();
			FavorittService.getAll().then((svar: any) => {
				if (svar.some((svar: any) => svar.svarid === svarid)) {
					FavorittService.delete(svarid); //delete from favoritt table if svar exists
				}
			});
		})
		.catch((error) => response.status(500).send(error));
});

export default router;
