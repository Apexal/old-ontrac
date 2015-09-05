#!/usr/bin/python2
__author__ = "frank"

import sys
import os
import scraper
import cli
import json

VERSION = "0.0"
PATH = os.path.abspath(os.path.join(os.path.dirname(__file__),"..")) + "/secrets.json"


class OnTrac:
    def __init__(self):
        print "Initalizing OnTrac v"+VERSION

        path = self.get_path()

        self.secrets = json.loads(open(path).read())
        self.username = self.secrets['regis_username']
        self.password = self.secrets['regis_password']
        print "Found info for Regis student '"+self.username+"'"
        if len(sys.argv) > 1 and sys.argv[1] == "cli":
            self.exec_cli()
        print "Done.\n"

    def get_path(self):
        path = PATH
        if os.path.isfile(PATH) == False:
            if len(sys.argv) > 1 and os.path.isfile(sys.argv[1]) == True:
                path = sys.argv[1]+"/secrets.json"
            else:
                path = raw_input("Please enter the path to secrets.json (global): ")+"/secrets.json"

        print "Using path '"+path+"' for secrets.json"
        return path

    def exec_cli(self):
        cli.main()

OnTrac()
