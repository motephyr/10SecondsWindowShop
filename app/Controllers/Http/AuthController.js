"use strict";
const Persona = use("Persona");
const Config = use("Config");
const User = use('App/Models/User')
const crypto = require("crypto");
const axios = require("axios");

const { validate } = use("Validator");

class AuthController {
  async login({ request, auth, response, session }) {
    const payload = request.only(["uid", "password"]);

    const user = await Persona.verify(payload);

    await auth.login(user);
    response.redirect(Config.get("adonis-auth-scaffold.registrationSuccessRedirectTo"));
  }

  async register({ request, auth, response, session }) {
    const payload = request.only([
      "email",
      "username",
      "password",
      "password_confirmation"
    ]);

    const validation = await validate(
      payload,
      Config.get("adonis-auth-scaffold.validationRules.registration"),
      Config.get("adonis-auth-scaffold.validationMessages")()
    );

    if (validation.fails()) {
      session.withErrors(validation.messages()).flashAll();
      return response.redirect("back");
    }

    const user = await Persona.register(payload);

    // optional
    await auth.login(user);
    response.redirect(Config.get("adonis-auth-scaffold.registrationSuccessRedirectTo"));
  }

  async forgotPassword({ request, response, session, auth }) {
    const token = request.input('token');
    const uid = request.input('uid');
    const payload = request.only(['password', 'password_confirmation']);

    if (!token) {
      await Persona.forgotPassword(uid);
      session.flash({ hasMadeResetRequest: 'true' })
      return response.redirect('back')
    }

    try {
      const user = await Persona.updatePasswordByToken(token, payload);

      await auth.login(user);
      return response.redirect(Config.get("adonis-auth-scaffold.registrationSuccessRedirectTo"));
    } catch (error) {
      if (error.name === 'InvalidTokenException') {
        session.flash({ errorMessage: 'The token supplied is not valid.' })
      } else {
        session.flash({ errorMessage: error.message })
      }
    }

    return response.redirect('back')
  }

  getLogin({ request, response, view }) {
    return view.render("auth.login");
  }

  getRegister({ request, response, view }) {
    return view.render("auth.register");
  }

  getResetPassword({ request, response, view, params }) {
    const token = request.input('token');
    return view.render("auth.password-reset", { token });
  }

  getAuthDashboard({ request, response, view }) {
    return view.render("auth.dashboard");
  }

  getLogout({ response, session }) {
    const loginRoute = Config.get("adonis-auth-scaffold.loginRoute");
    session.clear();

    return response.redirect('/')
  }


  async facebookLogin({ ally }) {
    await ally.driver('facebook').redirect()
  }

  async facebookCallback({ ally, auth, response }) {
    try {
      const fbUser = await ally.driver('facebook').getUser()

      // user details to be saved
      const userDetails = {
        email: fbUser.getEmail(),
        username: fbUser.getName(),
        password: crypto.randomBytes(20).toString('hex'),
        login_source: 'facebook'
      }

      // search for existing user
      const whereClause = {
        email: fbUser.getEmail()
      }

      const user = await User.findOrCreate(whereClause, userDetails)
      try {
        await auth.check()
      } catch (error) {
        await auth.login(user)
      }

      return response.redirect('/')
      // return 'Logged in'
    } catch (error) {
      console.log(error)
      return 'Unable to authenticate. Try again later'
    }
  }

  async facebookToken({ request, response, auth }) {
    const payload = request.only(["userId", "token"]);
    try {
      const url = `https://graph.facebook.com/${payload.userId}?fields=id,name,picture.width(720),birthday,email&access_token=${payload.token}`;
      const request = await axios.get(url);

      const userDetails = {
        email: request.data.email,
        username: request.data.name,
        password: crypto.randomBytes(20).toString('hex'),
        login_source: 'facebook'
      }

      // search for existing user
      const whereClause = {
        email: request.data.email
      }

      const user = await User.findOrCreate(whereClause, userDetails)
      const jwt = await auth.authenticator('api').generate(user)
      const result = {
        user: {id: user.id, username: user.username, email: user.email, access_token: jwt.token },
      }
      return response.send(result)
      // return 'Logged in'
    } catch (error) {
      console.log(error)
      return 'Unable to authenticate. Try again later'
    }
  }

}

module.exports = AuthController;
