import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Component } from 'react-simplified';
import { Alert, Card, Row, Column, Form, Button, NavBar } from './widgets';
import sporsmalService, { Sporsmal } from './sporsmal-service';
import TagService, { Tag } from './tag-service';
import favorittService, { Favoritt } from './favoritt-service';
import { Link, NavLink } from 'react-router-dom';
import { HashRouter, Route } from 'react-router-dom';
import { createHashHistory } from 'history';

const history = createHashHistory(); // Use history.push(...) to programmatically change path


 class Navigation extends Component { 
    render() {
        return(<>
        <NavBar brand="Forum">
            <NavBar.Link to='/'>Spørsmål</NavBar.Link>
            <NavBar.Link to='/nyspor'>Nytt Spørsmål</NavBar.Link>
            <NavBar.Link to='/favs'>Favoritter</NavBar.Link>
            <NavBar.Link to='/tags'>Tags</NavBar.Link>

        </NavBar>
        
        </>)
    }


 }


class SporsmalList extends Component {
  sporsmaler: Sporsmal[] = [];

  render() {
    return (
      <Card title="Spørsmål">
        {this.sporsmaler.map((sporsmal) => (
          <Row key={sporsmal.sporsmalid}>
            <Column width={1}>{sporsmal.sporsmalid}</Column> 
            <Column width={1}>{sporsmal.tittel}</Column>
            <Column width={1}>{sporsmal.innhold}</Column>
            <Column width={1}>{sporsmal.poeng}</Column>
            <Column width={2}>{sporsmal.dato?.toString()}</Column>
            <Column width={2}>{sporsmal.sistendret?.toString()}</Column>
            <Column width={1}>
              <Link to={'/sporsmal/' + sporsmal.sporsmalid}>
                <button>Til Spørsmål</button>
              </Link>
              </Column>
          </Row>
        ))}
      </Card>
    );
  }

  mounted() {
    sporsmalService.getAll().then((sporsmaler) => (this.sporsmaler = sporsmaler));
  }
}

class SporsmalDetails extends Component <{ match: { params: {sporsmalid: number}}}> {
sporsmal: Sporsmal = { sporsmalid: 0, tittel: '', innhold: '', poeng: 0, dato: new Date, sistendret: new Date, bestsvarid: 0, ersvart: false };

  render() {

    return (
      <>
        <Card title="Spørsmål">
          <Row>
            <Column width={2}>Tittel:</Column>
            <Column>{this.sporsmal.tittel}</Column>
          </Row>
          <Row>
            <Column width={2}>Spørsmål:</Column>
            <Column>{this.sporsmal.innhold}</Column>
          </Row>
          <Row>
            <Column width={2}>Poeng:</Column>
            <Column>{this.sporsmal.poeng}</Column>
          </Row>
          <Row>
            <Column width={2}>Dato:</Column>
            {/* <Column>{this.sporsmal.dato.toLocaleString()}</Column> */}
          </Row>
          <Row>
            <Column width={2}>Sist Endret:</Column>
            {/* <Column>{this.sporsmal.sistendret.toLocaleString()}</Column> */}
          </Row>
          <Row>
            <Column width={2}>Godkjent Svar:</Column>
            <Column>
              {/* <Form.Checkbox checked={this.sporsmal.ersvart} onChange={() => {}} /> */}
            </Column>
          </Row>
        </Card>
        <Button.Success
          onClick={() => history.push('/sporsmal/' + this.props.match.params.sporsmalid + '/rediger')}
        >
          Rediger
        </Button.Success>
      </>
    );
  }
  

  mounted() {
      sporsmalService
      .get(this.props.match.params.sporsmalid)
      .then((sporsmal) => (this.sporsmal = sporsmal))
      .catch((error) => Alert.danger('Finner ikke spørsmålet: ' + error.message));
  }
}

class SporsmalNew extends Component {

  tittel = '';
  innhold = '';
  poeng = 0;
  // dato = Date();
  // sistendret = Date();


  render() {
    return (
      <Card title="Nytt Spørsmål">
        <Row>
          <Column width={1}>
            <Form.Label>Spørsmål Tittel:</Form.Label>
          </Column>
          <Column width={4}>
            <Form.Input
              type="text"
              value={this.tittel}
              onChange={(event) => (this.tittel = event.currentTarget.value)}
            />
          </Column>
        </Row>
        <Row>
          <Column width={1}>
            <Form.Label>Spørsmål:</Form.Label>
          </Column>
          <Column width={4}>
            <Form.Input
              type="text"
              value={this.innhold}
              onChange={(event) => (this.innhold = event.currentTarget.value)}
            />
          </Column>

        </Row>
        <Column width={1}>
          <Button.Success
          onClick={() => {
            this.poeng = 0;
            sporsmalService.create(this.tittel, this.innhold, this.poeng).then(() => {
              // Reloads the Spørsmal
              SporsmalList.instance()?.mounted(); // .? meaning: call SporsmalList.instance().mounted() if SporsmalList.instance() does not return null
              this.tittel = '';
              this.innhold = '';
            });
          }}
        >
          Create
        </Button.Success>
          </Column>
      </Card>
      
    );
  }
}

class FavorittList extends Component {
    favortitter: Favoritt[] = [];

    render()   {
    return(
        <Card title="Favoritter"> 
        {this.favortitter.map((favoritt) => (
            <Row key={favoritt.favorittid}>
                <Column width={1}>{favoritt.favorittid}</Column>
                <Column width={1}>{favoritt.svarid}</Column>
                </Row>
              ))}
          </Card>
    );
    }
  
    
}


class TagsList extends Component { 
    tags: Tag[] = [];
    
    render() {
        return (
            <Card title="Tags">
                {this.tags.map((tag) => (
                    <Row key={tag.tagid}>
                        <Column width={1}>{tag.tagid}</Column>
                        <Column width={1}>{tag.navn}</Column>
                    </Row>
                ))}
            </Card>
        );
    }
}



  let root = document.getElementById('root');
  if (root)
    createRoot(root).render(
      <HashRouter>
        <div>
          <Navigation />
          <Route exact path="/" component={SporsmalList} />
          <Route path={'/sporsmal/:sporsmalid'} component={SporsmalDetails} />
          <Route exact path="/nyspor" component={SporsmalNew} />
          <Route exact path="/favs" component={FavorittList} />
          <Route exact path="/tags" component={TagsList} />
        </div>
      </HashRouter>,
    );
  