const fs=require('fs');
const r=f=>fs.readFileSync('src/'+f,'utf8');
const logic=r('logic.js').replace(/if \(typeof module[\s\S]*$/,'');
const body=`<div id="app" class="app"></div>
<div id="page"></div>
<nav id="nav" class="nav" aria-label="Разделы"></nav>
<button id="fab" class="fab" data-a="expNew" aria-label="Добавить расход"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>`;
const html=`<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Личный бюджет</title>
<meta name="description" content="Личный планер бюджета: поступления, конверты, платежи и история. Работает без интернета.">
<meta name="theme-color" content="#F5F2EA" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#13160F" media="(prefers-color-scheme: dark)">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Бюджет">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<style>
:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px)}
body{margin:0}
${r('style.css')}</style>
</head>
<body>
${body}
<script>
${logic}
${r('ui1.js')}
${r('ui2.js')}
${r('ui3.js')}
</script>
<script>
if ('serviceWorker' in navigator) { window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); }); }
</script>
</body>
</html>
`;
fs.writeFileSync('index.html',html);
console.log('index',html.length);
