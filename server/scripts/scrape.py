from trp import TRP

# This clears the database and scrapes all Moodle info starting with courses
t = TRP("server/secrets.json")
print "Removed ", t.db.students.delete_many({}).deleted_count, "students"
print "Removed ", t.db.teachers.delete_many({}).deleted_count, "teachers"
print "Removed ", t.db.courses.delete_many({}).deleted_count, "courses"
print "Removed ", t.db.advisements.delete_many({}).deleted_count, "advisements"
t.scraper.loop(1, 600, "course")
t.scraper.loop(1, 2500, "person")
t.exit()
