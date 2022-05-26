from time import sleep
import json
import csv
import os
import requests as req


def main():
    for i in range(2000):
        jsonFile = open('C:/Shared/youbiketest2/ubTast.json', 'w', encoding='UTF-8')
        csvfile = open('youbike.csv', newline='', encoding='UTF-8')
        rows = csv.reader(csvfile)
        next(rows)
        features = []
        for row in rows:
            properties = dict()
            properties['sno'] = row[1]
            properties['sna'] = row[2]
            properties['tot'] = row[3]
            properties['sbi'] = row[4]
            properties['sbi_2'] = row[74]
            properties['sarea'] = row[5]
            properties['mday'] = row[6]
            properties['lat'] = row[7]
            properties['lng'] = row[8]
            properties['ar'] = row[9]
            properties['bemp'] = row[13]
            properties['bemp_2'] = row[73]
            properties['act'] = row[14]
            properties['ub_tyope2_0'] = float(2.0)
            properties['ub_tyope1_0'] = float(0)
            properties['ub_time0'] = 0
            properties['ub_time5'] = 5
            cool = float(row[8])
            coor = float(row[7])
            coordinates = []
            coordinates.append(cool)
            coordinates.append(coor)
            geometry = dict()
            geometry['coordinates'] = coordinates
            ub = dict()
            ub['properties'] = properties
            ub['geometry'] = geometry
            features.append(ub)
        over = dict()
        over['features'] = features
        json.dump(over, jsonFile, ensure_ascii=False)
        jsonFile.close()
        sleep(120)


if __name__ == "__main__":
    main()
