from trp import TRP

# This clears the database of all extra info (not users, teachers, courses)
t = TRP("src/", "192.168.1.145")
print "Removed ", t.db.days.delete_many({}).deleted_count, "days"
print "Removed ", t.db.hwitems.delete_many({}).deleted_count, "hwitems"
print "Removed ", t.db.grades.delete_many({}).deleted_count, "grades"
print "Removed ", t.db.reminders.delete_many({}).deleted_count, "reminders"
t.exit()
