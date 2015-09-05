#!/usr/bin/python2
__author__ = "frank"

import sys
import os
import scraper
import cli
import json

VERSION = "0.1"
PATH = os.path.abspath(os.path.join(os.path.dirname(__file__),"..")) + "/secrets.json"

class OnTrac:
    def __init__(self):
        print "Initalized OnTrac v"+VERSION

        self.secrets = self.get_secrets()
        self.username = self.secrets['regis_username']
        self.password = self.secrets['regis_password']
        print "Found info for Regis student '"+self.username+"'"

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

    def exec_cli(self):
        cli.main()

OnTrac()
