Messages = new Meteor.Collection("messages");

if (Meteor.isClient) {

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_AND_OPTIONAL_EMAIL"
  });

  Router.map(function() {
      this.route('chat', {
          path: '/',
          layoutTemplate: 'layout'
      });
      this.route('config', {
          path: '/config',
          layoutTemplate: 'layout'
      });
  });

  Template.chat.helpers({
    messages: function() {
        return Messages.find({}, {sort: {time: -1}}).fetch();
    }
  });

  Template.chat.events({
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
