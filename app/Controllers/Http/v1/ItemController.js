'use strict'

const Item = use('App/Models/Item')
const Drive = use('Drive')
const Record = use('App/Models/Record')
const fs = require('fs')
const ffmpeg = require('fluent-ffmpeg');

class ItemController {
  async index({request, response, auth }) {
    auth = auth.authenticator('jwt')
    const { kind } = request.all()
    let items
    if (auth.user && kind === 'isBuyerPage') {
      items = await auth.user.buyerItems().orderBy('id').fetch()
    } else {
      items = await Item.query().where({ status: 'publish' }).orderBy('id').fetch()
    }
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

    const { title, price } = request.all()
    const file = request.file('video_file')


    await new Promise((resolve) => {
      const outputPath = "tmp/uploads/clip.mp4";
      const fileName = `${Date.now()}.${file.subtype}`

      new ffmpeg(file.tmpPath)
        .output(outputPath)
        .outputOptions(['-movflags isml+frag_keyframe'])
        .toFormat('mp4')
        .withAudioCodec('copy')
        .on('error', function (err, stdout, stderr) {
          console.log('an error happened: ' + err.message);
          console.log('ffmpeg stdout: ' + stdout);
          console.log('ffmpeg stderr: ' + stderr);
        })
        .on('end', async () => {
          let stream = await fs.createReadStream(outputPath)
          const url = await Drive.put(`user/${user.id}/item/${fileName}`, stream, {
            ContentType: file.headers['content-type'],
            ACL: 'public-read'
          })
          console.log(url)
          const item = await Item.create({ user_id: user.id, title, price, video_path: url, status: 'draft', last_drafted_at: new Date() })
          await item.save()

          resolve()

        })
        .on('progress', function (progress) {
          console.log('Processing: ' + progress.percent + '% done');
        }).run()

    }).catch(err => { console.log(err) });

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
    // await item.delete()
    item.merge({ status: 'deleted', last_deleted_at: new Date() })
    await item.save()
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
