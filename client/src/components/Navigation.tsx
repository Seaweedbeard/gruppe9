import * as React from "react";
import { Component } from "react-simplified";
import { NavBar } from "../widgets";


class Navigation extends Component {
	render() {
		return (
			<>
				<NavBar brand="Forum">
					<NavBar.Link to="/">Spørsmål</NavBar.Link>
					<NavBar.Link to="/nyspor">Nytt Spørsmål</NavBar.Link>
					<NavBar.Link to="/favs">Favoritter</NavBar.Link>
					<NavBar.Link to="/tags">Tagger</NavBar.Link>
				</NavBar>
			</>
		);
	}
}

export default Navigation;
