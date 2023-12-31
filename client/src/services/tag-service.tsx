import axios from "axios";

axios.defaults.baseURL = "http://localhost:3000/api/v2";

export type Tag = {
	tagid: number;
	navn: string;
	forklaring: string;
	antall: number;
};

class TagService {

	getAll() {
		return axios.get<Tag[]>("/tag").then((response) => response.data);
	}

	getTag(tagid: number) {
		return axios.get<Tag>(`/tag/${tagid}`).then((response) => response.data);
	}

	createTag(navn: string, forklaring: string) {
		return axios
			.post<{ tag: Tag }>("/tag", {
				navn: navn,
				forklaring: forklaring,
			})
			.then((response) => response.data);
	}

	updateTag(tag: Tag) {
		return axios
			.put<Tag>(`/tag/`, {
				tagid: tag.tagid,
				navn: tag.navn,
				forklaring: tag.forklaring,
			})
			.then((response) => response.data);
	}

	deleteTag(tagid: number) {
		return axios.delete("/tag/" + tagid).then((response) => response.data);
	}
}

const tagService = new TagService();
export default tagService;
