# COVID-19 App

This is a simple webapp project I made to help, show covid-19 data to my friends and family. 
You can currently access the website here .[add website] 

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

## Frontend 



## Social Media 
these are my social media's, stay tuned because I will publish the source code to the predecesor of the mechanics calculator, the statistics calculator, this app managed to gain over 3000+ app installs. 
- [Linkden - Elijah Ahmad](https://www.linkedin.com/in/elijah-ahmad-658a2b199/)
- [FaceBook - Elijah Ahmad](https://www.facebook.com/elijah.ahmad.71)
- [Instagram - @ElijahAhmad__](https://www.instagram.com/ElijahAhmad__)
- [Snapchat - @Elijah.Ahmad](https://www.snapchat.com/add/elijah.ahmad)

