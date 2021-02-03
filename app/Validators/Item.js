'use strict'

class Item {
  get rules() {
    return {
      video_file: 'file|file_ext:mp4,mov|file_size:20mb|file_types:video',
      title: 'required',
      price: 'required|number|min:0.01'
    }
  }
  async fails(errorMessages) {
    this.ctx.session
      .withErrors(errorMessages)
      .flashAll()


    return this.ctx.response.redirect('back')
  }
}

module.exports = Item
