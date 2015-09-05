import os
import requests, sys
from lxml import html
from time import sleep
import json
import datetime

class Scraper:
    def __init__(self, db, session):
        print "Initialized Moodle Scraper"
        self.session = session
        self.db = db
    
    def loop(self, from_id, to_id, category):
        for i in range(from_id, to_id + 1):
            self.extract(i, category)

    def extract(self, ID, category):
        base_url = "http://moodle.regis.org/user/profile.php?id="
        if category is "course":
            base_url = "http://moodle.regis.org/course/view.php?id="
        # Get the page
        r = self.session.get(base_url + str(ID))  # The url is created by appending the current ID to the base url
        # Parse the html returned so we can find the title
        #print r.text
        parsed_body = html.fromstring(r.text)
        # Get the page title
        title = parsed_body.xpath('//title/text()')
        # Check if page is useful
        if len(title) == 0:
            print "Bad title"
            return

        if "Test" in title:
            print "Skipped test entry"
            return

        if ("Error" in title[0].strip()) or ("Notice" in title[0].strip()):
            #print "Error or Notice skipped"
            return

        # COURSE
        title = parsed_body.xpath('//title/text()')[0]
        parts = title.split(": ")
        if parts[0] == "Course":
            name = parts[1]
            ps = name.split(" ")

            teacher = parts[2] if len(parts) > 2 else "Unknown"

            if "Advisement " in name:
                out = {
                    "tID": teacher,
                    "title": name.replace("Advisement ", ""),
                    "mID": ID
                }
                print "Advisement " + str(ID) + ": " + str(self.db.advisements.insert_one(out).inserted_id)

            else:
                grade = 13
                for pa in ps:
                    for index, g in enumerate(["I", "II", "III", "IV"]):
                        if g == pa:
                            grade = 9 + index
                    try:
                        grade = int(pa)
                    except ValueError:
                        pass
                courseType = "class"
                if "Club" in name or "Society" in name:
                    courseType = "club"

                if "REACH" in name or "Reach" in name:
                    courseType = "reach"

                out = {
                    "full": title,
                    "courseType": courseType,
                    "mID": ID,
                    "title": name,
                    "students": [],
                    "grade": grade
                }
                print "Course " + str(ID) + ": " + str(self.db.courses.insert_one(out).inserted_id)
        else:
            # USER
            name_parts = parsed_body.xpath('//title/text()')[0].split(":")[0].split(", ") if len(
                parsed_body.xpath('//title/text()')) > 0 else ['Unknown']
            department = parsed_body.xpath('//dl/dd[1]/text()')
            if len(department) == 0:
                return
            else:
                department = department[0]
            class_as = parsed_body.xpath('//dl/dd[2]/a')

            classes = []
            for a in class_as:
                classes.append(int(a.get("href").split("id=")[1]))

            f = department[0]
            try:
                int(f)
                userType = "student"
            except ValueError:
                userType = "teacher"

            if department.startswith("REACH"):
                userType = "other"

            picsrc = "/images/person-placeholder.jpg"

            for img in parsed_body.xpath('//img[@class=\'userpicture\']'):
                picsrc = img.get("src")

            collect = self.db.courses
            courses = []

            try:
                if userType == "student":
                    username = name_parts[1].lower()[0].replace(" ", "").replace("\'", "") + name_parts[0].lower().replace("\'", "").replace(" ", "") + str(19 - int(f))
                    out = {
                        "mID": ID,
                        "firstName": name_parts[1],
                        "lastName": name_parts[0],
                        "username": username,
                        "code": "Unknown",
                        "mpicture": picsrc,
                        "email": username + "@regis.org",
                        "advisement": department,
                        "courses": courses,
                        "sclasses": classes,
                        "rank": 0,
                        "registered": False
                    }
                    newID = self.db.students.insert_one(out).inserted_id
                    print "Student " + str(ID) + ": " + str(newID)
                    self.db.advisements.update_one({"title": department}, {"$push": {"students": newID} } )
                    print "Added Student "+str(ID)+" to Advisement "+department

                    if classes:
                        for c in classes: # C IS A MOODLE ID
                            course = collect.find_one({"mID": c})
                            if course:
                                cID = course['_id']
                                collect.update_one({"mID": c}, {"$push": {"students": newID}})
                                self.db.students.update_one({"_id": newID}, {"$push": {"courses": cID}})

                else:
                    username = name_parts[1].lower()[0].replace(" ", "").replace("\'", "") + name_parts[0].lower().replace("\'", "").replace(" ", "")
                    out = {
                        "userType": userType,
                        "mID": ID,
                        "image": picsrc,
                        "department": department,
                        "firstName": name_parts[1],
                        "lastName": name_parts[0],
                        "username": username,
                        "email": name_parts[1].lower()[0].replace(" ", "") + name_parts[0].lower().replace(" ",
                                                                                                           "") + "@regis.org",
                        "sclasses": classes,
                        "courses": courses
                    }
                    newID = self.db.teachers.insert_one(out).inserted_id
                    print "Teacher " + str(ID) + ": " + str(newID)
                    for c in classes:
                        course = collect.find_one({"mID": c})
                        if course:
                            if name_parts[0] in course["full"]:
                                print "COURSE:", course['title']
                                collect.update_one({
                                  '_id': course['_id']
                                },{
                                  '$set': {
                                    'teacher': newID
                                  }
                                }, upsert=False)
                            self.db.teachers.update_one({"_id": newID}, {"$push": {"courses": course['_id']}})
                        adv = self.db.advisements.find_one({"mID": c})
                        if adv:
                            self.db.advisements.update_one({
                              'mID': c
                            },{
                              '$set': {
                                'teacher': newID
                              }
                            })
                            print "Set Teacher "+str(ID)+" as Advisor of "+adv['title']

            #raw_input("Continue?")
            except Exception as e:
                print e
