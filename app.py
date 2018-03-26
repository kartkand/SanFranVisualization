from flask import Flask, render_template
app = Flask(__name__)


@app.route('/')
def index_page():
    context = {}

    # From /static/py/dispatches.py
    nHoodDispatches = [{'name': 'West of Twin Peaks', 'dispatchTimeTotal': 184094.0, 'dispatches': 214, 'averageDispatchTime': 14.3}, {'name': 'Financial District/South Beach', 'dispatchTimeTotal': 571735.0, 'dispatches': 769, 'averageDispatchTime': 12.4}, {'name': 'Portola', 'dispatchTimeTotal': 32172.0, 'dispatches': 92, 'averageDispatchTime': 5.8}, {'name': 'Presidio', 'dispatchTimeTotal': 12599.0, 'dispatches': 45, 'averageDispatchTime': 4.7}, {'name': 'McLaren Park', 'dispatchTimeTotal': 2913.0, 'dispatches': 12, 'averageDispatchTime': 4.0}, {'name': 'Treasure Island', 'dispatchTimeTotal': 13639.0, 'dispatches': 59, 'averageDispatchTime': 3.9}, {'name': 'Glen Park', 'dispatchTimeTotal': 13450.0, 'dispatches': 59, 'averageDispatchTime': 3.8}, {'name': 'Nob Hill', 'dispatchTimeTotal': 71280.0, 'dispatches': 321, 'averageDispatchTime': 3.7}, {'name': 'Potrero Hill', 'dispatchTimeTotal': 22766.0, 'dispatches': 102, 'averageDispatchTime': 3.7}, {'name': 'Excelsior', 'dispatchTimeTotal': 38859.0, 'dispatches': 182, 'averageDispatchTime': 3.6}, {'name': 'Outer Mission', 'dispatchTimeTotal': 28371.0, 'dispatches': 145, 'averageDispatchTime': 3.3}, {'name': 'Noe Valley', 'dispatchTimeTotal': 24962.0, 'dispatches': 138, 'averageDispatchTime': 3.0}, {'name': 'North Beach', 'dispatchTimeTotal': 37385.0, 'dispatches': 211, 'averageDispatchTime': 3.0}, {'name': 'South of Market', 'dispatchTimeTotal': 170238.0, 'dispatches': 952, 'averageDispatchTime': 3.0}, {'name': 'Russian Hill', 'dispatchTimeTotal': 21731.0, 'dispatches': 125, 'averageDispatchTime': 2.9}, {'name': 'Haight Ashbury', 'dispatchTimeTotal': 36546.0, 'dispatches': 215, 'averageDispatchTime': 2.8}, {'name': 'Lakeshore', 'dispatchTimeTotal': 19724.0, 'dispatches': 118, 'averageDispatchTime': 2.8}, {'name': 'Presidio Heights', 'dispatchTimeTotal': 19142.0, 'dispatches': 116, 'averageDispatchTime': 2.8}, {'name': 'Bernal Heights', 'dispatchTimeTotal': 30765.0, 'dispatches': 188, 'averageDispatchTime': 2.7}, {'name': 'Marina', 'dispatchTimeTotal': 30104.0, 'dispatches': 183, 'averageDispatchTime': 2.7}, {'name': 'Mission', 'dispatchTimeTotal': 146692.0, 'dispatches': 913, 'averageDispatchTime': 2.7}, {'name': 'Visitacion Valley', 'dispatchTimeTotal': 17877.0, 'dispatches': 112, 'averageDispatchTime': 2.7}, {'name': 'Bayview Hunters Point', 'dispatchTimeTotal': 81630.0, 'dispatches': 524, 'averageDispatchTime': 2.6}, {'name': 'Outer Richmond', 'dispatchTimeTotal': 33513.0, 'dispatches': 213, 'averageDispatchTime': 2.6}, {'name': 'Tenderloin', 'dispatchTimeTotal': 218312.0, 'dispatches': 1402, 'averageDispatchTime': 2.6}, {'name': 'Inner Sunset', 'dispatchTimeTotal': 24351.0, 'dispatches': 164, 'averageDispatchTime': 2.5}, {'name': 'Mission Bay', 'dispatchTimeTotal': 24864.0, 'dispatches': 164, 'averageDispatchTime': 2.5}, {'name': 'Pacific Heights', 'dispatchTimeTotal': 31165.0, 'dispatches': 211, 'averageDispatchTime': 2.5}, {'name': 'Sunset/Parkside', 'dispatchTimeTotal': 57142.0, 'dispatches': 381, 'averageDispatchTime': 2.5}, {'name': 'Twin Peaks', 'dispatchTimeTotal': 11094.0, 'dispatches': 73, 'averageDispatchTime': 2.5}, {'name': 'Western Addition', 'dispatchTimeTotal': 59579.0, 'dispatches': 396, 'averageDispatchTime': 2.5}, {'name': 'Hayes Valley', 'dispatchTimeTotal': 34275.0, 'dispatches': 235, 'averageDispatchTime': 2.4}, {'name': 'Castro/Upper Market', 'dispatchTimeTotal': 40690.0, 'dispatches': 297, 'averageDispatchTime': 2.3}, {'name': 'Japantown', 'dispatchTimeTotal': 11683.0, 'dispatches': 85, 'averageDispatchTime': 2.3}, {'name': 'Lincoln Park', 'dispatchTimeTotal': 1662.0, 'dispatches': 12, 'averageDispatchTime': 2.3}, {'name': 'Lone Mountain/USF', 'dispatchTimeTotal': 14105.0, 'dispatches': 103, 'averageDispatchTime': 2.3}, {'name': 'Oceanview/Merced/Ingleside', 'dispatchTimeTotal': 17326.0, 'dispatches': 124, 'averageDispatchTime': 2.3}, {'name': 'Chinatown', 'dispatchTimeTotal': 23390.0, 'dispatches': 188, 'averageDispatchTime': 2.1}, {'name': 'Inner Richmond', 'dispatchTimeTotal': 15573.0, 'dispatches': 121, 'averageDispatchTime': 2.1}, {'name': 'Seacliff', 'dispatchTimeTotal': 1032.0, 'dispatches': 8, 'averageDispatchTime': 2.1}, {'name': 'Golden Gate Park', 'dispatchTimeTotal': 3097.0, 'dispatches': 28, 'averageDispatchTime': 1.8}]

    context['nHoods'] = nHoodDispatches
    return render_template('index.html', **context)


@app.route('/map')
def map_page():
    return render_template('map.html')


@app.route('/scatterplot')
def scatterplot_page():
    return render_template('scatterplot.html')


@app.route('/crossfilter')
def crossfilter_page():
    return render_template('crossfilter.html')


if __name__ == "__main__":
    app.run()
