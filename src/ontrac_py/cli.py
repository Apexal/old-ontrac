import scraper

COMMANDS = ['help', 'scrape', 'exit']

running = True

class CLI:
    def __init__(self, db):
        print "Initialized CLI"

    def is_valid_command(self, com):
        com = com.split(" ")
        if not com[0] in COMMANDS:
            return False
        else:
            return True

    def run_command(self, input, session):
        split = input.split(" ")
        c = split[0]
        args = split[1::]
        #print c, args

        globals()[c](args, session)

    def run(self):
        print "[COMMAND LINE]"
        while running:
            com = raw_input("> ")
            if self.is_valid_command(com):
                self.run_command(com, None)
            else:
                print "Command not found. Type 'help' for a list of commands."


################## COMMANDS ##################
def exit(args, session):
    global running
    running = False

def help(args, session):
    print "\nCommand list:"
    for com in COMMANDS:
        print "* "+com
    print ""
