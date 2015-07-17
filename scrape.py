#!/usr/bin/python2

import requests, sys
from lxml import html
from time import sleep
import getpass
import json
import datetime
import pymongo
from pymongo import MongoClient

username = "fmatranga18"
password = "1hope1havenotusedthisbefore!"

client = MongoClient('mongodb://localhost:27017/')
db = client['all']


def extract(ID, html):
    # COURSE
    title = html.xpath('//title/text()')[0]
    parts = title.split(": ")
    if parts[0] == "Course":
        name = parts[1]
        ps = name.split(" ")

        teacher = parts[2] if len(parts) > 2 else "Unknown"

        if "Advisement " in name:
            out = {
                "tID": teacher,
                "title": name,
                "mID": ID
            }
            print "Advisement " + str(ID) + ": " + str(db.advisements.insert_one(out).inserted_id)

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
                "courseType": courseType,
                "mID": ID,
                "title": name,
                "tID": teacher,
                "grade": grade
            }
            print "Course " + str(ID) + ": " + str(db.courses.insert_one(out).inserted_id)
    else:
        # USER
        name_parts = html.xpath('//title/text()')[0].split(":")[0].split(", ") if len(
            html.xpath('//title/text()')) > 0 else ['Unknown']
        department = html.xpath('//dl/dd[1]/text()')
        if len(department) == 0:
            return
        else:
            department = department[0]
        class_as = html.xpath('//dl/dd[2]/a')

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

        picsrc = ""

        for img in html.xpath('//img[@class=\'userpicture\']'):
            picsrc = img.get("src")

        try:
            if userType == "student":
                username = name_parts[1][0].lower() + name_parts[0].lower() + str(19 - int(f))
                out = {
                    "mID": ID,
                    "firstName": name_parts[1],
                    "lastName": name_parts[0],
                    "username": username,
                    "code": "Uknown",
                    "email": username + "@regis.org",
                    "advisement": department,
                    "classes": classes,
                    "password": "Unknown",
                    "rank": 0,
                    "points": 0,
                    "login_count": 0,
                    "last_login_time": datetime.datetime(2000, 1, 1, 0, 0, 0),
                    "last_point_login_time": datetime.datetime(2000, 1, 1, 0, 0, 0),
                    "preferences": {},
                    "verified": False,
                    "registered_date": datetime.datetime(2000, 1, 1, 0, 0, 0),
                    "registered": False
                }
                print "Student " + str(ID) + ": " + str(db.students.insert_one(out).inserted_id)
            else:
                out = {
                    "userType": userType,
                    "mID": ID,
                    "image": picsrc,
                    "department": department,
                    "firstName": name_parts[1],
                    "lastName": name_parts[0],
                    "email": name_parts[1].lower()[0].replace(" ", "") + name_parts[0].lower().replace(" ",
                                                                                                       "") + "@regis.org",
                    "classes": classes
                }
                print "Teacher " + str(ID) + ": " + str(db.teachers.insert_one(out).inserted_id)
        except Exception as e:
            print "ERROR: " + str(e)

def main():
    print "Logging in... ",
    url = "https://moodle.regis.org/login/index.php"
    values = {'username': username, 'password': password}
    session = requests.Session()
    r = session.post(url, data=values)
    parsed_body = html.fromstring(r.text)
    title = parsed_body.xpath('//title/text()')[0]

    # Check whether login was successful or not
    if not "My home" in title:
        print "Failed to login, check your credentials."
        quit()

    print "DONE"

    print "Removed ", db.students.delete_many({}).deleted_count, "students"
    print "Removed ", db.teachers.delete_many({}).deleted_count, "teachers"
    print "Removed ", db.courses.delete_many({}).deleted_count, "courses"
    print "Removed ", db.advisements.delete_many({}).deleted_count, "advisements"

    scrape(1, 2500, "http://moodle.regis.org/user/profile.php?id=", session)
    scrape(1, 700, "http://moodle.regis.org/course/view.php?id=", session)

def scrape(from_id, to_id, base_url, session):
    for i in range(from_id, to_id + 1):
        # Get the page
        r = session.get(base_url + str(i))  # The url is created by appending the current ID to the base url
        # Parse the html returned so we can find the title
        parsed_body = html.fromstring(r.text)
        # Get the page title
        title = parsed_body.xpath('//title/text()')
        # Check if page is useful
        if len(title) != 0:
            if title[0].strip() != "Error" and title[0].strip() != "Notice":
                extract(i, parsed_body)


if __name__ == "__main__":
    main()
