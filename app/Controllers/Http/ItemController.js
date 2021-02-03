'use strict'

const Item = use('App/Models/Item')
const Helpers = use('Helpers')
const Drive = use('Drive')
const { validate } = use("Validator");

class ItemController {
  async index({ view }) {
    const items = await Item.all()
    return view.render("item.index", { items: items });
  }
  add({ view }) {
    return view.render("item.add");
  }
  async store({ request, response, session, auth }) {

    let title = ''
    let price = 0
    let url = ''

    request.multipart.field((name, value) => {
      if (name === 'title') {
        title = value
      } else if (name === 'price') {
        price = value
      }
    });
    request.multipart.file('video_file', {
      types: ["mov", "mp4"],
      size: "20mb"
    }, async file => {
      const filename = `${new Date().getTime()}_${file.clientName}`
      // set file size from stream byteCount, so adonis can validate file size
      file.size = file.stream.byteCount

      // run validation rules
      await file.runValidations()

      // catches validation errors, if any and then throw exception
      const error = file.error()
      if (error.message) {
        throw new Error(error.message)
      }

      // upload file to s3
      url = await Drive.put(`user/${auth.user.id}/item/${filename}`, file.stream, {
        ContentType: file.headers['content-type'],
        ACL: 'public-read'
      })
    })

    await request.multipart.process()
    const rules = {
      title: 'required',
      price: 'required|number|min:0.01'
    }

    const validation = await validate({ title, price }, rules)

    if (validation.fails()) {
      session
        .withErrors(validation.messages())
        .flashAll()

      return response.redirect('back')
    }
    const item = await Item.create({ user_id: auth.user.id, title, price, video_path: url, status: 'draft', last_drafted_at: new Date() })
    await item.save()


    return response.redirect('/items');
  }
}

module.exports = ItemController
