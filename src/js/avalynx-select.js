/**
 * AvalynxSelect
 *
 * AvalynxSelect is a lightweight, customizable select dropdown component for web applications. It is designed to be used with Bootstrap version 5.3 or higher and does not require any framework dependencies.
 *
 * @version 1.2.0
 * @license MIT
 * @author https://github.com/avalynx/avalynx-select/graphs/contributors
 * @website https://github.com/avalynx/
 * @repository https://github.com/avalynx/avalynx-select.git
 * @bugs https://github.com/avalynx/avalynx-select/issues
 *
 * @param {string} selector - The selector to use for targeting tables within the DOM (default: '.avalynx-select').
 * @param {object} options - An object containing the following keys:
 * @param {string} options.className - A custom class name for the loader element (default: '').
 * @param {boolean} options.liveSearch - Enable live search functionality (default: false).
 * @param {boolean} options.caseSensitive - Enable case-sensitive search (default: false).
 * @param {boolean} options.showAll - Show all options when search term is empty (default: true).
 * @param {boolean} options.showActive - Show the active option in the dropdown (default: true).
 * @param {boolean} options.scrollList - Enable scrollable list (default: true).
 * @param {number} options.scrollItems - Number of items to display before scrolling (default: 8).
 * @param {number|null} options.maxItemsToShow - Cap the number of rendered items (default: null).
 * @param {boolean} options.noDefaultSelection - Do not select any option by default (default: false).
 * @param {boolean} options.disabled - Initialize the select as disabled (default: false).
 * @param {string|null} options.defaultValue - The default value to select on initialization (default: null).
 * @param {object|null} options.ajax - Configuration for AJAX data source (default: null).
 * @param {string} options.ajax.url - URL for the AJAX request (default: '').
 * @param {string} options.ajax.method - HTTP method for the AJAX request (default: 'GET').
 * @param {object} options.ajax.headers - Custom headers for the AJAX request (default: {}).
 * @param {number} options.ajax.debounce - Debounce time in milliseconds (default: 250).
 * @param {number} options.ajax.minimumInputLength - Minimum number of characters before AJAX request (default: 0).
 * @param {number} options.ajax.length - Number of items to fetch (default: 25).
 * @param {number} options.ajax.start - Starting index for fetching items (default: 0).
 * @param {boolean} options.ajax.initialLoad - Load initial data via AJAX (default: false).
 * @param {function|null} options.ajax.mapRequest - Function to map request parameters (default: null).
 * @param {function|null} options.ajax.mapResponse - Function to map response data (default: null).
 * @param {function|null} options.ajax.resolveByValue - Function to resolve a value to a label (default: null).
 * @param {function} options.onChange - Callback function to be executed when an option is selected (default: null).
 * @param {function} options.onLoaded - Callback function to be executed when the component is loaded (default: null).
 * @param {object} language - An object containing the following keys:
 * @param {string} language.searchPlaceholder - Placeholder text for the search input (default: 'Search...').
 * @param {string} language.selectPlaceholder - Placeholder text for the select dropdown (default: 'Please select...').
 * @param {string} language.loading - Text to display when loading data (default: 'Loading...').
 * @param {string} language.noResults - Text to display when no results are found (default: 'No results').
 * @param {string} language.error - Text to display when an error occurs (default: 'Error loading data').
 * @param {string} language.typeMore - Text to display for minimum input requirement (default: 'Type {remaining} more characters...').
 * @param {string} language.idleHint - Hint text when the search input is empty (default: 'Start typing to search').
 *
 */

class AvalynxSelect {
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
        if (options === null || typeof options !== 'object') {
            options = {};
        }
        this.options = {
            className: '',
            liveSearch: false,
            caseSensitive: false,
            showAll: true,
            showActive: true,
            scrollList: true,
            scrollItems: 8,
            maxItemsToShow: null,
            noDefaultSelection: false,
            disabled: false,
            defaultValue: null,
            ajax: null,
            onChange: options.onChange || null,
            onLoaded: options.onLoaded || null,
            ...options
        };
        if (this.options.ajax && typeof this.options.ajax === 'object') {
            this.options.ajax = {
                url: '',
                method: 'GET',
                headers: {},
                debounce: 250,
                minimumInputLength: 0,
                length: 25,
                start: 0,
                initialLoad: false,
                mapRequest: null,
                mapResponse: null,
                resolveByValue: null,
                ...this.options.ajax
            };
        } else {
            this.options.ajax = null;
        }
        if (language === null || typeof language !== 'object') {
            language = {};
        }
        this.language = {
            searchPlaceholder: 'Search...',
            selectPlaceholder: 'Please select...',
            loading: 'Loading...',
            noResults: 'No results',
            error: 'Error loading data',
            typeMore: 'Type {remaining} more characters...',
            idleHint: 'Start typing to search',
            ...language
        };
        this.initialized = false;
        this.elements.forEach(select => {
            const hasOptions = select && select.options && select.options.length > 0;
            if (hasOptions || this.options.ajax) {
                this.init(select);
            }
        });
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

        const isDisabled = select.disabled || !!this.options.disabled;
        if (isDisabled) {
            button.setAttribute('disabled', 'disabled');
            button.setAttribute('aria-disabled', 'true');
            button.classList.add('disabled');
        }

        if (this.options.ajax) {
            this._setupAjax(select, dropdown, searchInput, button);
            const attrDefault = select.getAttribute('data-default-value');
            const desired = this.options.defaultValue != null ? String(this.options.defaultValue) : (attrDefault != null ? String(attrDefault) : '');
            if (desired) {
                this._prefetchByValue(select, dropdown, button, desired);
            }
        } else if (this.options.liveSearch) {
            searchInput.addEventListener('keyup', () => this.filterDropdown(dropdown, searchInput.value));
        }
        dropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', (event) => {
                if (button.hasAttribute('disabled')) {
                    event.preventDefault();
                    return;
                }
                this.selectItem(event, item, select, button, dropdown)
            });
        });
        button.addEventListener('click', (e) => {
            if (button.hasAttribute('disabled')) {
                e.preventDefault();
                return;
            }
            setTimeout(() => {
                searchInput.focus();
                this.applyScrollSettings(dropdown);
                if (this.options.ajax) {
                    const minLen = this.options.ajax.minimumInputLength || 0;
                    const term = searchInput.value || '';
                    if (term.length < minLen) {
                        const remaining = Math.max(0, minLen - term.length);
                        const msg = minLen > 0 ? this._formatTypeMore(remaining) : (this.language.idleHint || '');
                        this._setEmpty(dropdown, msg, select, button);
                        if (minLen === 0 && this.options.ajax.initialLoad) {
                            this._triggerAjaxLoad(select, dropdown, term, button);
                        }
                    } else if (this.options.ajax.initialLoad) {
                        this._triggerAjaxLoad(select, dropdown, term, button);
                    }
                } else {
                    this.filterDropdown(dropdown, searchInput.value || '');
                }
            }, 0);
        });
        if (!this.options.ajax) {
            this.filterDropdown(dropdown, '');
            this.setInitialSelection(select, button, dropdown);
        }
        this.applyScrollSettings(dropdown);
    }

    _debounce(fn, wait) {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), wait);
        };
    }

    _formatTypeMore(remaining) {
        const tmpl = this.language.typeMore || 'Type {remaining} more characters...';
        return String(tmpl).replace('{remaining}', remaining);
    }

    _setupAjax(select, dropdown, searchInput, button) {
        const liveSearchElement = dropdown.querySelector('.avalynx-select-livesearch');
        liveSearchElement.style.display = '';
        const minLen = this.options.ajax.minimumInputLength || 0;
        const debounced = this._debounce(() => {
            const term = searchInput.value || '';
            if (term.length < minLen) {
                const remaining = Math.max(0, minLen - term.length);
                const msg = minLen > 0 ? this._formatTypeMore(remaining) : (this.language.idleHint || '');
                this._setEmpty(dropdown, msg, select, button);
                return;
            }
            this._triggerAjaxLoad(select, dropdown, term, button);
        }, this.options.ajax.debounce || 250);
        searchInput.addEventListener('keyup', debounced);
    }

    _prefetchByValue(select, dropdown, button, desiredValue) {
        const ajax = this.options.ajax;
        let url = ajax.url || '';
        let method = (ajax.method || 'GET').toUpperCase();
        let headers = ajax.headers || {};
        let body = null;
        let params = {};
        const context = { value: desiredValue, draw: 1 };
        if (typeof ajax.resolveByValue === 'function') {
            try {
                const mapped = ajax.resolveByValue(context) || {};
                url = mapped.url || url;
                method = (mapped.method || method).toUpperCase();
                headers = { ...headers, ...(mapped.headers || {}) };
                params = mapped.params || params;
                body = mapped.body || body;
            } catch (e) { }
        } else {
            params = { id: desiredValue };
        }
        const qs = Object.keys(params).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k] == null ? '' : params[k])).join('&');
        if (qs) {
            url += (url.includes('?') ? '&' : '?') + qs;
        }
        const fetchOpts = { method, headers };
        if (method !== 'GET' && body) {
            if (typeof body === 'object' && !(body instanceof FormData)) {
                fetchOpts.body = JSON.stringify(body);
                fetchOpts.headers = { 'Content-Type': 'application/json', ...headers };
            } else {
                fetchOpts.body = body;
            }
        }
        fetch(url, fetchOpts)
            .then(res => { if (!res.ok) throw new Error(res.status + ' ' + res.statusText); return res.json(); })
            .then(json => {
                let items = [];
                try {
                    if (typeof ajax.mapResponse === 'function') {
                        items = ajax.mapResponse(json) || [];
                    } else {
                        if (Array.isArray(json)) {
                            items = json;
                        } else if (json && Array.isArray(json.data)) {
                            items = json.data;
                        }
                        items = items.map(it => {
                            if (it == null) return null;
                            if (typeof it === 'string' || typeof it === 'number') {
                                return { value: String(it), text: String(it) };
                            }
                            if (Array.isArray(it)) {
                                return { value: String(it[0]), text: String(it[1]) };
                            }
                            const value = it.value != null ? it.value : (it.id != null ? it.id : '');
                            const text = it.text != null ? it.text : (it.label != null ? it.label : String(value));
                            return { value: String(value), text: String(text) };
                        }).filter(Boolean);
                    }
                } catch (e) {
                    items = [];
                }
                const match = items.find(it => String(it.value) === String(desiredValue));
                if (match) {
                    this._renderItemsFromData(dropdown, [match], select, button);
                    const itemEl = dropdown.querySelector(`.dropdown-item[data-value="${String(match.value)}"]`);
                    if (itemEl) {
                        this.selectItem({ preventDefault: () => {} }, itemEl, select, button, dropdown);
                    }
                } else {
                }
            })
            .catch(() => { });
    }

    _triggerAjaxLoad(select, dropdown, term, button) {
        const itemsContainer = dropdown.querySelector('.avalynx-select-items');
        this._setLoading(dropdown, select, button);
        const ajax = this.options.ajax;
        let url = ajax.url || '';
        let method = (ajax.method || 'GET').toUpperCase();
        let headers = ajax.headers || {};
        let body = null;
        let params = {};
        const context = { term, draw: 1, start: ajax.start || 0, length: ajax.length || 25 };
        if (typeof ajax.mapRequest === 'function') {
            try {
                const mapped = ajax.mapRequest(context) || {};
                url = mapped.url || url;
                method = (mapped.method || method).toUpperCase();
                headers = { ...headers, ...(mapped.headers || {}) };
                params = mapped.params || params;
                body = mapped.body || body;
            } catch(e) { }
        } else {
            params = { q: term, length: context.length, start: context.start };
        }
        const qs = Object.keys(params).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k] == null ? '' : params[k])).join('&');
        if (qs) {
            url += (url.includes('?') ? '&' : '?') + qs;
        }
        const fetchOpts = { method, headers };
        if (method !== 'GET' && body) {
            if (typeof body === 'object' && !(body instanceof FormData)) {
                fetchOpts.body = JSON.stringify(body);
                fetchOpts.headers = { 'Content-Type': 'application/json', ...headers };
            } else {
                fetchOpts.body = body;
            }
        }
        fetch(url, fetchOpts)
            .then(res => {
                if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
                return res.json();
            })
            .then(json => {
                let items = [];
                try {
                    if (typeof ajax.mapResponse === 'function') {
                        items = ajax.mapResponse(json) || [];
                    } else {
                        if (Array.isArray(json)) {
                            items = json;
                        } else if (json && Array.isArray(json.data)) {
                            items = json.data;
                        }
                        items = items.map(it => {
                            if (it == null) return null;
                            if (typeof it === 'string' || typeof it === 'number') {
                                return { value: String(it), text: String(it) };
                            }
                            if (Array.isArray(it)) {
                                return { value: String(it[0]), text: String(it[1]) };
                            }
                            const value = it.value != null ? it.value : (it.id != null ? it.id : '');
                            const text = it.text != null ? it.text : (it.label != null ? it.label : String(value));
                            return { value: String(value), text: String(text) };
                        }).filter(Boolean);
                    }
                } catch (e) {
                    items = [];
                }
                this._renderItemsFromData(dropdown, items, select, button);
            })
            .catch(err => {
                this._setError(dropdown, err.message || 'Error', select, button);
            });
    }

    _renderItemsFromData(dropdown, items, select, button) {
        const itemsContainer = dropdown.querySelector('.avalynx-select-items');
        const currentActiveVal = select && select.value ? String(select.value) : '';
        const currentActiveText = currentActiveVal ? (button ? (button.textContent || '') : '') : '';
        this._clearItems(dropdown, select, button);
        itemsContainer.setAttribute('aria-live', 'polite');
        while (select.options.length > 0) select.remove(0);
        const cap = this.options.maxItemsToShow != null ? parseInt(this.options.maxItemsToShow, 10) : null;
        let prepared = Array.isArray(items) ? items.slice() : [];

        if (this.options.ajax && this.options.showActive && currentActiveVal) {
            prepared = prepared.filter(it => String(it?.value) !== currentActiveVal);
        }

        const seen = new Set();
        if (currentActiveVal && this.options.showActive) {
            seen.add(currentActiveVal);
        }
        const toRender = [];
        for (const it of prepared) {
            if (!it) continue;
            const valueStr = String(it.value);
            if (seen.has(valueStr)) continue;
            seen.add(valueStr);
            toRender.push({ value: valueStr, text: String(it.text != null ? it.text : valueStr) });
            if (cap && cap > 0 && (toRender.length + (currentActiveVal ? 1 : 0)) >= cap) break;
        }
        toRender.forEach(({ value, text }) => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.classList.add('dropdown-item');
            a.href = '#';
            a.textContent = text;
            a.dataset.value = value;
            li.appendChild(a);
            itemsContainer.appendChild(li);
        });
        toRender.forEach(({ value, text }) => {
            const opt = document.createElement('option');
            opt.value = value;
            opt.textContent = text;
            select.appendChild(opt);
        });
        if (currentActiveVal && this.options.showActive) {
            const opt = document.createElement('option');
            opt.value = currentActiveVal;
            opt.textContent = currentActiveText || currentActiveVal;
            opt.selected = true;
            select.appendChild(opt);
        }
        if (this.options.showActive && currentActiveVal) {
            const activeEl = itemsContainer.querySelector(`.dropdown-item[data-value="${currentActiveVal.replace(/"/g, '\"')}"]`);
            if (activeEl) {
                activeEl.classList.add('active');
            }
        }
        if (toRender.length === 0 && (!this.options.showActive || !currentActiveVal)) {
            this._setEmpty(dropdown, this.language.noResults, select, button);
        } else {
            dropdown.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', (event) => {
                    if (button.hasAttribute('disabled')) {
                        event.preventDefault();
                        return;
                    }
                    this.selectItem(event, item, select, button, dropdown)
                });
            });
        }
        this.applyScrollSettings(dropdown);
    }

    _setLoading(dropdown, select, button) {
        const itemsContainer = dropdown.querySelector('.avalynx-select-items');
        this._clearItems(dropdown, select, button);
        const li = document.createElement('li');
        li.className = 'dropdown-item-text text-muted';
        li.textContent = this.language.loading || 'Loading...';
        itemsContainer.appendChild(li);
    }

    _setEmpty(dropdown, message, select, button) {
        const itemsContainer = dropdown.querySelector('.avalynx-select-items');
        this._clearItems(dropdown, select, button);
        const li = document.createElement('li');
        li.className = 'dropdown-item-text text-muted';
        li.textContent = message || this.language.noResults || 'No results';
        itemsContainer.appendChild(li);
    }

    _setError(dropdown, message, select, button) {
        const itemsContainer = dropdown.querySelector('.avalynx-select-items');
        this._clearItems(dropdown, select, button);
        const li = document.createElement('li');
        li.className = 'dropdown-item-text text-danger';
        li.textContent = message || this.language.error || 'Error loading data';
        itemsContainer.appendChild(li);
    }

    _clearItems(dropdown, select, button) {
        const itemsContainer = dropdown.querySelector('.avalynx-select-items');
        const currentActiveVal = select && select.value ? String(select.value) : '';
        const currentActiveText = currentActiveVal ? (button ? (button.textContent || '') : '') : '';

        itemsContainer.innerHTML = '';

        if (this.options.ajax && this.options.showActive && currentActiveVal) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.classList.add('dropdown-item', 'active');
            a.href = '#';
            a.textContent = currentActiveText || currentActiveVal;
            a.dataset.value = currentActiveVal;
            li.appendChild(a);
            itemsContainer.appendChild(li);

            a.addEventListener('click', (event) => {
                if (button && button.hasAttribute('disabled')) {
                    event.preventDefault();
                    return;
                }
                this.selectItem(event, a, select, button, dropdown)
            });
        }
    }

    ensureTemplatesExist() {
        this.addTemplateIfMissing("avalynx-select-template", `
                <button class="form-select text-start" type="button" data-bs-toggle="dropdown" aria-expanded="false"></button>
                <ul class="dropdown-menu me-1 avalynx-select">
                    <li class="avalynx-select-livesearch pb-2">
                        <span class="dropdown-item-text"><input type="text" class="form-control avalynx-select-input" placeholder=""></span>
                    </li>
                    <div class="avalynx-select-items"></div>
                </ul>
            `);
    }

    addTemplateIfMissing(id, content) {
        const existing = document.getElementById(id);
        if (existing) {
            existing.remove();
        }
        const template = document.createElement('template');
        template.id = id;
        template.innerHTML = content;
        document.body.appendChild(template);
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
        const opts = select && select.options ? select.options : [];
        for (let i = 0; i < (opts.length || 0); i++) {
            const option = opts[i];
            const listItem = document.createElement('li');
            const anchor = document.createElement('a');
            anchor.classList.add('dropdown-item');
            anchor.href = '#';
            anchor.textContent = option.textContent;
            anchor.dataset.value = option.value;
            listItem.appendChild(anchor);
            itemsContainer.appendChild(listItem);
        }
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
            return;
        }
        const attrDefault = select.getAttribute('data-default-value');
        const desired = this.options.defaultValue != null ? String(this.options.defaultValue) : (attrDefault != null ? String(attrDefault) : '');
        if (desired) {
            const selectedItem = Array.from(dropdown.querySelectorAll('.dropdown-item')).find(item => item.dataset.value === desired);
            if (selectedItem) {
                this.selectItem({ preventDefault: () => {} }, selectedItem, select, button, dropdown);
                return;
            }
        }
        if (select.selectedIndex >= 0 && select.options[select.selectedIndex] && select.value !== '') {
            const selectedOption = select.options[select.selectedIndex];
            const selectedItem = Array.from(dropdown.querySelectorAll('.dropdown-item')).find(item => item.dataset.value === selectedOption.value);
            if (selectedItem) {
                this.selectItem({ preventDefault: () => {} }, selectedItem, select, button, dropdown);
                return;
            }
        }
        this.reset(button, dropdown, select);
    }

    filterDropdown(dropdown, searchTerm) {
        const itemsContainer = dropdown.querySelector('.avalynx-select-items');
        const items = itemsContainer.querySelectorAll('.dropdown-item');
        const prevEmpty = itemsContainer.querySelector('.avalynx-select-empty');
        if (prevEmpty) prevEmpty.remove();
        let visibleCount = 0;
        items.forEach((item) => {
            const rawItemText = item.textContent || '';
            const rawSearch = searchTerm || '';
            const itemText = this.options.caseSensitive ? rawItemText : rawItemText.toLowerCase();
            const searchTermProcessed = this.options.caseSensitive ? rawSearch : rawSearch.toLowerCase();
            const itemTextNorm = itemText.replace(/\s+/g, '');
            const searchNorm = searchTermProcessed.replace(/\s+/g, '');
            const isVisible = (searchTermProcessed || this.options.showAll)
                ? (itemTextNorm.includes(searchNorm) || (this.options.showActive && item.classList.contains('active')))
                : false;
            if (item.parentElement) item.parentElement.classList.toggle('d-none', !isVisible);
            item.classList.toggle('d-none', !isVisible);
            if (isVisible) visibleCount++;
        });
        if (!this.options.ajax) {
            if (visibleCount === 0) {
                const li = document.createElement('li');
                li.className = 'dropdown-item-text text-muted avalynx-select-empty';
                li.textContent = this.language.noResults || 'No results';
                itemsContainer.appendChild(li);
            }
        }
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

    reset(button, dropdown, select) {
        dropdown.querySelectorAll('.dropdown-item.active').forEach(activeItem => {
            activeItem.classList.remove('active');
        });
        const searchInput = dropdown.querySelector('.avalynx-select-input');
        if (searchInput) searchInput.value = '';
        button.textContent = this.language.selectPlaceholder;
        button.classList.add('text-muted');
        select.value = '';
        this.filterDropdown(dropdown, '');
    }

    disable() {
        this.elements.forEach(original => {
            const button = document.getElementById(original.id.replace(/-original$/, ''));
            if (button) {
                button.setAttribute('disabled', 'disabled');
                button.setAttribute('aria-disabled', 'true');
                button.classList.add('disabled');
            }
            original.disabled = true;
        });
    }

    enable() {
        this.elements.forEach(original => {
            const button = document.getElementById(original.id.replace(/-original$/, ''));
            if (button) {
                button.removeAttribute('disabled');
                button.setAttribute('aria-disabled', 'false');
                button.classList.remove('disabled');
            }
            original.disabled = false;
        });
    }

    get value() {
        const first = this.elements && this.elements[0] ? this.elements[0] : null;
        return [first ? (first.value || '') : ''];
    }

    set value(values) {
        if (!Array.isArray(values)) return;
        this.elements.forEach((original, idx) => {
            const desired = values[idx] != null ? String(values[idx]) : '';
            const button = document.getElementById(original.id.replace(/-original$/, ''));
            const dropdown = button ? button.nextElementSibling : null;
            if (!button || !dropdown) return;
            if (desired === '') {
                this.reset(button, dropdown, original);
                return;
            }
            const item = dropdown.querySelector(`.dropdown-item[data-value="${desired}"]`);
            if (item) {
                this.selectItem({ preventDefault: () => {} }, item, original, button, dropdown);
            } else {
                this.reset(button, dropdown, original);
            }
        });
    }
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AvalynxSelect;
}
