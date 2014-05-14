/**
 * This view shows a login modal dialog.
 */
girder.views.LoginView = girder.View.extend({
    events: {
        'submit #g-login-form': function (e) {
            e.preventDefault();

            var authStr = btoa(this.$('#g-login').val() + ':' +
                               this.$('#g-password').val());
            girder.restRequest({
                path: 'user/authentication',
                type: 'GET',
                headers: {
                    'Authorization': 'Basic ' + authStr
                },
                error: null // don't do default error behavior
            }).done(_.bind(function (resp) {
                this.$el.modal('hide');

                // Save the token for later
                resp.user.token = resp.authToken.token;

                girder.currentUser = new girder.models.UserModel(resp.user);
                girder.events.trigger('g:login');
            }, this)).error(_.bind(function (err) {
                this.$('.g-validation-failed-message').text(err.responseJSON.message);
                this.$('#g-login-button').removeClass('disabled');
            }, this));

            this.$('#g-login-button').addClass('disabled');
            this.$('.g-validation-failed-message').text('');
        },

        'click a.g-register-link': function () {
            girder.events.trigger('g:registerUi');
        },

        'click a.g-forgot-password': function () {
            girder.events.trigger('g:resetPasswordUi');
        }
    },

    render: function () {
        var view = this;
        this.$el.html(jade.templates.loginDialog()).girderModal(this)
            .on('shown.bs.modal', function () {
                view.$('#g-login').focus();
            }).on('hidden.bs.modal', function () {
                var curRoute = Backbone.history.fragment;
                if (curRoute.slice(-5) === 'login') {
                    girder.router.navigate(curRoute.slice(0, -6));
                }
            });
        this.$('#g-login').focus();

        var curRoute = Backbone.history.fragment;
        if (curRoute.slice(-5) !== 'login') {
            girder.router.navigate(curRoute + '?login');
        }
        return this;
    }

});

girder.router.route('login', 'login', function () {
    girder.events.trigger('g:loginUi');
});

girder.router.route(/^(.*?)\?login$/, 'login', function () {
    girder.events.trigger('g:loginUi');
});
