const { PDFImage } = require('pdf-image');
const fs = require('fs');
const PDFParser = require('pdf2json');
const uuid = require('uuid/v4');
const decodeUriComponent = require('decode-uri-component');

const TMP_FOLDER = 'tmp';

const _writeFile = (pdfFileReadStream, id) => new Promise((resolve, reject) => {
  fs.mkdir(`${TMP_FOLDER}/${id}`, err => {
    if (err) reject(err);
    const wStream = fs.createWriteStream(`${TMP_FOLDER}/${id}/${id}.pdf`);
    pdfFileReadStream.pipe(wStream);
    return resolve(wStream);
  });
});

const _deleteFolder = (folderPath, noOfFiles) => {
  let deletionTasks = noOfFiles;

  fs.readdir(folderPath, (error, files) => {
    files.forEach(file => {
      fs.unlink(`${folderPath}/${file}`, () => {
        deletionTasks -= 1;
        if (deletionTasks === 0) {
          fs.rmdir(folderPath, () => {});
        }
      });
    });
  });
};

const _streamToBuffer = stream => new Promise((resolve, reject) => {
  const buffers = [];
  stream.on('data', data => buffers.push(data));
  stream.on('end', () => resolve(Buffer.concat(buffers)));
  stream.on('error', reject);
});

const extractText = async pdfFileReadStream => {
  const pdfParser = new PDFParser();
  const pdfBuffer = await _streamToBuffer(pdfFileReadStream);

  return new Promise((resolve, reject) => {
    pdfParser.on('pdfParser_dataError', errData => reject(errData.parserError));
    pdfParser.on('pdfParser_dataReady', pdfData => {
      resolve(pdfData.formImage.Pages.map(page => page.Texts.map(text => {
        if (text.R) {
          // eslint-disable-next-line no-param-reassign
          text.R = text.R.map(r => (r.T ? decodeUriComponent(r.T) : r.T));
        }
        return text;
      })));
    });

    pdfParser.parseBuffer(pdfBuffer);
  });
};

const extractImages = pdfFileReadStream => {
  const id = uuid();
  const opts = {
    convertOptions: {
      '-resize': '4096x4096',
    },
  };

  return new Promise(async (resolve, reject) => {
    const wStream = await _writeFile(pdfFileReadStream, id);
    wStream.on('error', e => reject(e));

    wStream.on('finish', async () => {
      const promises = [];
      const pdfImage = new PDFImage(`${TMP_FOLDER}/${id}/${id}.pdf`, opts);

      const noOfPages = await pdfImage.numberOfPages();
      let tasks = noOfPages;

      const done = () => {
        tasks -= 1;
        if (tasks === 0) {
          _deleteFolder(`${TMP_FOLDER}/${id}`, noOfPages);
        }
      };

      for (let i = 0; i < noOfPages; i++) {
        promises.push(pdfImage.convertPage(i));
      }

      await Promise.all(promises);
      const result = [];
      for (let i = 0; i < noOfPages; i++) {
        const tmpReadStream = fs.createReadStream(`${TMP_FOLDER}/${id}/${id}-${i}.png`);
        tmpReadStream.on('end', done);
        result.push(tmpReadStream);
      }

      return resolve(result);
    });
  });
};

module.exports = {
  extractText,
  extractImages,
};
