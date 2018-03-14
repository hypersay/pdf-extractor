const { extractImages, extractText } = require('../src/index');
const fs = require('fs');

describe('extractText', () => {
  test('extractText should extract texts', async () => {
    const SHOWCASE_EXPECTED_TEXTS = [
      ['Showcase', 'MACRO TO MICRO'],
      ['Israel', 'Israel'],
      ['Mobileye'],
      ['WIX - botar video', 'WIX'],
      ['Startup Aeroespacial', 'SPACE PHARMA'],
      ['Gigantes'],
      ['TESLA'],
      ['BRAC'],
      ['ONGs', 'ONGs'],
      ['TETO', 'TETO'],
      ['Instituto Elos', 'Instituto Elos'],
      ['Projetos'],
      ['Bike Anjo', 'BIKE ANJO'],
      ['Imagina na Copa'],
      ['Imagina ', 'Coletivo', 'Liberte Seus Sonhos'],
      ['Inside Out', 'Inside Out | Project'],
      ['SPREAD YOUR LOVE'],
      ['Social Business'],
      ['Mohamed Yunus'],
      ['Saladorama'],
      ['CHANCE'],
      ['NEGÓCIOS DE IMPACTO', 'Negócios de Impacto'],
      ['Colibrii', 'Colibrii'],
      ['EUZARIA'],
      ['OLIST', 'Olist'],
      ['Startups', 'Startups'],
      ['Urban 3D', 'URBAN 3D'],
      ['Real Networking', 'REAL NETWORKING'],
      ['Educação'],
      ['geekie'],
      ['ME SALVA'],
      ['Escola Convexo'],
      ['Cientista Beta'],
      ['YEP - Youth Empowering Parents'],
      ['CASAS COLABORATIVAS', 'Casas Colaborativas'],
      ['Casa Liberdade', 'Casa Liberdade'],
      ['Translab', 'Translab'],
      ['Distrito E'],
      ['Coworking', 'Coworking'],
      ['A 51', 'ÁREA 51'],
      ['Nós Coworking', 'Nós Coworking'],
      [],
    ];

    const result = await extractText(fs.createReadStream('./test/Showcase.pdf'));
    expect(result).toHaveLength(42);
    expect(result).toMatchObject(SHOWCASE_EXPECTED_TEXTS.map(page => page.map(t => ({ R: [t] }))));
  });
});

describe('extractImages', () => {
  test('extractImages should extract images', async () => {
    const result = await extractImages(fs.createReadStream('./test/hello.pdf'));
    expect(result).toHaveLength(1);

    // the next lines are to test that it deletes the tmp files
    const test = fs.createWriteStream('test.pdf');
    result[0].pipe(test);
  });
});
