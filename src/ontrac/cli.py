import scraper

COMMANDS = ['help', 'scrape', 'exit']

running = True

def is_valid_command(com):
    com = com.split(" ")
    if not com[0] in COMMANDS:
        return False
    else:
        return True

def run_command(input, session):
    split = input.split(" ")
    c = split[0]
    args = split[1::]
    #print c, args

    globals()[c](args, session)




################## COMMANDS ##################
def exit(args, session):
    global running
    running = False

def help(args, session):
    print "\nCommand list:"
    for com in COMMANDS:
        print "* "+com
    print ""

def main():
    print "[COMMAND LINE]"
    while running:
        com = raw_input("> ")
        if is_valid_command(com):
            run_command(com, None)
        else:
            print "Command not found. Type 'help' for a list of commands."

print "Initialized CLI"
