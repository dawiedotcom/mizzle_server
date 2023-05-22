import psycopg2
import pandas as pd

from .config import Config

def make_timescale_query(n_hours):
    return f'''
    select
        time_bucket('{n_hours} hour', datetime) as time,
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
    '''

def query(q):
    with psycopg2.connect(Config.DATABASE_URI) as conn:
        data = pd.read_sql_query(q, conn)
    return data

def get_time_averaged(time_bucket_hours):
    return query(make_timescale_query(time_bucket_hours))
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
    csv_str = data.to_csv(
        index=False,
    )
    return csv_str.encode('utf-8')
