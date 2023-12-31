import * as React from "react";
import { Route, HashRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import SporsmalList from "./components/SporsmalList";
import SporsmalDetails from "./components/SporsmalDetailPage";
import SporsmalNew from "./components/SporsmalNewPage";
import SporsmalEdit from "./components/SporsmalEditPage";
import TagsList from "./components/TagsListPage";
import TagEdit from "./components/EditTagPage";
import FavoriteList from "./components/FavoriteListPage";
import Navigation from "./components/Navigation";
import SvarEdit from "./components/SvarEditPage";

let root = document.getElementById("root");
if (root)
	createRoot(root).render(
		<HashRouter>
			<div>
				<Navigation />
				<Route exact path="/" component={SporsmalList} />
				<Route path={"/sporsmal/:sporsmalid"} component={SporsmalDetails} />
				<Route path={"/rediger/:sporsmalid"} component={SporsmalEdit} />
				<Route exact path="/nyspor" component={SporsmalNew} />
				<Route path={"/edit/:sporsmalid/:svarid"} component={SvarEdit} />
				<Route exact path="/favs" component={FavoriteList} />
				<Route exact path="/tags" component={TagsList} />
				<Route path={"/tags/:tagid/edit"} component={TagEdit} />
			</div>
		</HashRouter>
	);
