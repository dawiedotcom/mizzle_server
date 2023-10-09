import psycopg2
import pandas as pd

from .config import Config

def make_timescale_query(n_minutes, limit):
    return f'''
    select
        time_bucket('{n_minutes} minute', datetime) as time,
        average(stats_agg(temp_air)) as temp_air,
        stddev(stats_agg(temp_air), 'pop') as temp_air_std,
        average(stats_agg(pressure)) as pressure,
        average(stats_agg(humidity)) as humidity,
        min(wind_speed_min) as wind_speed_min,
        max(wind_speed_max) as wind_speed_max,
        average(stats_agg(wind_speed_ave)) as wind_speed_ave
    from
        mizzle_readings
    group by time
    order by time
    limit {limit}
    '''

def query(q):
    with psycopg2.connect(Config.DATABASE_URI) as conn:
        data = pd.read_sql_query(q, conn)
    return data

def get_time_averaged(time_bucket_minutes):
    limit = 180;

    if time_bucket_minutes == 10:
        limit = 144 # = 24 * 60 / 10 -- Limit results to one day
    if time_bucket_minutes == 60:
        limit = 168 # = 7 * 24 * 60 / 60 -- Limit results to one week
    if time_bucket_minutes == 180:
        limit = 224 # = 4 * 7 * 24 * 60 / (3*60) -- Limit results to four weeks
    if time_bucket_minutes == 720:
        limit = 182 # = 13 * 7 * 24 * 60 / (12*60) -- Limit results to 3 months
    if time_bucket_minutes == 1448:
        limit = 365 # = 52 * 7 * 24 * 60 / (24*60) -- Limit results to one year

    return query(make_timescale_query(time_bucket_minutes, limit))
    #if format == 'json':
    #    return data.to_json(date_format='iso', orient='records')
    #return data

def make_csv_query(date):
    return f'''
    select
         to_char(datetime, 'YYYY-MM-DD HH24:MI:SS') as datetime,
         wind_dir_min,
         wind_dir_ave,
         wind_dir_max,
         wind_speed_min,
         wind_speed_ave,
         wind_speed_max,
         temp_air,
         humidity,
         pressure,
         rain_accum,
         rain_duration,
         rain_intensity,
         hail_accum,
         hail_duration,
         hail_intensity
    from
        mizzle_readings
    where
         to_char(datetime, 'YYYY-MM-DD') = '{date}'
    order by
         datetime
    '''

def make_csv(date):
    data = query(make_csv_query(date))
    csv_str = 'Date/Time,Wind Dir Min,Wind Dir Ave,Wind Dir Max,Wind Speed Min,Wind Speed Ave,Wind Speed Max,Air Temp,Humidity,Air Pressure,Rain Accum,Rain Duration,Rain Intensity,Hail Accum,Hail Duration,Hail Intensity\n'
    csv_str += 'YYYY-MM-DD HH:MM:SS,Deg,Deg,Deg,m/s,m/s,m/s,Celsius,%RH,hPa,mm,seconds,mm/h,hits/cm2,seconds,hits/cm2/h\n'
    csv_str += data.to_csv(
        index=False,
        header=False,
    )
    return csv_str.encode('utf-8')
