const fs = require('fs');
async function run() {
  const Jimp = require('jimp');
  const img = await Jimp.read('c:/Users/hasan/.gemini/antigravity-ide/brain/311d8d62-a6ea-487b-9799-afee21c6904e/media__1784408870314.png');
  const hex = img.getPixelColor(10, 10);
  console.log('COLOR_10_10:', Jimp.intToRGBA(hex));
  console.log('COLOR_50_50:', Jimp.intToRGBA(img.getPixelColor(50, 50)));
}
run().catch(console.error);
