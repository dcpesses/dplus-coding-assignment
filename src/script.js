import { fetchHomePage } from './api';
import { createTile } from './tile';
import { createModal } from './modal';
import './styles.css';

document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    // const modal = document.getElementById('modal');
    // const modalContent = document.getElementById('modal-content');
    const {modal, modalContent} = createModal();

    modal.appendChild(modalContent);

    let rows = [];
    let tiles = [];
    let focusedIndex = 0;

    function renderHomePage(data) {
        console.log({data});
        const {containers} = data.data.StandardCollection;
        let rowIdx = 0;
        containers.forEach(rowData => {
            try {
                if (!rowData.set?.items) {
                    console.warn('No items found in set:', rowData.set);
                    return;
                }
                const rowElement = document.createElement('div');
                rowElement.classList.add('row');
                rowElement.dataset.rowIdx = rowIdx;
                rowData.set.items.forEach((item, rowIdx) => {
                    const tile = createTile(item);
                    tile.dataset.rowIdx = rowIdx;
                    rowElement.appendChild(tile);
                    tiles.push(tile);
                });
                rows.push(rowElement);
                app.appendChild(rowElement);
                rowIdx += 1;
            } catch (e) {
                console.error(e, 'Unable to parse rowData:', rowData);
            }
        });
        if (tiles.length > 0) {
            focusTile(0);
        }
        app.appendChild(modal);
    }

    function focusTile(index) {
        tiles[focusedIndex].classList.remove('focused');
        focusedIndex = index;
        tiles[focusedIndex].classList.add('focused');
        tiles[focusedIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest',
            // inline: 'center'
        });
    }

    function focusRow(index) {
        let focusedRowIndex = index;
        // tiles[focusedIndex].classList.remove('focused');
        // focusedIndex = index;
        // tiles[focusedIndex].classList.add('focused');
        // tiles[focusedIndex].scrollIntoView({
        //     behavior: 'smooth',
        //     block: 'nearest',
        //     inline: 'nearest',
        //     // inline: 'center'
        // });

        console.log('rows[focusedRowIndex]:', rows[focusedRowIndex]);
        const nextTile = rows[focusedRowIndex].firstChild();
        focusTile(nextTile);
    }

    function showTileDetails() {
        console.log({focusedIndex, modal});
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
                focusedRow = tiles[focusedIndex].dataset.rowIdx;
                if (focusedRow < rows.length - 1) {
                    focusRow(focusedRow - 1);
                }
                // const nextRow = Math.min(tiles.length - 1, focusedIndex + 5);
                // focusTile(nextRow);
                break;
            case 'ArrowUp':
                focusedRow = tiles[focusedIndex].dataset.rowIdx;
                if (focusedRow > 0) {
                    focusRow(focusedRow + 1);
                }
                // const prevRow = Math.max(0, focusedIndex - 5);
                // focusTile(prevRow);
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
        });

    // Add navigation logic
    document.addEventListener('keydown', handleKeydown);

});
