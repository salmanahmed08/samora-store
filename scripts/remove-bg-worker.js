const fs = require('fs');
const { removeBackground } = require('@imgly/background-removal-node');

(async () => {
  try {
    const inputPath = process.argv[2];
    const outputPath = process.argv[3];
    if (!inputPath || !outputPath) {
      console.error("Usage: node remove-bg-worker.js <input> <output>");
      process.exit(1);
    }
    const inputBuf = fs.readFileSync(inputPath);
    const blob = new Blob([inputBuf], { type: "image/jpeg" });
    const resultBlob = await removeBackground(blob, {
      output: { format: "image/png" }
    });
    const ab = await resultBlob.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(ab));
    console.log("SUCCESS");
    process.exit(0);
  } catch(err) {
    console.error("Worker error:", err);
    process.exit(1);
  }
})();
