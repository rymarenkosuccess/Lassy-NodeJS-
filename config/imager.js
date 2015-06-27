module.exports = {
  variants: {
    article: {
      resize: {
        detail: "x440"
      },
      crop: {
        thumb: "160000@"
      },
      resizeAndCrop: {
        mini: {resize: "63504@", crop: "252x210"}
      }
    },

    gallery: {
      crop: {
        thumb: "100x100"
      }
    }
  },

  storage: {
    Rackspace: {
      auth: {
        username: "USERNAME",
        apiKey: "API_KEY",
        host: "lon.auth.api.rackspacecloud.com"
      },
      container: "CONTAINER_NAME"
    },
    S3: {
      key: 'AKIAIJUQCAIKM0ZWFWYQ',
      secret: 'ckqOAy9+qbEabUiv7NcX6uVXe4fx/FqEnK2oWJTt',
      bucket: 'lassy-img-storage',
      region: 'US Standard'
    }
  },

  debug: true
}
