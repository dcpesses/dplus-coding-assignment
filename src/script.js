import { fetchHomePage, fetchSetData } from './api';
import { createTile, RowTypes } from './tile';
import { createModal, renderModalContent } from './modal';
import './styles.css';


document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');

    const {modal, modalContent} = createModal();
    app.appendChild(modal);

    let rows = [];
    let tiles = [];
    let tileMetadata = {};
    let focusedTileIdx = 0;

    function createRowHeader(rowDataSet) {
        let text = rowDataSet?.text?.title?.full?.set?.default?.content;
        if (!text) {
            text = '';
        }
        const headerElement = document.createElement('h3');
        headerElement.classList.add('row-header');
        headerElement.textContent = text;
        return headerElement;
    }
    function renderHomePage(data) {
        const {containers} = data.data.StandardCollection;

        let rowIdx = 0;
        let rowType = RowTypes.GRID;
        containers.forEach((rowData, containerIdx) => {
            try {
                if (!rowData.set?.items) {
                    if (!rowData.set?.refId) {
                        console.warn('No items found in non-ref set:', rowData.set);
                    }
                    return;
                }
                switch (containerIdx) {
                    case 0:
                        rowType = RowTypes.BILLBOARD;
                        break;
                    case 1:
                        rowType = RowTypes.COLLECTION;
                        break;
                    default:
                        rowType = RowTypes.GRID;
                        break;
                }

                const rowElement = renderRow({rowData, rowIdx, rowType});
                rows.push(rowElement);
                app.appendChild(rowElement);
                rowIdx += 1;
            } catch (e) {
                console.error(e, 'Unable to parse rowData:', rowData);
            }
        });

        if (tiles.length > 0) {
            setTimeout(() => {
                focusTile(0);
            }, 150);
        }

        return containers;
    }

    function loadReferenceRows(data) {
        console.log('loadReferenceRows', {
            data,
            filtered: data.filter(s => s.set.refId)
        });

        const refRows = data.filter(s => s.set.refId);
        return refRows.forEach((refRowData) => {
            const setId = refRowData.set.refId;
            return fetchSetData(setId)
                .then(rowData => {
                    const rowElement = renderRow({
                        rowRefData: refRowData.set,
                        rowData: rowData.data,
                        rowIdx: rows.length,
                        rowType: RowTypes.GRID,
                        setType: refRowData.set.refType,
                    });
                    if (!rowElement) {
                        return;
                    }
                    rows.push(rowElement);
                    app.appendChild(rowElement);
                    return;
                })
                .catch(e => {
                    console.error(`Error fetching data for ${setId}:`, e);
                })
        });
    }

    function renderRow({rowRefData, rowData, rowIdx, rowType, setType}) {
        if (!setType) {
            setType = 'set';
        }
        let rowDataSet = rowData[setType];
        if (!rowDataSet) {
            if (Object.keys(rowData)[0]) {
                // To reject, or not to reject, that is the question...
                // If nobler to ignore, comment out following code
                rowDataSet = rowData[Object.keys(rowData)[0]];
                // return null;
            } else {
                return null;
            }
        }

        const rowElement = document.createElement('div');
        rowElement.id = rowDataSet.setId;
        if (rowRefData) {
            rowElement.id = rowRefData.refId;
        }
        rowElement.classList.add('row', `row-${rowType}`);
        rowElement.dataset.rowIdx = rowIdx;

        const rowHeader = createRowHeader(rowRefData || rowDataSet);
        rowElement.appendChild(rowHeader);

        rowDataSet.items.forEach((item) => {
            const tile = createTile(item, rowType);
            const tileIdx = tiles.length
            tile.dataset.rowIdx = rowIdx;
            tile.dataset.tileIdx = tileIdx;
            rowElement.appendChild(tile);
            tileMetadata[`${rowIdx}_${tileIdx}`] = item;
            tiles.push(tile);
        });
        return rowElement;
    };

    function focusTile(index, doScroll=true) {
        tiles[focusedTileIdx].classList.remove('focused');
        focusedTileIdx = index;
        tiles[focusedTileIdx].classList.add('focused');
        if (doScroll) {
            tiles[focusedTileIdx].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest'
            });
        }
    }

    function focusRow(index) {
        let options = {
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest',
        };
        let focus = rows[index];
        focus.scrollIntoView(options);

        // double up calls to top row
        if (index === 0) {
            focus = rows[index].offsetParent;
            focus.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest',
            });
        } else if (index === rows.length - 1) {
            focus = rows[index];
            focus.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
                inline: 'nearest',
            });
        }

        let nextTile = rows[index].firstChild.nextSibling;
        nextTile = parseInt(nextTile.dataset.tileIdx, 10);
        focusTile(nextTile, (index !== 0 || index === rows.length - 1));
    }

    function showTileDetails() {
        // console.log({focusedTileIdx, modal, dataset: tiles[focusedTileIdx].dataset});
        const {rowIdx, tileIdx} = tiles[focusedTileIdx].dataset;
        const item = tileMetadata[`${rowIdx}_${tileIdx}`];

        modalContent.innerHTML = renderModalContent(item);
        modal.classList.remove('hidden');
    }

    function hideModal() {
        if (!modal) {
            return;
        }
        modal.classList.add('hidden');
    }

    function handleKeydown(event) {
        // ignore tile navigation while modal is open
        if (modal && !modal.classList.contains('hidden')) {
            switch (event.key) {
                case 'Escape':
                    hideModal();
                    break;
            }
            return;
        }

        let focusedRow = parseInt(tiles[focusedTileIdx].dataset.rowIdx, 10);
        let nextRow;
        switch (event.key) {
            case 'ArrowRight':
                if (focusedTileIdx < tiles.length - 1) {
                    nextRow = tiles[focusedTileIdx + 1]?.dataset?.rowIdx;
                    if (focusedRow.toString() === nextRow) {
                        focusTile(focusedTileIdx + 1);
                    } else {
                        // determine index of row's starting title
                        let rowFirstTileIdx = rows[focusedRow].firstChild.nextSibling.dataset.tileIdx;
                        console.log('ArrowRight', {focusedTileIdx, rowFirstTileIdx});
                        focusTile(parseInt(rowFirstTileIdx, 10));
                    }
                }
                break;
            case 'ArrowLeft':
                nextRow = tiles[focusedTileIdx - 1]?.dataset?.rowIdx;
                if (focusedTileIdx >= 0) {
                    if (focusedRow.toString() === nextRow) {
                        focusTile(focusedTileIdx - 1);
                    } else {
                        // determine index of row's last tile
                        let rowLastTileIdx = rows[focusedRow].lastChild.dataset.tileIdx;
                        console.log('ArrowLeft', {focusedTileIdx, rowLastTileIdx});
                        focusTile(parseInt(rowLastTileIdx, 10));
                    }
                }
                break;
            case 'ArrowDown':
                focusedRow = parseInt(tiles[focusedTileIdx].dataset.rowIdx, 10);
                // console.log({
                //     focusedTile: tiles[focusedTileIdx],
                //     dataset: tiles[focusedTileIdx].dataset,
                //     focusedRow: focusedRow,
                //     rows
                // });
                if (focusedRow < rows.length - 1) {
                    focusRow(focusedRow + 1);
                }
                break;
            case 'ArrowUp':
                focusedRow = parseInt(tiles[focusedTileIdx].dataset.rowIdx, 10);
                if (focusedRow > 0) {
                    focusRow(focusedRow - 1);
                }
                break;
            case 'Enter':
                showTileDetails();
                break;
            case 'Escape':
                hideModal();
                break;
        }
    }

    // setup the page

    fetchHomePage()
        .then(renderHomePage)
        .catch(error => {
            console.error('Error fetching home page data:', error);
            app.innerHTML = '<p>Failed to load data. Please try again later.</p>';
        })
        .then(loadReferenceRows)
        .catch(err_ref => {
            console.error('Error fetching ref data:', err_ref);
            app.innerHTML += '<p>Failed to load additional home screen data. Please try again later.</p>';
        });

    // Add navigation logic
    document.addEventListener('keydown', handleKeydown);

});
