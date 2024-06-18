import { fetchHomePage, fetchSetData } from './api';
import { createTile, RowTypes } from './tile';
import { createModal } from './modal';
import './styles.css';

document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');

    const {modal, modalContent} = createModal();

    let rows = [];
    let tiles = [];
    let focusedIndex = 0;

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
        console.log({data});
        const {containers} = data.data.StandardCollection;
        let rowIdx = 0;
        let rowType = RowTypes.GRID;
        containers.forEach((rowData, containerIdx) => {
            try {
                if (!rowData.set?.items) {
                    console.warn('No items found in set:', rowData.set);
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

        app.appendChild(modal);
        return containers;
    }

    function loadReferenceRows(data) {
        console.log('loadReferenceRows', {
            data,
            filtered: data.filter(s => s.set.refId)
        });

        const refRows = data.filter(s => s.set.refId);
        refRows.forEach((refRowData) => {
            const setId = refRowData.set.refId;
            fetchSetData(setId)
                .then(rowData => {
                    console.log({setId, rowData});
                    const rowElement = renderRow({
                        rowData: rowData.data,
                        rowIdx: rows.length,
                        rowType: RowTypes.GRID,
                        setType: refRowData.set.refType,
                    });
                    rows.push(rowElement);
                    app.appendChild(rowElement);
                })
                .catch(e => {
                    console.error(`Error fetching data for ${setId}:`, e);
                })
        });
    }

    function renderRow({rowData, rowIdx, rowType, setType}) {
        if (!setType) {
            setType = 'set';
        }
        console.log('renderRow', {rowData, rowIdx, rowType, setType});
        const rowElement = document.createElement('div');
        rowElement.id = rowData[setType].setId;
        rowElement.classList.add('row', `row-${rowType}`);
        rowElement.dataset.rowIdx = rowIdx;

        const rowHeader = createRowHeader(rowData[setType]);
        rowElement.appendChild(rowHeader);

        rowData[setType].items.forEach((item) => {
            const tile = createTile(item, rowType);
            tile.dataset.rowIdx = rowIdx;
            tile.dataset.tileIdx = tiles.length;
            rowElement.appendChild(tile);
            tiles.push(tile);
        });
        return rowElement;
    };

    function focusTile(index) {
        console.log({index, focusTile: tiles[index]});
        tiles[focusedIndex].classList.remove('focused');
        focusedIndex = index;
        tiles[focusedIndex].classList.add('focused');
        tiles[focusedIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest',
            overflow: 'clip',
        });
    }

    function focusRow(index) {
        console.log({index});

        console.log({focusedRow: rows[index]});
        let nextTile = rows[index].firstChild.nextSibling;
        console.log({nextTile});
        nextTile = parseInt(nextTile.dataset.tileIdx, 10);
        focusTile(nextTile);
    }

    function showTileDetails() {
        console.log({focusedIndex, modal, dataContainers});
        const title = tiles[focusedIndex].dataset.title;
        modalContent.textContent = title;
        modal.classList.remove('hidden');
    }

    function hideModal() {
        if (!modal) {
            return;
        }
        modal.classList.add('hidden');
    }

    function handleKeydown(event) {
        let focusedRow;
        switch (event.key) {
            case 'ArrowRight':
                if (focusedIndex < tiles.length - 1) {
                    focusTile(focusedIndex + 1);
                }
                break;
            case 'ArrowLeft':
                if (focusedIndex > 0) {
                    focusTile(focusedIndex - 1);
                }
                break;
            case 'ArrowDown':
                focusedRow = parseInt(tiles[focusedIndex].dataset.rowIdx, 10);
                console.log({
                    focusedTile: tiles[focusedIndex],
                    dataset: tiles[focusedIndex].dataset,
                    focusedRow: focusedRow,
                    rows
                });
                if (focusedRow < rows.length - 1) {
                    focusRow(focusedRow + 1);
                }
                break;
            case 'ArrowUp':
                // focusedRow = tiles[focusedIndex].dataset.rowIdx;
                focusedRow = parseInt(tiles[focusedIndex].dataset.rowIdx, 10);
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
