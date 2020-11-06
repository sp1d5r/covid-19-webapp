import requests
from flask import Flask, jsonify
import time
from datetime import date, timedelta
from markupsafe import escape


def make_get_request(url):
    return requests.get(url).json()


def get_cases_for_country(country):
    return [{"Province": x["Province"], "Lon": x["Lon"], "Lat": x["Lat"], "Confirmed": x["Confirmed"],
             "Deaths": x["Deaths"], "Recovered": x["Recovered"], "Active": x["Active"], "Date": x["Date"][:10]} for x in make_get_request("https://api.covid19api.com/dayone/country/" + country)]


def get_provinces_from_country(country):
    cases = get_cases_for_country(country)
    no_duplicates = []
    for x in cases:
        if not (x["Province"] in no_duplicates):
            no_duplicates.append(x["Province"])
    return no_duplicates


def get_information_by_province(country, province='',):
    return [x for x in get_cases_for_country(country) if x["Province"] == province]


def get_information_by_date(date, country):
    return [x for x in get_information_by_province(country) if x["Date"] == date]


def get_deaths_with_dates(country, province=''):
    return [{"Deaths": x["Deaths"], "Date": x["Date"]} for x in get_information_by_province(country, province)]


def get_confirmed_with_dates(country, province=''):
    return [{"Confirmed": x["Confirmed"], "Date": x["Date"]} for x in get_information_by_province(country, province)]


def get_recovered_with_dates(country, province=''):
    return [{"Recovered": x["Recovered"], "Date": x["Date"]} for x in get_information_by_province(country, province)]

def get_confirmed_and_deaths_from_country(country, province=''):
    return [{"Deaths": x["Deaths"], "Confirmed": x["Confirmed"], "Date": x["Date"]} for x in get_information_by_province(country, province)]


def get_country_list():
    country_list = make_get_request("https://api.covid19api.com/countries")
    return sorted([x["Country"] for x in country_list])


def get_today_infomation(country):
    today = date.today() - timedelta(days=1)
    print(today.strftime("%Y-%m-%d"))
    return get_information_by_date(today.strftime("%Y-%m-%d"), country)


def get_yesterday_information(country):
    today = date.today() - timedelta(days=2)
    print(today.strftime("%Y-%m-%d"))
    return get_information_by_date(today.strftime("%Y-%m-%d"), country)


app = Flask(__name__, static_folder='build', static_url_path='/')

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
