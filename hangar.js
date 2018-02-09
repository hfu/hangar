const MBTiles = require('@mapbox/mbtiles')
const zlib = require('zlib')
const fs = require('fs')
const params = {
  src: '/home/qdltc/experimental_fgd', ext: 'geojson',
  dst: './experimental_fgd.mbtiles'
}

new MBTiles(params.dst, (err, mbtiles) => {
  mbtiles.startWriting(err => {
    if (err) throw err
    for(let z = 0; z <= 24; z++) {
      fs.readdir(`${params.src}/${z}`, (err, items) => {
        if (err) return
        for(const xs of items) {
          const x = Number(xs)
          fs.readdir(`${params.src}/${z}/${x}`, (err, items) => {
            if (err) return
            for(const fn of items) {
              if (fn.endsWith(params.ext)) {
                const y = Number(fn.replace(`.${params.ext}`, ''))
                const path = `${params.src}/${z}/${x}/${fn}`
                const buf = fs.readFileSync(path, {encoding: 'utf-8'})
                const gz = zlib.gzipSync(buf)
                console.log(`${z}/${x}/${y} ${buf.length} => ${gz.length} (${Math.round(100.0 * gz.length / buf.length)}%)`)
                mbtiles.putTile(z, x, y, gz, err => {
                  if (err) console.log(err)
                })
              }
            }
          })
        }
      })
    }
  })
})
