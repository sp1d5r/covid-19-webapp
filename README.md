# COVID-19 App
![image of my website](https://raw.githubusercontent.com/sp1d5r/covid-19-webapp/master/preview.gif)


This is a simple webapp project I made to help, show covid-19 data to my friends and family. 
You can currently access the website here: [covid-19 webapp :)](https://covid-tracker-program.herokuapp.com) 

## Backend
Inside the backend we have 2 main steps, 
1) Retrieving the data,
2) Conducting some pre-processing on the data

For step one, I am using the [covid-19 api](https://api.covid19api.com/), it's a pretty basic API, 
but it gets the job done, and I can make as many general enquires as I please.

Then I conduct some analysis on the data. To do this I began by using jupyter notebook
to see how I could pull the data. I began making some basic functions such as the following 
```python
import requests

# gets the json file from a specific URL
def make_get_request(url):
    return requests.get(url).json()

# gets the basic information, for a specified country
def get_cases_for_country(country):
    return [{"Province": x["Province"], "Lon": x["Lon"], "Lat": x["Lat"], "Confirmed": x["Confirmed"], "Deaths": x["Deaths"], "Recovered": x["Recovered"], "Active": x["Active"], "Date": x["Date"][:10]} for x in make_get_request("https://api.covid19api.com/dayone/country/"+country)]
 
# gets a list of the provinces from a specified country
def get_provinces_from_country(country):
    cases = get_cases_for_country(country)
    no_duplicates = []
    for x in cases:
        if not (x["Province"] in no_duplicates):
            no_duplicates.append(x["Province"])
    return no_duplicates

# gets information by province
def get_information_by_province(province, country):
    return [x for x in get_cases_for_country(country) if x["Province"]==province]

# gets information by date, for a specified country
def get_information_by_date(date, country):
    return [x for x in get_cases_for_country(country) if x["Date"]==date]

# gets deaths with dates for a country (used for graphing)
def get_deaths_with_dates(country, province=''):
    return [{"Deaths": x["Deaths"], "Date": x["Date"]} for x in get_information_by_province(province,country)]

# gets confirmed cases with dates for a country (used for graphing)
def get_confirmed_with_dates(country, province=''):
    return [{"Confirmed": x["Confirmed"], "Date": x["Date"]} for x in get_information_by_province(province,country)]

# gets a list of the available countries 
def get_country_list():
    country_list = make_get_request("https://api.covid19api.com/countries")
    return sorted([x["Country"] for x in country_list])
``` 

Then I used flask to serve up the information on a different port and used a proxy to allow my react 
app to interact with the flask app. 

The flask app has the following structure:
```python
app = Flask(__name__, static_folder='./build', static_url_path='/')

@app.route('/info_by_date/<country>/<date>')
def info_by_date(country, date):
    # show the user profile for that user
    country = [x if x != '_' else ' ' for x in country]
    country = ''.join(country)

    return jsonify(get_information_by_date(date, country))

@app.route('/all_data_from_country/<country>')
def get_info_for_specific_country(country):
    country = [x if x != '_' else ' ' for x in country]
    country = ''.join(country)
    return jsonify(get_information_by_province(country))

@app.route('/get_confirmed_and_deaths_from_country/<country>')
def get_confirmed_deaths_from_country(country):
    country = [x if x != '_' else ' ' for x in country]
    country = ''.join(country)
    return jsonify(get_confirmed_and_deaths_from_country(country))

@app.route('/confirmed_from_country/<country>')
def confirmed_from_country(country):
    country = [x if x != '_' else ' ' for x in country]
    country = ''.join(country)

    return jsonify(get_confirmed_with_dates(country))


@app.route('/deaths_from_country/<country>')
def deaths_from_country(country):
    country = [x if x != '_' else ' ' for x in country]
    country = ''.join(country)

    return jsonify(get_deaths_with_dates(country))


@app.route('/get_country_list')
def get_country():
    return jsonify(get_country_list())


@app.route('/today_info/<country>')
def get_country_today(country):
    country = [x if x != '_' else ' ' for x in country]
    country = ''.join(country)
    return jsonify(get_today_infomation(country))


@app.route('/yesterday/<country>')
def get_country_yesterday(country):
    country = [x if x != '_' else ' ' for x in country]
    country = ''.join(country)
    return jsonify(get_yesterday_information(country))

@app.route('/')
def index():
    return app.send_static_file('index.html')

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=False, port=os.environ.get('PORT', 80))
```
This uses a static html file called index.html useful for testing. This index file 
will be built later using react. 

## Frontend 
For the front-end I used React. The structure of my React app is very basic. I only 
have a single file stored inside App.js. 

My React state has the following structure: 
```javascript
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
```
Information stores relevant data depending on the parameters entered. The 
other part of the web app is to grab the data at the initialisation of the app.

```javascript
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
```
This part of the web app obtains the information from the url from the appropriate addresses. During testing I enabled 
a proxy feature inside package.json this was useful during testing. 

The second part of the app is that it needs to be able to obtain user input. To do this I created a 
basic dropdown menu with a list of the available countries. 

```javascript
// Dropdown for countries + search bar
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
```

Then I added a custom background using mapbox, which changes the long and lat 
to allow the user to move the map. It looks pretty neat, apart from that. Now we need to ensure that 
when the user updates his information we update the values stored inside the state.

```javascript
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
                                        width={(window.innerWidth/10)*9}
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
```
The above code is for rendering the webpage. The code below allows you to get the value 
from our flask app depending on what the user selected.

```javascript
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
```

## Demo 
Check the app at the following [link!](https://covid-tracker-program.herokuapp.com)


## Social Media 
 
- [Linkden - Elijah Ahmad](https://www.linkedin.com/in/elijah-ahmad-658a2b199/)
- [FaceBook - Elijah Ahmad](https://www.facebook.com/elijah.ahmad.71)
- [Instagram - @ElijahAhmad__](https://www.instagram.com/ElijahAhmad__)
- [Snapchat - @Elijah.Ahmad](https://www.snapchat.com/add/elijah.ahmad)

