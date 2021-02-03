'use strict'

const Item = use('App/Models/Item')
const Helpers = use('Helpers')

class ItemController {
  async index({ view }) {
    const items = await Item.all()
    return view.render("item.index", { items: items });
  }
  add({ view }) {
    return view.render("item.add");
  }
  async store({ request, response, auth }) {

    const { title, price } = request.all()

    const file = request.file('video_file')

    const filename = `${new Date().getTime()}_${file.clientName}`
    await file.move(Helpers.publicPath('uploads'), {
      name: filename,
      overwrite: true
    })

    const item = await Item.create({ user_id: auth.user.id, title, price, video_path: `uploads/${filename}` })
    await item.save()

    return response.redirect('/items');
  }
}

module.exports = ItemController
