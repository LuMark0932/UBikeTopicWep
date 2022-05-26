import pandas as pd
import numpy as np
import math
import datetime

import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from sklearn.cluster import KMeans
from sklearn import datasets
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import PolynomialFeatures
from sklearn import datasets, linear_model
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import PolynomialFeatures
from sklearn import preprocessing
import operator
import xgboost as xgb
import os

import pickle

import requests as req
import json
from pandas import json_normalize


def main():
    #for i in range(2000):
        url2='https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json'

        request = req.get(url2)
        getTxt=request.text
        dataV2 = json.loads(getTxt)
        youbikeV2 = json_normalize(dataV2)

        youbikeV2=youbikeV2.drop_duplicates(['sno'], keep='last')

        station=pd.read_csv('./station.csv')

        station=station.drop('Unnamed: 0',axis=1)

        station['sno']=station['sno'].astype(int)

        youbikeV2['sno']=youbikeV2['sno'].astype(int)

        youbike = pd.merge(youbikeV2, station,on=['sno'])

        youbike["calender"]=youbike["mday"].str.slice(0,10,)

        youbike['calender']=youbike['mday'].apply(pd.Timestamp)

        youbike['weekday']=youbike['calender'].dt.dayofweek

        youbike['weekday']=youbike['weekday'].astype(int)

        youbike['weekday']=youbike['weekday']+1

        youbike['day_2']=youbike['weekday'].apply(lambda x: 1 if x==2 else 0)

        youbike['day_3']=youbike['weekday'].apply(lambda x: 1 if x==3 else 0)

        youbike['day_4']=youbike['weekday'].apply(lambda x: 1 if x==4 else 0)

        youbike['day_5']=youbike['weekday'].apply(lambda x: 1 if x==5 else 0)

        youbike['day_6']=youbike['weekday'].apply(lambda x: 1 if x==6 else 0)

        youbike['day_7']=youbike['weekday'].apply(lambda x: 1 if x==7 else 0)

        youbike['holiday']=youbike['weekday'].apply(lambda x: 1 if x ==6 | x ==7 else 0)

        youbike['hour']=youbike['calender'].dt.hour

        youbike['hour_1']=youbike['hour'].apply(lambda x: 1 if x==1 else 0)

        youbike['hour_2']=youbike['hour'].apply(lambda x: 1 if x==2 else 0)

        youbike['hour_3']=youbike['hour'].apply(lambda x: 1 if x==3 else 0)

        youbike['hour_4']=youbike['hour'].apply(lambda x: 1 if x==4 else 0)

        youbike['hour_5']=youbike['hour'].apply(lambda x: 1 if x==5 else 0)

        youbike['hour_6']=youbike['hour'].apply(lambda x: 1 if x==6 else 0)

        youbike['hour_7']=youbike['hour'].apply(lambda x: 1 if x==7 else 0)

        youbike['hour_8']=youbike['hour'].apply(lambda x: 1 if x==8 else 0)

        youbike['hour_9']=youbike['hour'].apply(lambda x: 1 if x==9 else 0)

        youbike['hour_10']=youbike['hour'].apply(lambda x: 1 if x==10 else 0)

        youbike['hour_11']=youbike['hour'].apply(lambda x: 1 if x==11 else 0)

        youbike['hour_12']=youbike['hour'].apply(lambda x: 1 if x==12 else 0)

        youbike['hour_13']=youbike['hour'].apply(lambda x: 1 if x==13 else 0)

        youbike['hour_14']=youbike['hour'].apply(lambda x: 1 if x==14 else 0)

        youbike['hour_15']=youbike['hour'].apply(lambda x: 1 if x==15 else 0)

        youbike['hour_16']=youbike['hour'].apply(lambda x: 1 if x==16 else 0)

        youbike['hour_17']=youbike['hour'].apply(lambda x: 1 if x==17 else 0)

        youbike['hour_18']=youbike['weekday'].apply(lambda x: 1 if x==18 else 0)

        youbike['hour_19']=youbike['weekday'].apply(lambda x: 1 if x==19 else 0)

        youbike['hour_20']=youbike['weekday'].apply(lambda x: 1 if x==20 else 0)

        youbike['hour_21']=youbike['weekday'].apply(lambda x: 1 if x==21 else 0)

        youbike['hour_22']=youbike['weekday'].apply(lambda x: 1 if x==22 else 0)

        youbike['hour_23']=youbike['weekday'].apply(lambda x: 1 if x==23 else 0)

        youbike['minute']=youbike['calender'].dt.minute

        youbike['min_1']=youbike['minute'].apply(lambda x: 1 if x==1 else 0)

        youbike['min_2']=youbike['minute'].apply(lambda x: 1 if x==2 else 0)

        youbike['min_3']=youbike['minute'].apply(lambda x: 1 if x==3 else 0)

        youbike['min_4']=youbike['minute'].apply(lambda x: 1 if x==4 else 0)

        youbike['min_5']=youbike['minute'].apply(lambda x: 1 if x==5 else 0)

        youbike['areaId_2']=youbike['area_id'].apply(lambda x: 1 if x==2 else 0)

        youbike['areaId_3']=youbike['area_id'].apply(lambda x: 1 if x==3 else 0)

        youbike['areaId_5']=youbike['area_id'].apply(lambda x: 1 if x==5 else 0)

        youbike['areaId_9']=youbike['area_id'].apply(lambda x: 1 if x==9 else 0)

        youbike['areaId_10']=youbike['area_id'].apply(lambda x: 1 if x==10 else 0)

        youbike['areaId_11']=youbike['area_id'].apply(lambda x: 1 if x==11 else 0)

        youbike['areaId_13']=youbike['area_id'].apply(lambda x: 1 if x==13 else 0)

        youbike['areaId_14']=youbike['area_id'].apply(lambda x: 1 if x==14 else 0)

        youbike['areaId_15']=youbike['area_id'].apply(lambda x: 1 if x==15 else 0)

        youbike['areaId_16']=youbike['area_id'].apply(lambda x: 1 if x==16 else 0)

        youbike['areaId_17']=youbike['area_id'].apply(lambda x: 1 if x==17 else 0)

        X=youbike[['tot', 'holiday', 'codes','bemp','day_2', 'day_3', 'day_4', 'day_5', 'day_6',
               'day_7', 'hour_1', 'hour_2', 'hour_3', 'hour_4', 'hour_5', 'hour_6',
               'hour_7', 'hour_8', 'hour_9', 'hour_10', 'hour_11', 'hour_12',
               'hour_13', 'hour_14', 'hour_15', 'hour_16', 'hour_17', 'hour_18',
               'hour_19', 'hour_20', 'hour_21', 'hour_22', 'hour_23', 'min_1', 'min_2',
               'min_3', 'min_4', 'min_5','areaId_2', 'areaId_3', 'areaId_5', 'areaId_9', 'areaId_10',
               'areaId_11', 'areaId_13', 'areaId_14', 'areaId_15', 'areaId_16',
               'areaId_17']]

        filename = 'TimeAndPlaceOnly.sav'

        loaded_model = pickle.load(open(filename, 'rb'))
        result = loaded_model.predict(X)

        youbike['later_ratio']=pd.DataFrame(result)

        youbike['later_ratio2']=youbike['later_ratio'].apply(lambda x: 0.1 if x==0 else  0.3 if x==1 else 0.5 if x==2 else 0.7 if x==3 else 0.9)

        youbike['later_bemp']=(youbike['tot']*youbike['later_ratio2']).apply(np.floor)

        youbike['later_sbi']=youbike['tot']-youbike['later_bemp']

        youbike['later_bemp']=youbike['later_bemp'].astype(int)

        youbike['later_sbi']=youbike['later_sbi'].astype(int)

        youbike.to_csv('youbike.csv')
        #sleep(120)

if __name__ == "__main__":
    main()