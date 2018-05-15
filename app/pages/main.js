const {h} = require('hyperapp');
const {h1} = require('../lib/hyperscript');
const {goto} = require('../helpers/link');
const {dilute} = require('../helpers/list');
const {flatten} = require('../helpers/list');

const props = (title, children) => h('dl', {class: 'projectProps'}, [
  h('dt', {class: 'projectProps-key'}, `${title}:`),
  h('dd', {class: 'projectProps-value'}, children),
]);

const projectList = (prop) => (
  h('ul', prop, prop.projects.map((project, key) => (
    h('li', {key, class: 'projectList-item'}, [
      h('h3', {}, project.title),
      h('p', {}, project.intro),
      h('div', {}, [
        ...flatten(project.links.map((link, key) =>
            [
              h('a', {
                key,
                href: link.url,
                class: 'projectList-itemLink',
              }, link.label),
              ' ',
            ]
        )),
        props(
          'type',
          project.type,
        ),
        props(
          'env',
          dilute(project.env, ', '),
        ),
        props(
          'role',
          project.role,
        ),
        props(
          'state',
          project.state,
        ),
      ]),
    ])
  )))
);

const logo = () => (
  h('img', {
    class: 'logo',
    src: '/assets/logo.png',
    width: '16',
    height: '16',
  })
);

module.exports = ({mainPage}, actions) => {
  actions.setTitle('Rumkin');

  return h('div', {class: 'container'}, [
    h('div', {class: 'hero'}, [
      h1({}, [
        logo(),
        'Rumkin X',
      ]),
      h('p', {}, [
        'Software development for unix, web and ethereum. Contacts: ',
        h('a', {href: 'mailto:dev@rumk.in'}, 'dev@rumk.in'),
        ', ',
        h('a', {href: 'https://github.com/rumkin'}, 'github'),
        ', ',
        h('a', {href: 'https://twitter.com/rumkin'}, 'twitter'),
        '.',
      ]),
    ]),
    h(projectList, {
      projects: mainPage.projects,
      class: 'projectList',
    }),
  ]);
};
