# qrcode-generator

This directory includes the unmodified JavaScript QR generator by Kazuhiko Arase.

- Upstream: https://github.com/kazuhikoarase/qrcode-generator
- Source: https://raw.githubusercontent.com/kazuhikoarase/qrcode-generator/master/js/dist/qrcode.js
- Retrieved: 2026-10-29
- SHA-256 of the vendored file: `79ec86f82856005b1c887905cfccfcfbec3821ca61c7fd5a952faa5f778f791c`
- License: MIT, retained in `LICENSE-qrcode-generator.txt` and the source header.
- Website use: local browser generation of product story URLs; no network QR service.

```js
const code = qrcode(0, 'M'); // automatic version, medium error correction
code.addData(new URL('stories/shezhi.html', siteRoot).href);
code.make();
container.innerHTML = code.createSvgTag({
  cellSize: 6,
  margin: 24,
  scalable: true,
  alt: { text: '畲织故事二维码', id: 'qr-shezhi-description' }
});
```

Use unique SVG description IDs when rendering more than one QR code. The 24 px margin above keeps a four-module quiet zone at a module size of 6 px.
