export const RowTypes = {
    BILLBOARD: 'billboard',
    COLLECTION: 'collection',
    GRID: 'grid'
};

export function createTile(item, rowType) {
    const tile = document.createElement('div');
    tile.classList.add('tile');
    if (rowType) {
        tile.classList.add(rowType);
    }
    let contentType;
    if (item.seriesId) {
        contentType = 'series';
        tile.classList.add(`series-${item.seriesId}`);
        // title = item.text.title.full.series.default.content;
    } else if (item.programId) {
        contentType = 'program';
        tile.classList.add(`program-${item.programId}`);
        // title = item.text.title.full.program.default.content;
    } else if (item.collectionId) {
        contentType = 'collection';
        tile.classList.add(`collection-${item.collectionId}`);
        // title = item.text.title.full.collection.default.content;
    }
    let title = item.text.title.full[contentType].default.content;
    tile.dataset.title = title;
    const img = createTileImage({contentType, item, rowType, title});
    tile.appendChild(img);
    if (rowType === RowTypes.BILLBOARD) {
        const imgTextTreatment = createTileImage({contentType, isTitleTreatment: true, item, rowType, title});
        imgTextTreatment.classList.add('text-treatment')
        tile.appendChild(imgTextTreatment);
    }

    return tile;
}

export function createTileImage({contentType, isTitleTreatment, item, rowType, title}) {
    const img = document.createElement('img');
    let {aspectRatio, imageType} = getRowTypeConfig(rowType);
    if (isTitleTreatment) {
        imageType = 'title_treatment_layer';
    }
    const fallbackWidth = Math.round(540 * parseFloat(aspectRatio));
    const fallbackImage = `https://placehold.co/${fallbackWidth}x540?text=${encodeURI(title)}`;
    img.src = fallbackImage;
    if (item.image[imageType]?.[aspectRatio]) {
        console.log({contentType, title, aspectRatio: item.image[imageType][aspectRatio]})
        let imgDefault = item.image[imageType][aspectRatio].default?.default?.url;
        let imgSrc = item.image[imageType][aspectRatio][contentType]?.default?.url || imgDefault;
        if (isTitleTreatment) {
            imgSrc = imgSrc.replace('format=jpeg', 'format=png');
        }
        img.src = imgSrc;
    } else {
        console.log(`image not found for ${title}`, {contentType, title, aspectRatio: item.image[imageType][aspectRatio]})
    }
    img.alt = title;
    img.onerror = (e) => {
        console.warn(`image error for ${title}`, e, {url: img.src, contentType, title, aspectRatio: item.image[imageType][aspectRatio]})
        img.src = fallbackImage;
        img.onerror = null;
    };
    return img;
}

export function getRowTypeConfig(rowType) {
    switch (rowType) {
        case RowTypes.BILLBOARD:
            return {
                aspectRatio: '3.00',
                imageType: 'hero_tile'
            };
        case RowTypes.COLLECTION:
            return {
                aspectRatio: '0.71',
                imageType: 'tile'
            };
        case RowTypes.GRID:
        default:
            return {
                aspectRatio: '1.78',
                imageType: 'tile'
            };
    }
}