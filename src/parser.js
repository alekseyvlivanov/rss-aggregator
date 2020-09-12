const parseRSS = (rawXML) => {
  const parser = new DOMParser();
  const docXML = parser.parseFromString(rawXML, 'text/xml');

  const titleElement = docXML.querySelector('rss > channel > title');
  const descriptionElement = docXML.querySelector(
    'rss > channel > description',
  );

  if (!titleElement && !descriptionElement) {
    throw new Error('noTitleAndDescription');
  }

  const feed = {
    title: titleElement ? titleElement.textContent : '',
    description: descriptionElement ? descriptionElement.textContent : '',
  };

  const postElements = docXML.querySelectorAll('rss > channel > item');
  const posts = Array.from(postElements).map((item) => ({
    title: item.querySelector('title').textContent,
    link: item.querySelector('link').textContent,
  }));

  return { feed, posts };
};

export default parseRSS;
