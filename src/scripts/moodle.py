#!/usr/bin/python2

import requests, sys
from lxml import html
from time import sleep
import json
import datetime

path = os.path.abspath(os.path.join(os.path.dirname(__file__),"..")) + "/secrets.json"
secrets = json.loads(open(path).read())
username = secrets['regis_username']
password = secrets['regis_password']

commands = ['exit', 'help', 'view']

def is_valid_command(com):
    com = com.split(" ")
    if not com[0] in commands:
        return False
    else:
        return True

def run_command(input, session):
    split = input.split(" ")
    c = split[0]
    args = split[1::]
    #print c, args

    globals()[c](args, session)

def extract(ID, html):
    print "\n===JSON==="
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
            print out
            print ""
            print "\n===ADVISEMENT INFO==="
            print "Moodle ID#:\t"+ID
            print "Name:\t"+out['title']
            print "Teacher:\t"+teacher
            print ""
        else:
            grade = ""
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
                #"tID": teacher,
                "grade": grade
            }
            print out
            print ""
            print "\n===COURSE INFO==="
            print "Moodle ID#:\t"+ID
            print "Type:\t\t"+out['courseType']
            print "Title:\t\t"+out['title']
            print "Teacher:\t"+teacher
            if out['grade'] != "":
                print "Grade:\t\t"+str(out['grade'])
            print ""
    else:
        # USER
        name_parts = html.xpath('//title/text()')[0].split(":")[0].split(", ") if len(
            html.xpath('//title/text()')) > 0 else ['Unknown']
        dep = html.xpath('//dl/dd[1]/text()')
        department = "0D"
        if len(dep) != 0:
            department = dep[0]
        class_as = html.xpath('//dl/dd[2]/a')

        classes_names = []
        classes = []
        for a in class_as:
            classes_names.append(a.text + " ("+a.get("href").split("id=")[1]+")")
            classes.append(int(a.get("href").split("id=")[1]))

        f = department[0]

        if any(char.isdigit() for char in department):
            userType = "student"
        else:
            userType = "teacher"

        if department.startswith("REACH"):
            userType = "other"

        picsrc = ""

        for img in html.xpath('//img[@class=\'userpicture\']'):
            picsrc = img.get("src")


        if userType == "student":
            username = name_parts[1][0].lower() + name_parts[0].lower() + str(19 - int(f))
            out = {
                "mID": ID,
                "firstName": name_parts[1],
                "lastName": name_parts[0],
                "username": username,
                "code": "Unknown",
                "mpicture": picsrc,
                "email": username + "@regis.org",
                "advisement": department,
                "sclasses": classes
            }
            print out
            print ""
            print "\n===STUDENT INFO==="
            print "Moodle ID#:\t"+ID
            print "Full Name:\t"+out['firstName'] + " " + out['lastName']
            print "Username:\t"+out['username']
            print "Student ID#:\t"+out['code']
            print "Regis Email:\t"+out['email']
            if out['advisement'] != "0":
                print "Advisement:\t"+out['advisement']
            if out['mpicture'] != "":
                print "Moodle Image:\t"+out['mpicture']
            if len(out['sclasses']) > 0:
                print "Classes:\t"+', '.join(classes_names)
        else:
            username = name_parts[1].lower()[0].replace(" ", "") + name_parts[0].lower().replace(" ", "")
            out = {
                "userType": userType,
                "mID": ID,
                "code": "",
                "username": username,
                "image": picsrc,
                "department": department,
                "firstName": name_parts[1],
                "lastName": name_parts[0],
                "email": username + "@regis.org",
                "sclasses": classes
            }
            print out
            print ""
            print "\n===TEACHER INFO==="
            print "Moodle ID#:\t"+ID
            print "Full Name:\t"+out['firstName'] + " " + out['lastName']
            print "Username:\t"+out['username']
            if out['code']:
                print "Teacher ID#:\t"+out['code']
            print "Regis Email:\t"+out['email']
            print "Department:\t"+out['department']
            if out['image'] != "":
                print "Moodle Image:\t"+out['image']
            if len(out['sclasses']) > 0:
                print "Classes:\t"+', '.join(classes_names)
        print ""
################## COMMANDS ##################

def exit(args, session):
    sys.exit()

def help(args, session):
    print "\nCommand list:"
    for com in commands:
        print "* "+com
    print ""

def view(args, session):
    # view course|user ID
    if len(args) != 2:
        print "Invalid arguments. Correct usage is 'view <course|user> <ID>' 1"
        return

    to_get = args[0]
    ID = args[1]
    #print to_get, ID

    if to_get == "course":
        base_url = "http://moodle.regis.org/course/view.php?id="
    elif to_get == "user":
        base_url = "http://moodle.regis.org/user/profile.php?id="
    else:
        print "Invalid arguments. Correct usage is 'view <course|user> <ID>'"
        return

    r = session.get(base_url + str(ID))  # The url is created by appending the current ID to the base url
    # Parse the html returned so we can find the title
    parsed_body = html.fromstring(r.text)
    # Get the page title
    title = parsed_body.xpath('//title/text()')
    # Check if page is useful
    if len(title) != 0:
        if title[0].strip() != "Error" and title[0].strip() != "Notice":
            extract(ID, parsed_body)
        else:
            print "The specified "+to_get+" does not exist."
            return


##############################################



print "Logging in to Moodle as "+ username+"... "
url = "https://moodle.regis.org/login/index.php"
values = {'username': username, 'password': password}
session = requests.Session()
r = session.post(url, data=values)
parsed_body = html.fromstring(r.text)
title = parsed_body.xpath('//title/text()')[0]

# Check whether login was successful or not
if not "My home" in title:
    print "Failed to login, check your credentials."
    sys.exit()
print "Success."

while True:
    com = raw_input("> ")
    if is_valid_command(com):
        run_command(com, session)
    else:
        print "Command not found. Type 'help' for a list of commands."
