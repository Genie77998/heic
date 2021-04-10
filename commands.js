const { join: pathJoin } = require('path')
const ProgressBar = require('progress')
const fs = require('fs-extra')
const convert = require('heic-convert')

const fileNameObj = fileName => {
  const isHeic = /^.*\.(?:heic)$/i.test(fileName)
  const fName = /^(.*)\.(?:heic)$/i.exec(fileName)
  return {
    isHeic,
    fName: fName ? `${fName[1]}.jpg` : null
  }
}

async function run(prefixDir) {
  prefixDir = prefixDir || process.cwd()
  const realImages = []
  console.log('读取文件夹...')
  if (fs.statSync(prefixDir).isDirectory()) {
    const images = fs.readdirSync(prefixDir)
    images.forEach((fileFullName, index) => {
      const filePath = pathJoin(prefixDir, fileFullName)
      const file = fs.statSync(filePath)
      if (file.isFile()) {
        const res = fileNameObj(fileFullName)
        if (res.isHeic && res.fName) {
          realImages.push({
            filePath,
            outFileName: pathJoin(prefixDir, res.fName)
          })
        }
      }
    })
  } else {
    process.exit(1)
  }
  const start = Date.now()
  const total = realImages.length
  console.log(`一共${total}个文件，开始转换`)
  const bar = new ProgressBar('转换中 [:bar] 一共:total张，当前第:current张 进度:percent 已耗时:elapsed秒 预计还需要:eta秒', { total })
  for (let realImage of realImages) {
    await convertImage(realImage)
  }
  if (total > 0) {
    console.log(`共耗时${Math.ceil((Date.now() - start) / 1000)}秒`)
  }
  async function convertImage(file) {
    const inputBuffer = fs.readFileSync(file.filePath)
    await convert({
      buffer: inputBuffer,
      format: 'JPEG',
      quality: 0.9
    }).then(outputBuffer => {
      fs.writeFileSync(file.outFileName, outputBuffer)
    }).catch(err => {
      console.error(err.message, file.filePath)
    })
    bar.tick()
  }
}

// run(pathJoin(__dirname, 'images', '555'))

module.exports = run
