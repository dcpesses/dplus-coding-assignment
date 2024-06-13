export function fetchHomePage() {
    return fetch('https://cd-static.bamgrid.com/dp-117731241344/home.json')
        .then(response => response.json());
}
export function fetchSetData(refId) {
    return fetch(`https://cd-static.bamgrid.com/dp-117731241344/sets/${refId}.json`).then(response => response.json()).catch(e => {
        console.error('Failed to fetch set data', e);
    });
}