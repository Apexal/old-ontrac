import pymongo

class Viewer:
    def __init__(self, db):
        print "Initialized MongoDB viewer"

    def view(self, mID):
        print "Getting info on Moodle ID "+str(mID)+"... "
