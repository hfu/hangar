const MBTiles = require('@mapbox/mbtiles')
const zlib = require('zlib')
const fs = require('fs')
const params = {
//  src: '/home/qdltc/experimental_fgd', ext: 'geojson',
//  dst: '/export/experimental_fgd.mbtiles'
  src: '/export/unmap_global', ext: 'mvt',
  dst: '/export/unmap_global.mbtiles'
}

function* files() {
  for(let z = 0; z <= 24; z++) {
    if(!fs.existsSync(`${params.src}/${z}`)) continue
    for(const xs of fs.readdirSync(`${params.src}/${z}`)) {
      const x = Number(xs)
      for(const fn of fs.readdirSync(`${params.src}/${z}/${x}`)) {
        if (fn.endsWith(params.ext)) {
          const y = Number(fn.replace(`.${params.ext}`, ''))
          const path = `${params.src}/${z}/${x}/${fn}`
          const buf = fs.readFileSync(path, params.ext === 'geojson' ? 
            {encoding: 'utf-8'} : null)
          const gz = zlib.gzipSync(buf)
          yield {z: z, x: x, y: y, path: path, buf: buf, gz: gz}
          console.log(`${z}/${x}/${y} ${buf.length} => ${gz.length} (${Math.round(100.0 * gz.length / buf.length)}%)`)
        }
      }
    }
  }
}

let w = async (r) => {
  return new Promise((resolve, reject) => {
    new MBTiles(params.dst, (err, mbtiles) => {
      if (err) throw err
      mbtiles.startWriting(err => {
        if (err) throw err
        mbtiles.putTile(r.z, r.x, r.y, r.gz, err => {
          if (err) throw err
          mbtiles.stopWriting(err => {
            if (err) throw err
            resolve()
          })
        })
      })
    })
  })
}

const main = async () => {
  for(const r of files()) {
    await w(r)
  }
}

main()
