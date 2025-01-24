from collections import namedtuple
from flask import current_app as app
from flask import render_template, redirect, send_file
from flask_flatpages import FlatPages
import re
import io

from .data import get_time_averaged, get_days_with_data, make_csv

pages = FlatPages(app)

MenuItem = namedtuple('MenuItem', 'title path order')

def menu_items():
    menu = [
        #MenuItem('Weather', '/', 1),
        MenuItem('Download', '/download', 2),
    ]
    menu = sorted(menu, key=lambda item: item.order)
    return menu

@app.route('/')
def index():
    return render_template(
        "weather.html",
        navigation=menu_items()
    )

@app.route('/download')
def download():
    days = get_days_with_data()
    csv_files = [
        str(date).split(' ')[0] + '_minute_data.csv'
        for date in days['time'].tolist()
    ]
    csv_files = sorted(csv_files, reverse=True)
    return render_template(
        "download.html",
        navigation=menu_items(),
        csv_files=csv_files,
    )

@app.route('/download/<filename>')
def download_file(filename):
    print(filename)
    if not re.fullmatch('\d\d\d\d-\d\d-\d\d_minute_data.csv', filename):
        return redirect('/download')

    date = filename.split('_')[0]
    csv_content = make_csv(date)

    return send_file(
        io.BytesIO(csv_content),
        download_name=filename,
    )

@app.route('/data/<time_bucket_minutes>')
def data(time_bucket_minutes):
    #print(time_bucket_hours)
    try:
        time_bucket_minutes = int(time_bucket_minutes)
    except ValueError:
        return '[]'

    interval = "3 hours"
    if time_bucket_minutes == 10:
        interval = "1 day"
    if time_bucket_minutes == 60:
        interval = "7 days"
    if time_bucket_minutes == 180:
        interval = "28 days"
    if time_bucket_minutes == 720:
        interval = "3 months"
    if time_bucket_minutes == 1448:
        interval = "1 year"

    return get_time_averaged(time_bucket_minutes, interval=interval).to_json(date_format='iso', orient='records')

@app.route('/<path:path>')
def page(path):
    page = pages.get_or_404(path)
    return render_template("weather.html")
