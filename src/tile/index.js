
import { showModal } from '../modal';

export function createTile(item) {
    const tile = document.createElement('div');
    tile.classList.add('tile');
    let contentType;
    if (item.seriesId) {
        contentType = 'series';
        // title = item.text.title.full.series.default.content;
    } else if (item.programId) {
        contentType = 'program';
        // title = item.text.title.full.program.default.content;
    } else if (item.collectionId) {
        contentType = 'collection';
        // title = item.text.title.full.collection.default.content;
    }
    let title = item.text.title.full[contentType].default.content;
    tile.dataset.title = title;
    const img = createTileImage({contentType, item, title});
    tile.appendChild(img);

    // tile.addEventListener('click', () => showModal(item));

    return tile;
}

export function createTileImage({contentType, item, title}) {
    const img = document.createElement('img');
    const fallbackImage = `https://placehold.co/960x540?text=${encodeURI(title)}`;
    img.src = fallbackImage;
    if (item.image.tile['1.78']) {
        console.log({contentType, title, '1.78': item.image.tile['1.78']})
        img.src = item.image.tile['1.78'][contentType]?.default?.url;
    }
    img.alt = title;
    img.onerror = () => {
        img.src = fallbackImage;
        img.onerror = null;
    };
    return img;
}
