import React, { Component } from 'react';
import './App.css';
import {BrowserRouter, Switch, Route} from "react-router-dom";
import ReactMapGL from 'react-map-gl';
import SearchBox from "@seanhouli/react-mapbox-search";
import Geocoder from 'react-mapbox-gl-geocoder';

//

const params = {
    country: "ca"
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            information: {},
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
                latitude: 37.7577,
                longitude: -122.4376,
                zoom: 8
            }
        }
    }

    componentWillMount() {
        fetch('/yesterday/uk').then(res => res.json()).then(data => {
            this.setState({information: data[0]});
            console.log(this.state.information);
        });
    }

    onSelected = (viewport, item) => {
        this.setState({
            viewport
        })
    }

    render() {
        const { viewport } = this.state;
        return (
            <div className="App">
                <header >
                    <ReactMapGL
                        style={{
                            position: "fixed",
                            width: window.innerWidth,
                            height: window.innerHeight,
                            backgroundSize: "cover",
                            zIndex: -1,
                        }}
                        width={viewport.width}
                        height={viewport.height}
                        latitude={viewport.latitude}
                        longitude={viewport.longitude}
                        zoom={viewport.zoom}
                        mapStyle="mapbox://styles/elijahahmad/ckggklsqg3atg1aokg07dhotu"
                        onViewportChange={(viewport) => this.setState({viewport})}
                        mapboxApiAccessToken={MAPBOX_TOKEN}
                    >
                        <Geocoder
                            mapboxApiAccessToken={MAPBOX_TOKEN}
                            onSelected={this.onSelected}
                            viewport={viewport}
                            hideOnSelect={true}
                            value=""
                            queryParams={params}
                        />

                        <p>The Current Information for UK - {this.state.information["Date"]}</p>
                        <p>Active Cases: {this.state.information["Active"]}</p>
                        <p>Confirmed Cases: {this.state.information["Confirmed"]}</p>
                        <p>Current Deaths: {this.state.information["Deaths"]}</p>

                    </ReactMapGL>
                </header>
            </div>
        );
    }

}

export default App;
