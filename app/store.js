exports.mainPage = {
  projects: [
    {
      title: 'Bundler.online',
      intro: 'Online IDE created for fast prototyping, testing and hosting js apps and components, with easy collaboration, distribution and promoting.',
      type: 'platform',
      env: ['web', 'nodejs'],
      role: 'founder',
      state: 'alpha',
      links: [
        {
          url: 'https://bundler.online',
          label: 'site',
        },
      ],
    },
    {
      title: 'Typed Props',
      intro: 'Facebook\'s PropTypes interface implementation for client and server.',
      type: 'lib',
      env: ['web', 'nodejs'],
      role: 'author',
      state: 'production',
      links: [
        {
          url: 'https://github.com/rumkin/typed-props',
          label: 'github',
        },
        {
          url: 'https://npmjs/package/typed-props',
          label: 'npm',
        },
      ],
    },
    {
      title: 'Crypto Stamp',
      intro: 'Signature library for the web.',
      type: 'lib',
      env: ['web', 'nodejs'],
      state: 'production',
      links: [
        {
          url: 'https://github.com/rumkin/crypto-stamp',
          label: 'github',
        },
        {
          url: 'https://npmjs/package/crypto-stamp',
          label: 'npm',
        },
      ],
      role: 'author',
    },
    {
      title: 'Bake',
      intro: 'Task running tool written in bash.',
      type: 'util',
      env: ['unix'],
      state: 'production',
      links: [
        {
          url: 'https://github.com/rumkin/bake',
          label: 'github',
        },
      ],
      role: 'author',
    },
  ],
};
