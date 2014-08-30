Messages = new Meteor.Collection("messages");

if (Meteor.isClient) {

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_AND_OPTIONAL_EMAIL"
  })

  Template.hello.greeting = function () {
    return "Welcome to the_chatroom.";
  };


  Template.hello.helpers({
    messages: function() {
        return Messages.find({}, {sort: {time: -1}}).fetch();
    }
  })
  Template.hello.events({
    'click input' : function () {
      // template data, if any, is available in 'this'
      Messages.insert({
        user: Meteor.user().username,
        message: $("#message")[0].value,
        time: new Date()
      })
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
  });
}
