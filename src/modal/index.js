
export function createModal() {
    const modalContent = Object.assign(document.createElement('div'), {
        id: 'modal-content'
    });
    const modal = Object.assign(document.createElement('div'),{
        id: 'modal',
        className: 'modal hidden',
    });
    modal.appendChild(modalContent);

    return {modal, modalContent};
}

export function renderModalContent(item) {
    console.log('renderModalContent', {item});
    try {
        let contentType;
        if (item.seriesId) {
            contentType = 'series';
        } else if (item.programId) {
            contentType = 'program';
        } else if (item.collectionId) {
            contentType = 'collection';
        }
        let title = item.text.title.full[contentType].default.content;

        let backgroundUrl = item.image.background?.['1.78']?.[contentType]?.default?.url;
        if (backgroundUrl) {
            backgroundUrl = backgroundUrl.replace('width=500', 'width=960');
        }

        let titleTreatmentUrl = item.image.title_treatment['1.78']?.[contentType]?.default?.url;
        if (titleTreatmentUrl) {
            titleTreatmentUrl = titleTreatmentUrl.replace('format=jpeg', 'format=png');
        }
        const titleTreatment = (titleTreatmentUrl)
            ? `<img src="${titleTreatmentUrl}" alt="${title}" onerror="this.onerror=null;this.className='hidden';this.nextSibling.className='show-fallback'" /><h2 class="hidden">${title}</h2>`
            : `<h2>${title}</h2>`;

        let runtime = getRuntimeFromSeconds(item.mediaMetadata?.runtimeMillis);

        let synopsis = '';

        let modalContent = `
            <section class="modal-content-body background-image" style="background-image: radial-gradient(circle at 72% 50%, rgba(255, 255, 0, 0) 0%, rgba(0, 0, 0, 0.72) 59%, rgba(0, 0, 0, 1) 88%), url(${backgroundUrl});">
                <div class="modal-content-title-treatment">
                    ${titleTreatment}
                </div>

                <div class="modal-content-metadata">
                    <div class="modal-content-ratings-availability">
                        <span class="content-format">
                            ${item.ratings?.[0]?.value || ''}
                        </span>
                        <span class="content-rating">
                            ${item.mediaMetadata?.format || ''}
                        </span>
                    </div>
                    <div class="modal-content-release-tags">
                        <span class="content-release-year">
                            ${item.releases?.[0]?.releaseYear || ''}
                        </span>
                        <span class="content-release-runtime">
                            ${runtime || ''}
                        </span>
                    </div>
                </div>
                <p class="modal-content-synopsis">
                    ${synopsis}
                </p>
            </section>
        `.trim();

        console.log('renderModalContent', {modalContent})

        return modalContent;
    } catch (e) {
        console.error(e);
        return `
            <section class="modal-content-body error-background">

                <div class="modal-content-error-text">
                    <h2>Oh no!</h2>
                    <p>Either I wasn't expecting that type of data object, or I ran out of time trying to handle all scenarios. Sorry!</p>
                </div>

            </section>
        `.trim();
    }

}

/**
 * Convertd milliseconds to a movie's runtime
 * @param {Number} milli
 * @returns runtime <string>
 */
export function getRuntimeFromSeconds(milli) {
    if (!milli) {
        return null;
    }
    const timecode = (milli >= 3600000)
        ? new Date(milli).toISOString().substr(11, 8)
        : new Date(milli).toISOString().substr(14, 5);

    let [s, m, h] = timecode.split(':').reverse().map(v => parseInt(v));
    if (s >= 30) {
        m = (!m) ? 1 : m + 1;
    }

    let output = '';
    if (h) {
        output += `${h}h `;
    }
    if (m) {
        output += `${m}m`;
    }
    if (output === '') {
        output += `${s}s`;
    }
    return output.trim();
}
