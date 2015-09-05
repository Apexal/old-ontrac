from ontrac_py import ontrac

print "Removed ", ontrac.db.students.delete_many({}).deleted_count, "students"
print "Removed ", ontrac.db.teachers.delete_many({}).deleted_count, "teachers"
print "Removed ", ontrac.db.courses.delete_many({}).deleted_count, "courses"
print "Removed ", ontrac.db.advisements.delete_many({}).deleted_count, "advisements"
ontrac.scraper.loop(1, 600, "course")
ontrac.scraper.loop(1, 2500, "person")
