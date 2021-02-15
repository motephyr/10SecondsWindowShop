'use strict'
const Persona = use("Persona");

class UserController {
  async update({ request, auth, response }) {
    auth = auth.authenticator('jwt')
    const payload = request.only(['role'])
    const user = auth.user
    await Persona.updateProfile(user, payload)
    return response.send({user})
  }
}

module.exports = UserController
