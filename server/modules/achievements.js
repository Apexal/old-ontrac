var moment = require("moment");

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
    },
    {
      id: 9,
      name: "Be a Member for a Year",
      reward: 1000,
      check: function(user) {
        //if(moment(user.registered_date).diff(moment(), 'year') => 1)
        //  return true;
        return false;
      }
    },
    {
      id: 10,
      name: "Be a Member for 2 Years",
      reward: 5000,
      check: function(user) {
        //if(moment(user.registered_date).diff(moment(), 'year') => 2)
        //  return true;
        return false;
      }
    },
    {
      id: 11,
      name: "Be an Alpha Tester",
      reward: 200,
      check: function(user){
        return true;
      }
    },
    {
      id: 12,
      name: "Start tracking Homework",
      reward: 300,
      check: function(user){
        // THIS WILL BE SET IN THE HOMEWORK ROUTE
        return false;
      }
    }
]
