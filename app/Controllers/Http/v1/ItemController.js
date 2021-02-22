'use strict'

const Item = use('App/Models/Item')
const Drive = use('Drive')
const { validate } = use("Validator");
const Record = use('App/Models/Record')

class ItemController {
  async index({ response }) {
    const items = await Item.query().where({ status: 'publish' }).orderBy('id').fetch()
    return response.send({ items: items.rows });
  }

  async show({ params, request, response }) {
    const { next, prev, period } = request.all()
    let item, afteritem

    item = await Item.find(params.id)
    item.merge({ view_count: item.view_count + 1, total_watch_time: item.total_watch_time + parseInt(period) })
    await item.save()
    if (next) {
      afteritem = await Item.query().where('id', '>', params.id).andWhere({ status: 'publish' }).orderBy('id').limit(1).fetch()

      afteritem = afteritem.rows[0]
    } else if (prev) {
      afteritem = await Item.query().where('id', '<', params.id).andWhere({ status: 'publish' }).orderBy('id', 'desc').limit(1).fetch()
      afteritem = afteritem.rows[0]
    }

    if (!afteritem) {
      afteritem = item
    }
    return response.send({ item: afteritem });
  }
  async myitems({ response, auth }) {
    auth = auth.authenticator('jwt')
    const user = auth.user
    const items = await user.items().orderBy('id').fetch()
    return response.send({ items: items });
  }
  async store({ request, response, auth }) {
    auth = auth.authenticator('jwt')
    const user = auth.user
    let title = ''
    let price = 0
    let url = ''

    request.multipart.field(async (name, value) => {
      if (name === 'title') {
        title = value
      } else if (name === 'price') {
        price = value
      }
    });
    request.multipart.file('video_file', {
      types: ["jpg", "jpeg", "png", "gif"],
      size: "2mb"
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
      url = await Drive.put(`user/${user.id}/item/${filename}`, file.stream, {
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
      return response.send({ result: 'fail' });
    }
    console.log(url)
    const item = await Item.create({ user_id: user.id, title, price, video_path: url, status: 'draft', last_drafted_at: new Date() })
    await item.save()


    return response.send({ result: 'ok' });
  }

  async update({ request, params, response, auth }) {
    auth = auth.authenticator('jwt')
    const user = auth.user
    let { status } = request.all()
    let item = (await Item.query().where({ id: params.id, user_id: user.id }).fetch()).first()
    item.merge({ status })
    if (status === 'draft') {
      item.merge({ last_drafted_at: new Date() })
    } else if (status === 'publish') {
      item.merge({ last_publish_at: new Date() })
    } else if (status === 'sold_out') {
      item.merge({ last_sold_out_at: new Date() })
    }
    await item.save()

    return response.send({ item });
  }

  async destroy({ request, params, response, auth }) {
    auth = auth.authenticator('jwt')
    const user = auth.user
    let item = (await Item.query().where({ id: params.id, user_id: user.id }).fetch()).first()
    await item.delete()

    return response.send({ item });
  }

  async checkUserInformation({ params, response, auth }) {
    auth = auth.authenticator('jwt')
    const user = auth.user
    let item = (await Item.query().with('user')
      .where({ id: params.id, status: 'publish' }).fetch()).first()
    let seller = await item.getRelated('user')
    let attr = { item_id: item.id, seller_user_id: item.user_id, buyer_user_id: user.id }

    const record = await Record.findOrCreate(attr, attr)
    await item.load('records');
    let records = await item.records().count();

    item.merge({ record_count: records[0].count })
    await item.save()
    return response.send({ record, seller: seller });
  }

}

module.exports = ItemController
