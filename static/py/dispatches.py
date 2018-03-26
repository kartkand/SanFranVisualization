import json
import csv
from shapely.geometry import shape, Point
import datetime as dt
from operator import itemgetter
# depending on your version, use: from shapely.geometry import shape, Point

# load GeoJSON file containing sectors
with open('Neighborhoods.geo.json') as f:
    js = json.load(f)

# construct point based on lon/lat returned by geocoder
point = Point(-122.5046792232, 37.7744419948)


csvFile = []
with open('sfpd_dispatch_data_subset.csv', 'r', newline='') as file:
    reader = csv.DictReader(file)
    for row in reader:
        csvFile.append(row)
# print(csvFile[0]['hospital_timestamp'])

nhoodMap = []
for feature in js['features']:
    thisMap = {}
    thisMap['name'] = feature['properties']['nhood']
    thisMap['dispatchTimeTotal'] = 0
    thisMap['dispatches'] = 0
    nhoodMap.append(thisMap)


# x = 0
for element in csvFile:
    # print(x)
    # x = x + 1
    point = Point(float(element['longitude']), float(element['latitude']))
    for feature in js['features']:
        polygon = shape(feature['geometry'])
        if polygon.contains(point):
            index = 0
            while feature['properties']['nhood'] != nhoodMap[index]['name']:
                index = index + 1
            nhoodMap[index]['dispatches'] = nhoodMap[index]['dispatches'] + 1
            dts = element['dispatch_timestamp']
            dispatchTime = dt.datetime(
                int(dts[0:4]), int(dts[5:7]), int(dts[8:10]), int(dts[11:13]),
                int(dts[14:16]), int(dts[17:19]))

            rts = element['received_timestamp']
            receivedTime = dt.datetime(
                int(rts[0:4]), int(rts[5:7]), int(rts[8:10]), int(rts[11:13]),
                int(rts[14:16]), int(rts[17:19]))

            nhoodMap[index]['dispatchTimeTotal'] = (
                nhoodMap[index]['dispatchTimeTotal'] +
                (dispatchTime - receivedTime).total_seconds())

for element in nhoodMap:
    element['averageDispatchTime'] = round(
        element['dispatchTimeTotal'] / (element['dispatches'] * 60), 1)
nhoodMap = sorted(
    nhoodMap, key=itemgetter('averageDispatchTime'), reverse=True)
print(nhoodMap)
