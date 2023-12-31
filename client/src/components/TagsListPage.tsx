import * as React from "react";
import { ChangeEvent } from "react";
import { Component } from "react-simplified";
import { Card, Row, Column, Form, Button } from "../widgets";
import { Sporsmal } from "../services/sporsmal-service";
import tagService, { Tag } from "../services/tag-service";
import sporsmalTagService from "../services/sporsmalTag-service";
import { createHashHistory } from "history";
import AddTagCard from "./AddTagCard";

const history = createHashHistory();

interface TagListState {
	tags: Tag[];
	sporsmal: Sporsmal[];
	searchQuery: string;
}
class TagsList extends Component<{}, TagListState> {
	constructor(props: {}) {
		super(props);
		this.state = {
			tags: [],
			sporsmal: [],
			searchQuery: "",
		};
	}

	newTag: Tag = { tagid: 0, navn: "", forklaring: "", antall: 0 };

	sortTagByAntall = () => {
		this.setState((prevState) => {
			const sortedTags = [...prevState.tags].sort(
				(a, b) => b.antall - a.antall
			);
			return { tags: sortedTags };
		});
	};

	handleTagCreated = () => {
		tagService.getAll().then((tags: Tag[]) => this.setState({ tags }));
	};

	handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
		this.setState({ searchQuery: event.target.value });
	};

	handleDelete = (tag: Tag) => {
		tagService.deleteTag(tag.tagid);
		this.setState({
			tags: this.state.tags.filter((t) => t.tagid != tag.tagid),
		});
	};

	handleEdit = (tag: Tag) => {
		history.push("/tags/" + tag.tagid + "/edit");
	};

	render() {
		const { tags, searchQuery } = this.state;

		const filteredTags = tags.filter((tag) =>
			tag.navn.toLowerCase().includes(searchQuery.toLowerCase())
		);
		return (
			<>
				<Button.Success onClick={this.sortTagByAntall}>
					Sorter etter Antall Spørsmål
				</Button.Success>

				<Form.Input
					type="text"
					value={searchQuery}
					onChange={this.handleSearchChange}
					placeholder="Søk etter Tag"
				/>

				<Card title="Tagger">
					{filteredTags.map((tag: Tag) => (
						<Row key={tag.tagid}>
							<Column width={1}>{tag.tagid}</Column>
							<Column width={1}>{tag.navn}</Column>
							<Column width={1}>{tag.forklaring}</Column>
							<Column width={3}>{tag.antall + "x spørsmål"}</Column>
							<Column width={3}>
								<Button.Success
									onClick={() => {
										this.handleEdit(tag);
									}}
								>
									Rediger
								</Button.Success>
							</Column>
							<Column width={3}>
								<Button.Danger
									onClick={() => {
										this.handleDelete(tag);
									}}
								>
									Slett
								</Button.Danger>
							</Column>
						</Row>
					))}
				</Card>
				<AddTagCard onTagCreated={this.handleTagCreated} />
			</>
		);
	}

	componentDidMount() {
		tagService
			.getAll()
			.then((tags: Tag[]) => {
				const updatedTags: Tag[] = [];

				Promise.all(
					tags.map((tag: Tag) => {
						return sporsmalTagService
							.getSporsmalForTags(tag.tagid)
							.then((sporsmal: Sporsmal[]) => {
								tag.antall = sporsmal.length;
								updatedTags.push(tag);
							});
					})
				).then(() => {
					this.setState({ tags: updatedTags });
				});
			})
			.catch((error: Error) => {
				console.error(error);
			});
	}
}

export default TagsList;
