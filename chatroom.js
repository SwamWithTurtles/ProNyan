Messages = new Meteor.Collection("messages");

if (Meteor.isClient) {

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_AND_OPTIONAL_EMAIL"
  });

    var authorisePageFor = function(pause) {
        if (!Meteor.loggingIn() && !Meteor.user()) {

            this.render('login');
            pause();
        }
    }

    Router.map(function() {
      this.route('chat', {
          path: '/',
          layoutTemplate: 'layout',
          onBeforeAction: authorisePageFor
      });
      this.route('config', {
          path: '/config',
          layoutTemplate: 'layout',
          onBeforeAction: authorisePageFor
      });
      this.route('login', {
          path: '/login',
          layoutTemplate: 'layout'
      });
  });

  Template.chat.helpers({
    messages: function() {
        if(document.getElementById("chats")) {
          document.getElementById("chats").scrollTop = 5000;
          document.getElementById("chatbox").scrollTop = 5000;
        }
        return Messages.find({}, {sort: {time: 1}}).fetch();
    }
  });

    Template.chat.events({
        'submit #goForm' : function (e) {
            // template data, if any, is available in 'this'
            Messages.insert({
                user: Meteor.user().username,
                message: $("#message")[0].value,
                time: new Date()
            });
            e.preventDefault();
            $("#message")[0].value = "";
        }
    });

    Template.config.helpers({
      pronNom: function() {
        var username = (Meteor.user() || {username:false}).username;
        if(username) {
          var url = "http://172.22.87.17:8080/getUserPreferences?userId=" + username.toLowerCase();
          console.log(url);
          var x;
          $.get(url, {}, function (data) {
            $("#pron-nom")[0].value = data.pronouns.they;
            $("#pron-obl")[0].value = data.pronouns.them;
            $("#pron-det")[0].value = data.pronouns.their;
            $("#pron-poss")[0].value = data.pronouns.theirs;
            $("#pron-refl")[0].value = data.pronouns.themselves;
          });

        }
        return "";
      }
    });

    Template.config.events({
        "click #change" : function () {
            // template data, if any, is available in 'this'
            var nom = $("#pron-nom")[0].value;
            var obl =  $("#pron-obl")[0].value;
            var det = $("#pron-det")[0].value;
            var poss = $("#pron-poss")[0].value;
            var refl = $("#pron-refl")[0].value;

            var url = "http://172.22.87.17:8080/setUserPreferences?userId=" + Meteor.user().username.toLowerCase() +
            "&they=" + nom + "&them=" + obl + "&their=" + det + "&themselves=" + refl + "&theirs=" + poss;

            $.get(url, {}, function() {

                $(".success").show();
                setTimeout(function() {$(".success").hide(1000);}, 1000)

            });
        },

        "change #fillables" : function(){
            var selectedPronouns = $.parseJSON($("select")[0].value);
            $("#pron-nom").val(selectedPronouns.they);
            $("#pron-obl").val(selectedPronouns.them);
            $("#pron-det").val(selectedPronouns.their);
            $("#pron-poss").val(selectedPronouns.theirs);
            $("#pron-refl").val(selectedPronouns.themselves);
        }

    });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
  });
}
