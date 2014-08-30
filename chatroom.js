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

    Template.config.helpers({
        'click input' : function () {
            // template data, if any, is available in 'this'
            var nom = $("#pron-nom")[0].value;
            var obl =  $("#pron-obl")[0].value;
            var det = $("#pron-det")[0].value;
            var poss = $("#pron-poss")[0].value;
            var refl = $("#pron-refl")[0].value;

            var username = "brian";

            var url = "http://172.22.87.17:8080/setUserPreferences?userId=" + username +
            "&they=" + nom + "&them=" + obl + "&their=" + det + "&themselves=" + refl + "&theirs=" + poss;

            $.get(url, {}, function() {
                alert("success");
            });
        }
    });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
  });
}
