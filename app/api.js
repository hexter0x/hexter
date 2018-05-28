const axios = require('axios');

class HttpAdapter {
  constructor(url) {
    this.axios = axios.create({
      baseURL: url,
    });
  }

  getNextParams(address) {
    return this.axios.request({
      url: `/accounts/${address}/next`,
      method: 'get',
      headers: {
        accept: 'application/json',
      },
    })
    .then((res) => res.data);
  }

  publishPacket(packet, signature) {
    return this.axios.request({
      method: 'post',
      url: '/actions',
      data: packet,
      headers: {
        'x-signature': signature,
        'content-type': 'text/plain',
        'accept': 'application/json',
      },
    })
    .then((res) => res.data);
  }

  getMainPage() {
    return this.axios.request({
      method: 'get',
      url: '/accounts/new',
    })
    .then((res) => res.data);
  }

  getAccountMessages(address, page) {
    return this.axios.request({
      method: 'get',
      url: '/messages',
      params: {address, page},
    })
    .then((res) => res.data);
  }

  getAccountMessage(address, nonce) {
    return this.axios.request({
      method: 'get',
      url: `/accounts/${address}/messages/${nonce}`,
    })
    .then((res) => res.data);
  }
}

class Api {
  constructor(adapter) {
    this.adapter = adapter;
  }

  getNextParams(address) {
    return this.adapter.getNextParams(address);
  }

  getMainPage() {
    return this.adapter.getMainPage();
  }

  publishPacket(packet, signature) {
    return this.adapter.publishPacket(packet, signature);
  }

  getAccountMessages(address, page = 1) {
    return this.adapter.getAccountMessages(address, page);
  }

  getAccountMessage(address, nonce) {
    return this.adapter.getAccountMessage(address, nonce);
  }
}

module.exports = Api;
Api.HttpAdapter = HttpAdapter;
