/**
 * AvalynxSelect
 *
 * AvalynxSelect is a lightweight, customizable select dropdown component for web applications. It is designed to be used with Bootstrap version 5.3 or higher and does not require any framework dependencies.
 *
 * @version 1.0.0
 * @license MIT
 * @author https://github.com/avalynx/avalynx-select/graphs/contributors
 * @website https://github.com/avalynx/
 * @repository https://github.com/avalynx/avalynx-select.git
 * @bugs https://github.com/avalynx/avalynx-select/issues
 *
 * @param {string} selector - The selector to use for targeting tables within the DOM (default: '.avalynx-select').
 * @param {object} options - An object containing the following keys:
 * @param {string} options.className - A custom import * as bootstrap from 'bootstrap';

export class name for the loader element (default: '').
 * @param {boolean} options.liveSearch - Enable live search functionality (default: false).
 * @param {boolean} options.caseSensitive - Enable case-sensitive search (default: false).
 * @param {boolean} options.showAll - Show all options when search term is empty (default: true).
 * @param {boolean} options.scrollList - Enable scrollable list (default: true).
 * @param {number} options.scrollItems - Number of items to display before scrolling (default: 8).
 * @param {boolean} options.noDefaultSelection - Do not select any option by default (default: false).
 * @param {function} options.onChange - Callback function to be executed when an option is selected (default: null).
 * @param {function} options.onLoaded - Callback function to be executed when the component is loaded (default: null).
 * @param {object} language - An object containing the following keys:
 * @param {string} language.searchPlaceholder - Placeholder text for the search input (default: 'Search...').
 * @param {string} language.selectPlaceholder - Placeholder text for the select dropdown (default: 'Please select...').
 *
 */

import * as bootstrap from 'bootstrap';

export class AvalynxSelect {
    constructor(selector, options = {}, language = {}) {
        if (!selector) {
            selector = '.avalynx-select';
        }
        if (!selector.startsWith('.') && !selector.startsWith('#')) {
            selector = '.' + selector;
        }
        this.elements = document.querySelectorAll(selector);
        if (this.elements.length === 0) {
            console.error("AvalynxSelect: Element(s) with selector '" + selector + "' not found");
            return;
        }
        this.options = {
            className: '',
            liveSearch: false,
            caseSensitive: false,
            showAll: true,
            showActive: true,
            scrollList: true,
            scrollItems: 8,
            noDefaultSelection: false,
            onChange: options.onChange || null,
            onLoaded: options.onLoaded || null,
            ...options
        };
        this.language = {
            searchPlaceholder: 'Search...',
            selectPlaceholder: 'Please select...',
            ...language
        };
        this.initialized = false;
        this.elements.forEach(select => this.init(select));
        this.initialized = true;
        if (this.options.onLoaded) {
            this.options.onLoaded();
        }
    }

    init(select) {
        this.ensureTemplatesExist();
        const dropdownElements = this.createDropdownElements(select);
        const button = dropdownElements.button;
        const dropdown = dropdownElements.dropdown;
        const searchInput = dropdown.querySelector('.avalynx-select-input');

        if (this.options.liveSearch) {
            searchInput.addEventListener('keyup', () => this.filterDropdown(dropdown, searchInput.value));
        }
        dropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', (event) => this.selectItem(event, item, select, button, dropdown));
        });
        button.addEventListener('click', () => {
            setTimeout(() => {
                searchInput.focus();
                this.applyScrollSettings(dropdown);
            }, 0);
        });
        this.filterDropdown(dropdown, '');
        this.setInitialSelection(select, button, dropdown);
        this.applyScrollSettings(dropdown);
    }

    ensureTemplatesExist() {
        this.addTemplateIfMissing("avalynx-select-template", `
                <button class="form-select text-start" type="button" data-bs-toggle="dropdown" aria-expanded="false"></button>
                <ul class="dropdown-menu rounded-0 me-1 avalynx-select">
                    <li class="avalynx-select-livesearch pb-2">
                        <span class="dropdown-item-text"><input type="text" class="form-control avalynx-select-input" placeholder=""></span>
                    </li>
                    <div class="avalynx-select-items"></div>
                </ul>
            `);
    }

    addTemplateIfMissing(id, content) {
        if (!document.getElementById(id)) {
            const template = document.createElement('template');
            template.id = id;
            template.innerHTML = content;
            document.body.appendChild(template);
        }
    }

    createDropdownElements(select) {
        const template = document.getElementById("avalynx-select-template").content.cloneNode(true);
        const button = template.querySelector('button');
        button.id = `${select.id}`;
        button.textContent = select.value && select.value !== '' ? select.options[select.selectedIndex].textContent : this.language.selectPlaceholder;
        button.setAttribute('aria-labelledby', button.id);
        if (this.options.className) {
            this.options.className.split(' ').forEach(className => button.classList.add(className));
        }
        const dropdown = template.querySelector('ul');
        const updateWidth = () => {
            dropdown.style.width = `${button.offsetWidth}px`;
        };
        window.addEventListener('resize', updateWidth);
        const itemsContainer = dropdown.querySelector('.avalynx-select-items');
        Array.from(select.options).forEach(option => {
            const listItem = document.createElement('li');
            const anchor = document.createElement('a');
            anchor.classList.add('dropdown-item');
            anchor.href = '#';
            anchor.textContent = option.textContent;
            anchor.dataset.value = option.value;
            listItem.appendChild(anchor);
            itemsContainer.appendChild(listItem);
        });
        select.style.display = 'none';
        select.id = `${select.id}-original`;
        select.parentNode.insertBefore(button, select.nextSibling);
        select.parentNode.insertBefore(dropdown, button.nextSibling);
        const searchInput = dropdown.querySelector('.avalynx-select-input');
        searchInput.placeholder = this.language.searchPlaceholder;
        if (!this.options.liveSearch) {
            const liveSearchElement = dropdown.querySelector('.avalynx-select-livesearch');
            liveSearchElement.style.display = 'none';
        }
        updateWidth();
        return {button, dropdown};
    }

    applyScrollSettings(dropdown) {
        if (this.options.scrollList) {
            const itemsContainer = dropdown.querySelector('.avalynx-select-items');
            const items = itemsContainer.querySelectorAll('.dropdown-item');
            if (items.length > this.options.scrollItems) {
                setTimeout(() => {
                    const listItemHeight = items[0].getBoundingClientRect().height;
                    const searchBoxHeight = this.options.liveSearch ? dropdown.querySelector('.avalynx-select-livesearch').getBoundingClientRect().height : 0;
                    const maxHeight = listItemHeight * this.options.scrollItems;
                    itemsContainer.style.maxHeight = `${maxHeight}px`;
                    itemsContainer.style.overflowY = 'auto';
                }, 100);
            }
        }
    }

    setInitialSelection(select, button, dropdown) {
        if (this.options.noDefaultSelection) {
            this.reset(button, dropdown, select);
        } else {
            const selectedOption = select.options[select.selectedIndex];
            const selectedItem = Array.from(dropdown.querySelectorAll('.dropdown-item')).find(item => item.dataset.value === selectedOption.value);
            if (selectedItem) {
                this.selectItem({
                    preventDefault: () => {
                    }
                }, selectedItem, select, button, dropdown);
            } else {
                this.reset(button, dropdown, select);
            }
        }
    }

    filterDropdown(dropdown, searchTerm) {
        const itemsContainer = dropdown.querySelector('.avalynx-select-items');
        const items = itemsContainer.querySelectorAll('.dropdown-item');
        let visibleCount = 0;
        items.forEach((item) => {
            const itemText = this.options.caseSensitive ? item.textContent : item.textContent.toLowerCase();
            const searchTermProcessed = this.options.caseSensitive ? searchTerm : searchTerm.toLowerCase();
            const isVisible = searchTermProcessed || this.options.showAll
                ? itemText.includes(searchTermProcessed) || (this.options.showActive && item.classList.contains('active'))
                : false;
            item.parentElement.classList.toggle('d-none', !isVisible);
            if (isVisible) visibleCount++;
        });
        const liveSearchElement = dropdown.querySelector('.avalynx-select-livesearch');
        if (visibleCount === 0) {
            liveSearchElement.classList.remove('pb-2');
        } else {
            liveSearchElement.classList.add('pb-2');
        }
    }

    selectItem(event, item, select, button, dropdown) {
        event.preventDefault();
        if (item.classList.contains('active')) {
            this.reset(button, dropdown, select);
        } else {
            const selectedItemText = item.textContent;
            const selectedItemValue = item.dataset.value;
            dropdown.querySelectorAll('.dropdown-item.active').forEach(activeItem => {
                activeItem.classList.remove('active');
            });
            item.classList.add('active');
            button.textContent = selectedItemText;
            select.value = selectedItemValue;
            const searchInput = dropdown.querySelector('.avalynx-select-input');
            searchInput.value = '';
            button.classList.remove('text-muted');
            this.filterDropdown(dropdown, '');
            const dropdownMenu = new bootstrap.Dropdown(button);
            dropdownMenu.hide();
            if (this.initialized && this.options.onChange) {
                this.options.onChange(select.value);
            }
        }
    }
}

