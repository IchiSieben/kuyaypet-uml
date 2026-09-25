# Despliegue

- Hostinger (orden 1008316349, usuario u901782070): https://deepskyblue-toad-157997.hostingersite.com/ — zip de `dist/` subido por TUS y `hosting_deployStaticSiteArchiveV1`. `public/.htaccess` pone `no-transform` para que la CDN no recomprima diagramas; purgar caché tras desplegar.
- GitHub Pages (Actions, `.github/workflows/pages.yml`): https://ichisieben.github.io/kuyaypet-uml/
- Verificación: `node tools/verify_live.mjs <url1> <url2>` + hash de los 81 diagramas.
