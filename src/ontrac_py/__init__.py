#!/usr/bin/python2
__author__ = "frank"

import sys
import os
from scraper import Scraper
from cli import CLI
from viewer import Viewer
import json
from pymongo import MongoClient
import requests
from lxml import html

VERSION = "0.1"
PATH = os.path.abspath(os.path.join(os.path.dirname(__file__),"..")) + "/secrets.json"
DB_NAME = "regis"
IP = "localhost"
PORT = "27017"

class OnTrac:
    def __init__(self):
        print " --- Initalizing OnTrac v"+VERSION+" ---\n"
        self.secrets = self.get_secrets()
        self.username = self.secrets['regis_username']
        self.password = self.secrets['regis_password']
        print "Found info for Regis student '"+self.username+"'"
        self.connect_to_db()
        self.session = self.get_session()
        self.init_mods()

    def get_secrets(self):
        path = PATH
        secrets = json.loads(open(path).read())
        if len(sys.argv) > 1 and os.path.isfile(sys.argv[1]+"/secrets.json"):
            try:
                path = sys.argv[1]+"/secrets.json"
                secrets = json.loads(open(path).read())
            except Exception:
                try:
                    secrets = json.loads(open(path).read())
                except Exception:
                    path = raw_input("Please enter the path to secrets.json (global): ")+"/secrets.json"
                    secrets = json.loads(open(path).read())
        print "Using path '"+path+"' for secrets.json"
        return secrets

    def connect_to_db(self):
        self.client = MongoClient('mongodb://'+IP+':'+PORT+'/')
        self.db = self.client[DB_NAME]
        print "Connected to Database '"+DB_NAME+"'"

    def get_session(self):
        url = "https://moodle.regis.org/login/index.php"
        values = {'username': self.username, 'password': self.password}
        session = requests.Session()
        r = session.post(url, data=values)
        parsed_body = html.fromstring(r.text)
        title = parsed_body.xpath('//title/text()')[0]

        # Check whether login was successful or not
        if not "My home" in title:
            print "Failed to login to Moodle, check your credentials."
            quit()
        print "Logged into Moodle."

        url = "https://intranet.regis.org/login/submit.cfm"
        values = {'username': self.username, 'password': self.password, 'loginsubmit': ''}
        r = session.post(url, data=values)
        parsed_body = html.fromstring(r.text)
        try:
            title = parsed_body.xpath('//title/text()')[0]
            if not "Intranet" in title:
                print "Failed to login to the Intranet, check your credentials."
                quit()
        except:
            print "Failed to login to the Intranet, check your credentials."
            quit()

        print "Logged in to the Intranet."
        return session

    def init_mods(self):
        self.viewer = Viewer(self.db)
        self.scraper = Scraper(self.db, self.session)
        self.cli = CLI(self.db)

    def exit(self):
        self.client.close()

ontrac = OnTrac()
