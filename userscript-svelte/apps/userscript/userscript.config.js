export default {
  watchDir: './dist',
  port: 8765,
  buildCommand: 'npm run watch:all',
  scripts: [
    {
      name: 'RV Userscript (Target)',
      watchFile: 'rv-userscript-svelte.user.js',
      matches: [
        'https://reportus.prls.net/webapp/reports/*',
        'https://security-monitors.prls.net/user_audit/api/mail.py*'
      ],
      icon: '🎯',
      namespace: 'https://github.com/alludo'
    },
    {
      name: 'RV Userscript (Google POC)',
      watchFile: 'rv-userscript-svelte-google.user.js',
      matches: ['https://www.google.com/*'],
      icon: '🧪',
      namespace: 'https://github.com/alludo'
    }
  ]
};
