import React, { Component, useState } from 'react';
import './App.css';
import {LineChart, XAxis, YAxis, CartesianGrid, Line, Tooltip, Legend} from 'recharts';
import { FaSnapchat, FaInstagram, FaLinkedin, FaGithub, FaFacebook } from 'react-icons/fa';
import ReactMapGL from 'react-map-gl';
import 'bootstrap/dist/css/bootstrap.min.css'

import {Dropdown, FormControl, ListGroup,} from "react-bootstrap";



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
                zoom: 4
            },
            country: "United Kingdom",
            value: '',
            listOfCountries: [],
            backgroundData: {},
        }

    }

    componentWillMount() {
        fetch('/yesterday/uk').then(res => res.json()).then(data => {
            this.setState({information: data[0], viewport: {width: window.innerWidth,
                    height: window.innerHeight,
                    latitude: (data[0].Lat ? parseInt((data[0].Lat)): 0), longitude: (data[0].Lon ? parseInt((data[0].Lon)): 0),
                    zoom: 4
                }});
        });
        fetch('get_confirmed_and_deaths_from_country/uk').then(res => res.json()).then(data => {
            this.setState({backgroundData: data})
            console.log(this.state)
        })
        fetch('/get_country_list').then(res => res.json()).then(data =>{
            this.setState({listOfCountries: data})
            console.log(this.state.listOfCountries);
        })
    }

    onSelected = (viewport, item) => {
        this.setState({
            viewport
        })
    }

    CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
        <a
            style={{color: "inherit", textDecoration: 'none'}}
            href=""
            ref={ref}
            onClick={(e) => {
                e.preventDefault();
                onClick(e);
            }}
        >
            {children+" "}
            &#x25bc;
        </a>
    ));

// forwardRef again here!
// Dropdown needs access to the DOM of the Menu to measure it
    CustomMenu = React.forwardRef(
        ({ children, style, className, 'aria-labelledby': labeledBy }, ref) => {
            const [value, setValue] = useState('');

            return (
                <div
                    ref={ref}
                    style={style}
                    className={className}
                    aria-labelledby={labeledBy}
                >
                    <FormControl
                        autoFocus
                        className="mx-3 my-2 w-auto"
                        placeholder="Type to filter..."
                        onChange={(e) => setValue(e.target.value)}
                        value={value}
                    />
                    <ul className="list-unstyled">
                        {React.Children.toArray(children).filter(
                            (child) =>
                                !value || child.props.children.toLowerCase().startsWith(value),
                        )}
                    </ul>
                </div>
            );
        },
    );

    updateInformation = (country) =>{
        this.setState({country: country});
        fetch('/yesterday/'+country).then(res => res.json()).then(data => {
            this.setState({information: data[0], viewport: {width: window.innerWidth,
                    height: window.innerHeight,
                    latitude: (data[0].Lat ? parseInt((data[0].Lat)): 0), longitude: (data[0].Lon ? parseInt((data[0].Lon)): 0),
                    zoom: 4
                }});
            console.log(this.state);
        });
        fetch('get_confirmed_and_deaths_from_country/'+country).then(res => res.json()).then(data => {
            this.setState({backgroundData: data})
            console.log(this.state)
        })

    }

    render() {
        this.items = this.state.listOfCountries.map((item) =>
            <Dropdown.Item eventKey={this.state.listOfCountries.indexOf(item)} active={item===this.state.country} onClick={() => this.updateInformation(item)}>{item}</Dropdown.Item>
        );

        const { viewport } = this.state;
        return (
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
                <div className="App" style={{backgroundColor: "rgba(0, 0, 0, 0.80)", color: "#d4d4d4", height: window.innerHeight, width: window.innerWidth}}>

                    <ListGroup variant="flush" className={"bg-transparent"}>
                        <ListGroup.Item className={"bg-transparent"}>
                            <h2>COVID Tracker</h2>
                            <p> A very (very) simple COVID-19 Web Tracker</p>
                            <Dropdown>
                                <Dropdown.Toggle as={this.CustomToggle} id="dropdown-custom-components">
                                    {this.state.country}
                                </Dropdown.Toggle>

                                <Dropdown.Menu as={this.CustomMenu}>
                                    {this.items}
                                </Dropdown.Menu>
                            </Dropdown>
                        </ListGroup.Item>
                        <ListGroup.Item className={"bg-transparent"}>
                            <p>Active Cases: {this.state.information["Active"]}</p>
                        </ListGroup.Item>
                        <ListGroup.Item className={"bg-transparent"}>
                            <p>Confirmed Cases: {this.state.information["Confirmed"]}</p>
                        </ListGroup.Item>
                        <ListGroup.Item className={"bg-transparent"}>
                            <p>Current Deaths: {this.state.information["Deaths"]}</p>
                        </ListGroup.Item>
                    </ListGroup>
                    <br/>
                    <div style={{display: 'flex', flexDirection: "row", }}>
                        <div style={{height: window.innerHeight/2.5, width: window.innerWidth/8, display: 'flex', flexDirection: "row-reverse"}}>
                            <p style={{writingMode: 'vertical-lr', }}>Number of Confirmed Deaths</p>
                        </div>
                        <LineChart
                            width={(window.innerWidth/8)*6}
                            height={window.innerHeight/2.5}
                            data={this.state.backgroundData}
                            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                        >
                            <XAxis dataKey="Date" padding={{ left: 30, right: 30 }}/>
                            <Tooltip />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Legend/>
                            <CartesianGrid stroke="#f5f5f5" />
                            <Line yAxisId="left" type="monotone" dataKey="Deaths" stroke="#8884d8" activeDot={{ r: 8 }} />
                            <Line yAxisId="right" type="monotone" dataKey="Confirmed" stroke="#82ca9d" />
                        </LineChart>
                        <div style={{height: window.innerHeight/2.5, width: window.innerWidth/8, display:"flex"}}>
                            <p style={{writingMode: 'vertical-lr', }}>Number of Confirmed Cases</p>
                        </div>
                    </div>
                    <br/>
                    <p>Follow me on my social media accounts:</p>
                    <a style={{color: "inherit", textDecoration: 'none'}} href={"https://www.snapchat.com/add/elijah.ahmad"}><FaSnapchat/> Snapchat - @Elijah.Ahmad</a>
                    <br/>
                    <a style={{color: "inherit", textDecoration: 'none'}} href={"https://www.instagram.com/ElijahAhmad__"}><FaInstagram/> Instagram - @ElijahAhmad__</a>
                    <br/>
                    <a style={{color: "inherit", textDecoration: 'none'}} href={"https://www.facebook.com/elijah.ahmad.71"}><FaFacebook/> FaceBook - Elijah Ahmad</a>
                    <br/>
                    <a style={{color: "inherit", textDecoration: 'none'}} href={"https://www.linkedin.com/in/elijah-ahmad-658a2b199/"}><FaLinkedin/> Linkden - Elijah Ahmad</a>
                    <br/>
                    <a style={{color: "inherit", textDecoration: 'none'}} href={"https://github.com/sp1d5r"}><FaGithub/> GitHub - @sp1d5r</a>
                </div>

            </ReactMapGL>

        );
    }

}

export default App;
