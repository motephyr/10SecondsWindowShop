'use strict'
const Persona = use("Persona");

class UserController {
  async update({ request, auth, response }) {
    const payload = request.only(['role'])
    const user = auth.user
    await Persona.updateProfile(user, payload)

    return response.redirect('/')
  }
}

module.exports = UserController
