'use strict'

const Item = use('App/Models/Item')
const Drive = use('Drive')
const { validate } = use("Validator");
const User = use('App/Models/User')

class ItemController {
  async store({ request, response }) {

    let title = ''
    let price = 0
    let url = ''
    let email = ''
    let userid = ''

    request.multipart.field(async (name, value) => {
      if (name === 'title') {
        title = value
      } else if (name === 'price') {
        price = value
      } else if (name === 'email') {
        email = value
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

      const user = await User.findBy({ email: email })
      userid = user.id
      // upload file to s3
      url = await Drive.put(`user/${userid}/item/${filename}`, file.stream, {
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
      return response.send('fail')
    }
    console.log(url)
    const item = await Item.create({ user_id: userid, title, price, video_path: url, status: 'draft', last_drafted_at: new Date() })
    await item.save()


    return response.send('ok');
  }
}

module.exports = ItemController
