import os
import requests, sys
from lxml import html
from time import sleep
import json
import datetime

class Scraper:
    def __init__(self, db):
        print "Initialized Moodle Scraper"
