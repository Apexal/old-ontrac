module.exports = [
    {
        id: 0,
        name: "First Login",
        reward: 10,
        check: function(user){
            return true;
        }
    },
    {
        id: 1,
        name: "Set Up Profile",
        reward: 10,
        check: function(user){
            return (user.bio !== undefined);
        }
    },
    {
        id: 2,
        name: "Reach 100 Points",
        reward: 20,
        check: function(user){
            if(user.points >= 100)
                return true;
            return false;
        }
    },
    {
        id: 3,
        name: "Reach 200 Points",
        reward: 40,
        check: function(user){
            if(user.points >= 200)
                return true;
            return false;
        }
    },
    {
        id: 4,
        name: "Reach 400 Points",
        reward: 80,
        check: function(user){
            if(user.points >= 400)
                return true;
            return false;
        }
    },
    {
        id: 5,
        name: "Reach 800 Points",
        reward: 100,
        check: function(user){
            if(user.points >= 800)
                return true;
            return false;
        }
    },
    {
        id: 6,
        name: "Become a Moderator",
        reward: 60,
        check: function(user){
            if(user.rank >= 4)
                return true;
            return false;
        }
    },
    {
        id: 7,
        name: "Become a Administrator",
        reward: 70,
        check: function(user){
            if(user.rank >= 5)
                return true;
            return false;
        }
    },
    {
        id: 8,
        name: "Be the Legendary Frank Matranga",
        reward: 0,
        check: function(user){
            if(user.username == "fmatranga18")
                return true;
            return false;
        }
    }
]
