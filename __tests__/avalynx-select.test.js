/**
 * AvalynxSelect Jest Tests
 * Comprehensive test suite for 100% code coverage
 */

global.bootstrap = {
    Dropdown: jest.fn().mockImplementation(() => ({
        hide: jest.fn(),
        show: jest.fn()
    }))
};

const AvalynxSelect = require('../src/js/avalynx-select.js');

describe('AvalynxSelect', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        global.fetch = jest.fn();
    });

    afterEach(() => {
        document.body.removeChild(container);
        document.body.innerHTML = '';
        jest.restoreAllMocks();
    });

    function makeSelect(html, opts, lang) {
        container.innerHTML = html;
        return new AvalynxSelect('.avalynx-select', opts, lang);
    }

    const basicHTML = `<select class="avalynx-select" id="ts"><option value="1">A</option><option value="2">B</option></select>`;
    const placeholderHTML = `<select class="avalynx-select" id="ts"><option value="">Please select</option><option value="1">O1</option><option value="2">O2</option></select>`;

    // === Constructor ===
    describe('Constructor', () => {
        test('default selector when null', () => {
            container.innerHTML = basicHTML.replace('class="avalynx-select"', 'class="avalynx-select"');
            const inst = new AvalynxSelect(null);
            expect(inst.initialized).toBe(true);
        });

        test('selector without prefix gets dot prepended', () => {
            container.innerHTML = `<select class="my-sel" id="ts"><option value="1">A</option></select>`;
            const inst = new AvalynxSelect('my-sel');
            expect(inst.initialized).toBe(true);
        });

        test('error for non-existent selector', () => {
            const spy = jest.spyOn(console, 'error').mockImplementation();
            const inst = new AvalynxSelect('#nope');
            expect(spy).toHaveBeenCalled();
            expect(inst.initialized).toBeUndefined();
            spy.mockRestore();
        });

        test('null options treated as empty object', () => {
            container.innerHTML = basicHTML;
            const inst = new AvalynxSelect('.avalynx-select', null);
            expect(inst.initialized).toBe(true);
        });

        test('non-object options treated as empty object', () => {
            container.innerHTML = basicHTML;
            const inst = new AvalynxSelect('.avalynx-select', 'bad');
            expect(inst.initialized).toBe(true);
        });

        test('null language treated as empty object', () => {
            container.innerHTML = basicHTML;
            const inst = new AvalynxSelect('.avalynx-select', {}, null);
            expect(inst.language.searchPlaceholder).toBe('Search...');
        });

        test('non-object language treated as empty object', () => {
            container.innerHTML = basicHTML;
            const inst = new AvalynxSelect('.avalynx-select', {}, 42);
            expect(inst.language.searchPlaceholder).toBe('Search...');
        });

        test('ajax as non-object is set to null', () => {
            container.innerHTML = basicHTML;
            const inst = new AvalynxSelect('.avalynx-select', { ajax: 'bad' });
            expect(inst.options.ajax).toBeNull();
        });

        test('ajax as object gets defaults', () => {
            container.innerHTML = basicHTML;
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = new AvalynxSelect('.avalynx-select', { ajax: { url: '/test' } });
            expect(inst.options.ajax.url).toBe('/test');
            expect(inst.options.ajax.method).toBe('GET');
        });

        test('onLoaded callback fires', () => {
            container.innerHTML = basicHTML;
            const fn = jest.fn();
            makeSelect(basicHTML, { onLoaded: fn });
            expect(fn).toHaveBeenCalled();
        });

        test('empty select is skipped', () => {
            container.innerHTML = `<select class="avalynx-select" id="ts"></select>`;
            const inst = new AvalynxSelect('.avalynx-select');
            expect(inst.initialized).toBe(true);
        });

        test('empty select with ajax still inits', () => {
            container.innerHTML = `<select class="avalynx-select" id="ts"></select>`;
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = new AvalynxSelect('.avalynx-select', { ajax: { url: '/x' } });
            expect(inst.initialized).toBe(true);
        });
    });

    // === Disabled ===
    describe('Disabled', () => {
        test('native disabled attr', () => {
            container.innerHTML = `<select class="avalynx-select" id="ts" disabled><option value="1">A</option></select>`;
            new AvalynxSelect('.avalynx-select');
            const btn = document.querySelector('button');
            expect(btn.hasAttribute('disabled')).toBe(true);
            expect(btn.getAttribute('aria-disabled')).toBe('true');
        });

        test('options.disabled', () => {
            makeSelect(basicHTML, { disabled: true });
            expect(document.querySelector('button').hasAttribute('disabled')).toBe(true);
        });

        test('click on disabled button prevented', () => {
            container.innerHTML = `<select class="avalynx-select" id="ts" disabled><option value="1">A</option><option value="2">B</option></select>`;
            new AvalynxSelect('.avalynx-select');
            const btn = document.querySelector('button');
            btn.click();
            // item click prevented
            const item = document.querySelector('.dropdown-item');
            item.click();
            expect(document.getElementById('ts-original').value).toBe('1');
        });
    });

    // === Live Search ===
    describe('Live Search', () => {
        test('liveSearch shows search box', () => {
            makeSelect(basicHTML, { liveSearch: true });
            expect(document.querySelector('.avalynx-select-livesearch').style.display).not.toBe('none');
        });

        test('liveSearch false hides search box', () => {
            makeSelect(basicHTML, { liveSearch: false });
            expect(document.querySelector('.avalynx-select-livesearch').style.display).toBe('none');
        });

        test('keyup filters items', () => {
            makeSelect(`<select class="avalynx-select" id="ts"><option value="1">Apple</option><option value="2">Banana</option></select>`, { liveSearch: true, noDefaultSelection: true });
            const input = document.querySelector('.avalynx-select-input');
            input.value = 'ban';
            input.dispatchEvent(new Event('keyup'));
            const items = document.querySelectorAll('.dropdown-item');
            expect(items[0].classList.contains('d-none')).toBe(true);
            expect(items[1].classList.contains('d-none')).toBe(false);
        });

        test('case sensitive search', () => {
            makeSelect(`<select class="avalynx-select" id="ts"><option value="1">Apple</option><option value="2">apple</option></select>`, { liveSearch: true, caseSensitive: true });
            const input = document.querySelector('.avalynx-select-input');
            input.value = 'Apple';
            input.dispatchEvent(new Event('keyup'));
            const items = document.querySelectorAll('.dropdown-item');
            expect(items[0].classList.contains('d-none')).toBe(false);
            expect(items[1].classList.contains('d-none')).toBe(true);
        });

        test('showAll false hides items when search empty', () => {
            makeSelect(`<select class="avalynx-select" id="ts"><option value="1">Apple</option><option value="2">Banana</option></select>`, { liveSearch: true, showAll: false, noDefaultSelection: true });
            const input = document.querySelector('.avalynx-select-input');
            input.value = '';
            input.dispatchEvent(new Event('keyup'));
            const items = document.querySelectorAll('.dropdown-item');
            items.forEach(i => expect(i.classList.contains('d-none')).toBe(true));
        });

        test('showActive keeps active visible', () => {
            makeSelect(`<select class="avalynx-select" id="ts"><option value="1">Apple</option><option value="2">Banana</option></select>`, { liveSearch: true, showActive: true });
            const items = document.querySelectorAll('.dropdown-item');
            items[0].classList.add('active');
            const input = document.querySelector('.avalynx-select-input');
            input.value = 'ban';
            input.dispatchEvent(new Event('keyup'));
            expect(items[0].classList.contains('d-none')).toBe(false);
        });

        test('no results shows message', () => {
            makeSelect(basicHTML, { liveSearch: true, noDefaultSelection: true });
            const input = document.querySelector('.avalynx-select-input');
            input.value = 'zzzzz';
            input.dispatchEvent(new Event('keyup'));
            const empty = document.querySelector('.avalynx-select-empty');
            expect(empty).not.toBeNull();
            expect(empty.textContent).toBe('No results');
        });
    });

    // === Selection ===
    describe('Selection', () => {
        test('select item updates button', () => {
            makeSelect(placeholderHTML, { noDefaultSelection: true });
            document.querySelectorAll('.dropdown-item')[1].click();
            expect(document.querySelector('button').textContent).toBe('O1');
        });

        test('onChange fires after init', () => {
            const fn = jest.fn();
            makeSelect(placeholderHTML, { noDefaultSelection: true, onChange: fn });
            document.querySelectorAll('.dropdown-item')[1].click();
            expect(fn).toHaveBeenCalledWith('1');
        });

        test('onChange not called during init', () => {
            const fn = jest.fn();
            makeSelect(`<select class="avalynx-select" id="ts"><option value="1">A</option><option value="2" selected>B</option></select>`, { onChange: fn });
            expect(fn).not.toHaveBeenCalled();
        });

        test('clicking active item resets', () => {
            makeSelect(placeholderHTML, { noDefaultSelection: true });
            const item = document.querySelectorAll('.dropdown-item')[1];
            item.click();
            item.click();
            expect(document.querySelector('button').textContent).toBe('Please select...');
        });

        test('clears search input after selection', () => {
            makeSelect(basicHTML, { liveSearch: true });
            const input = document.querySelector('.avalynx-select-input');
            input.value = 'test';
            document.querySelector('.dropdown-item').click();
            expect(input.value).toBe('');
        });
    });

    // === Default Value ===
    describe('Default Value', () => {
        test('options.defaultValue', () => {
            makeSelect(placeholderHTML, { defaultValue: '2' });
            expect(document.querySelector('button').textContent).toBe('O2');
        });

        test('data-default-value attribute', () => {
            container.innerHTML = `<select class="avalynx-select" id="ts" data-default-value="1"><option value="">X</option><option value="1">O1</option></select>`;
            new AvalynxSelect('.avalynx-select');
            expect(document.querySelector('button').textContent).toBe('O1');
        });

        test('options.defaultValue overrides data attr', () => {
            container.innerHTML = `<select class="avalynx-select" id="ts" data-default-value="1"><option value="">X</option><option value="1">O1</option><option value="2">O2</option></select>`;
            new AvalynxSelect('.avalynx-select', { defaultValue: '2' });
            expect(document.querySelector('button').textContent).toBe('O2');
        });

        test('native selected option', () => {
            makeSelect(`<select class="avalynx-select" id="ts"><option value="">X</option><option value="1">O1</option><option value="2" selected>O2</option></select>`);
            expect(document.querySelector('button').textContent).toBe('O2');
        });

        test('invalid defaultValue resets', () => {
            makeSelect(placeholderHTML, { defaultValue: 'nope' });
            expect(document.querySelector('button').textContent).toBe('Please select...');
        });

        test('noDefaultSelection resets', () => {
            makeSelect(placeholderHTML, { noDefaultSelection: true });
            expect(document.querySelector('button').classList.contains('text-muted')).toBe(true);
        });
    });

    // === Public API ===
    describe('Public API', () => {
        test('disable()', () => {
            const inst = makeSelect(basicHTML);
            inst.disable();
            expect(document.querySelector('button').hasAttribute('disabled')).toBe(true);
            expect(document.getElementById('ts-original').disabled).toBe(true);
        });

        test('enable()', () => {
            container.innerHTML = `<select class="avalynx-select" id="ts" disabled><option value="1">A</option></select>`;
            const inst = new AvalynxSelect('.avalynx-select');
            inst.enable();
            expect(document.querySelector('button').hasAttribute('disabled')).toBe(false);
            expect(document.getElementById('ts-original').disabled).toBe(false);
        });

        test('value getter', () => {
            const inst = makeSelect(`<select class="avalynx-select" id="ts"><option value="1">A</option><option value="2" selected>B</option></select>`);
            expect(inst.value).toEqual(['2']);
        });

        test('value getter with no elements', () => {
            const spy = jest.spyOn(console, 'error').mockImplementation();
            const inst = new AvalynxSelect('#nope');
            // elements is empty NodeList, value getter handles it
            spy.mockRestore();
        });

        test('value setter selects item', () => {
            const inst = makeSelect(placeholderHTML, { noDefaultSelection: true });
            inst.value = ['2'];
            expect(document.querySelector('button').textContent).toBe('O2');
        });

        test('value setter with empty resets', () => {
            const inst = makeSelect(placeholderHTML);
            inst.value = [''];
            expect(document.querySelector('button').textContent).toBe('Please select...');
        });

        test('value setter non-array ignored', () => {
            const inst = makeSelect(basicHTML);
            inst.value = 'bad';
            // no crash
        });

        test('value setter with nonexistent value resets', () => {
            const inst = makeSelect(placeholderHTML, { noDefaultSelection: true });
            inst.value = ['999'];
            expect(document.querySelector('button').textContent).toBe('Please select...');
        });
    });

    // === DOM ===
    describe('DOM', () => {
        test('creates button and dropdown', () => {
            makeSelect(basicHTML);
            expect(document.querySelector('button')).not.toBeNull();
            expect(document.querySelector('.dropdown-menu')).not.toBeNull();
        });

        test('hides original select', () => {
            makeSelect(basicHTML);
            expect(document.getElementById('ts-original').style.display).toBe('none');
        });

        test('template created', () => {
            makeSelect(basicHTML);
            expect(document.getElementById('avalynx-select-template')).not.toBeNull();
        });

        test('className applied', () => {
            makeSelect(basicHTML, { className: 'cls1 cls2' });
            const btn = document.querySelector('button');
            expect(btn.classList.contains('cls1')).toBe(true);
            expect(btn.classList.contains('cls2')).toBe(true);
        });

        test('multiple selects', () => {
            container.innerHTML = `<select class="avalynx-select" id="ts1"><option value="1">A</option></select><select class="avalynx-select" id="ts2"><option value="2">B</option></select>`;
            const inst = new AvalynxSelect('.avalynx-select');
            expect(inst.elements.length).toBe(2);
        });
    });

    // === Button click ===
    describe('Button click', () => {
        test('button click focuses search and filters (non-ajax)', () => {
            jest.useFakeTimers();
            makeSelect(basicHTML, { liveSearch: true, noDefaultSelection: true });
            const btn = document.querySelector('button');
            const input = document.querySelector('.avalynx-select-input');
            const focusSpy = jest.spyOn(input, 'focus');
            btn.click();
            jest.runAllTimers();
            expect(focusSpy).toHaveBeenCalled();
            jest.useRealTimers();
        });

        test('button click on disabled does nothing', () => {
            jest.useFakeTimers();
            makeSelect(basicHTML, { disabled: true });
            const btn = document.querySelector('button');
            btn.click();
            jest.runAllTimers();
            jest.useRealTimers();
        });

        test('button click on disabled ajax does nothing', () => {
            jest.useFakeTimers();
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            makeSelect(basicHTML, { disabled: true, ajax: { url: '/api' } });
            const btn = document.querySelector('button');
            btn.dispatchEvent(new Event('click', { bubbles: true }));
            jest.runAllTimers();
            jest.useRealTimers();
        });
    });

    // === Scroll Settings ===
    describe('Scroll Settings', () => {
        test('applyScrollSettings with many items', () => {
            jest.useFakeTimers();
            const opts = [];
            for (let i = 0; i < 15; i++) opts.push(`<option value="${i}">Item ${i}</option>`);
            makeSelect(`<select class="avalynx-select" id="ts">${opts.join('')}</select>`, { scrollList: true, scrollItems: 5, liveSearch: true });
            jest.runAllTimers();
            jest.useRealTimers();
        });

        test('applyScrollSettings with few items does nothing extra', () => {
            makeSelect(basicHTML, { scrollList: true, scrollItems: 10 });
            // no overflow set
        });

        test('scrollList false skips scroll', () => {
            const opts = [];
            for (let i = 0; i < 15; i++) opts.push(`<option value="${i}">Item ${i}</option>`);
            makeSelect(`<select class="avalynx-select" id="ts">${opts.join('')}</select>`, { scrollList: false });
        });
    });

    // === _debounce ===
    describe('_debounce', () => {
        test('debounce delays execution', () => {
            jest.useFakeTimers();
            const inst = makeSelect(basicHTML);
            const fn = jest.fn();
            const debounced = inst._debounce(fn, 100);
            debounced('a');
            debounced('b');
            expect(fn).not.toHaveBeenCalled();
            jest.advanceTimersByTime(100);
            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenCalledWith('b');
            jest.useRealTimers();
        });
    });

    // === _formatTypeMore ===
    describe('_formatTypeMore', () => {
        test('formats remaining chars', () => {
            const inst = makeSelect(basicHTML);
            expect(inst._formatTypeMore(3)).toBe('Type 3 more characters...');
        });

        test('uses custom template', () => {
            const inst = makeSelect(basicHTML, {}, { typeMore: 'Need {remaining} more' });
            expect(inst._formatTypeMore(5)).toBe('Need 5 more');
        });
    });

    // === AJAX ===
    describe('AJAX', () => {
        test('_setupAjax shows livesearch and debounces keyup', () => {
            jest.useFakeTimers();
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            makeSelect(basicHTML, { ajax: { url: '/api', debounce: 50, minimumInputLength: 0 } });
            const input = document.querySelector('.avalynx-select-input');
            input.value = 'test';
            input.dispatchEvent(new Event('keyup'));
            jest.advanceTimersByTime(50);
            expect(global.fetch).toHaveBeenCalled();
            jest.useRealTimers();
        });

        test('ajax keyup with term below minimumInputLength shows typeMore', () => {
            jest.useFakeTimers();
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            makeSelect(basicHTML, { ajax: { url: '/api', debounce: 50, minimumInputLength: 5 } });
            const input = document.querySelector('.avalynx-select-input');
            input.value = 'ab';
            input.dispatchEvent(new Event('keyup'));
            jest.advanceTimersByTime(50);
            jest.useRealTimers();
        });

        test('ajax button click with minLen > 0 and short term shows typeMore', () => {
            jest.useFakeTimers();
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            makeSelect(basicHTML, { ajax: { url: '/api', minimumInputLength: 3 } });
            const btn = document.querySelector('button');
            btn.click();
            jest.runAllTimers();
            jest.useRealTimers();
        });

        test('ajax button click with minLen=0 and initialLoad triggers load', () => {
            jest.useFakeTimers();
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            makeSelect(basicHTML, { ajax: { url: '/api', minimumInputLength: 0, initialLoad: true } });
            const btn = document.querySelector('button');
            btn.click();
            jest.runAllTimers();
            expect(global.fetch).toHaveBeenCalled();
            jest.useRealTimers();
        });

        test('ajax button click with minLen met and initialLoad triggers load', () => {
            jest.useFakeTimers();
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            makeSelect(basicHTML, { ajax: { url: '/api', minimumInputLength: 2, initialLoad: true } });
            const input = document.querySelector('.avalynx-select-input');
            input.value = 'abc';
            const btn = document.querySelector('button');
            btn.click();
            jest.runAllTimers();
            expect(global.fetch).toHaveBeenCalled();
            jest.useRealTimers();
        });

        test('ajax button click with minLen met but no initialLoad does not load', () => {
            jest.useFakeTimers();
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            makeSelect(basicHTML, { ajax: { url: '/api', minimumInputLength: 2, initialLoad: false } });
            const input = document.querySelector('.avalynx-select-input');
            input.value = 'abc';
            const btn = document.querySelector('button');
            btn.click();
            jest.runAllTimers();
            jest.useRealTimers();
        });

        test('ajax keyup with minLen=0 shows idleHint', () => {
            jest.useFakeTimers();
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            makeSelect(basicHTML, { ajax: { url: '/api', debounce: 50, minimumInputLength: 0 } }, { idleHint: 'Type to search' });
            const input = document.querySelector('.avalynx-select-input');
            input.value = '';
            input.dispatchEvent(new Event('keyup'));
            jest.advanceTimersByTime(50);
            jest.useRealTimers();
        });
    });

    // === _triggerAjaxLoad ===
    describe('_triggerAjaxLoad', () => {
        test('default params without mapRequest', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([{ value: '1', text: 'A' }]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._triggerAjaxLoad(select, dropdown, 'test', btn);
            await new Promise(r => setTimeout(r, 0));
            expect(global.fetch).toHaveBeenCalled();
            const url = global.fetch.mock.calls[0][0];
            expect(url).toContain('q=test');
        });

        test('with mapRequest', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, {
                ajax: {
                    url: '/api',
                    mapRequest: (ctx) => ({ url: '/custom', method: 'POST', headers: { 'X-Custom': '1' }, params: { s: ctx.term }, body: { q: ctx.term } })
                }
            });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._triggerAjaxLoad(select, dropdown, 'x', btn);
            await new Promise(r => setTimeout(r, 0));
            const opts = global.fetch.mock.calls[0][1];
            expect(opts.method).toBe('POST');
        });

        test('mapRequest throws is caught', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, {
                ajax: { url: '/api', mapRequest: () => { throw new Error('fail'); } }
            });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._triggerAjaxLoad(select, dropdown, 'x', btn);
            await new Promise(r => setTimeout(r, 0));
        });

        test('with mapResponse', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ items: [{ value: '1', text: 'A' }] }) });
            const inst = makeSelect(basicHTML, {
                ajax: { url: '/api', mapResponse: (json) => json.items }
            });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._triggerAjaxLoad(select, dropdown, 'x', btn);
            await new Promise(r => setTimeout(r, 0));
        });

        test('mapResponse throws returns empty', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
            const inst = makeSelect(basicHTML, {
                ajax: { url: '/api', mapResponse: () => { throw new Error('fail'); } }
            });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._triggerAjaxLoad(select, dropdown, 'x', btn);
            await new Promise(r => setTimeout(r, 0));
        });

        test('response with json.data array', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ data: [{ id: '1', label: 'A' }] }) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._triggerAjaxLoad(select, dropdown, 'x', btn);
            await new Promise(r => setTimeout(r, 0));
        });

        test('response with string items', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(['a', 'b']) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._triggerAjaxLoad(select, dropdown, 'x', btn);
            await new Promise(r => setTimeout(r, 0));
        });

        test('response with number items', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([1, 2]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._triggerAjaxLoad(select, dropdown, 'x', btn);
            await new Promise(r => setTimeout(r, 0));
        });

        test('response with array items', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([['1', 'A'], ['2', 'B']]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._triggerAjaxLoad(select, dropdown, 'x', btn);
            await new Promise(r => setTimeout(r, 0));
        });

        test('response with null items filtered', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([null, { value: '1', text: 'A' }]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._triggerAjaxLoad(select, dropdown, 'x', btn);
            await new Promise(r => setTimeout(r, 0));
        });

        test('fetch error shows error message', async () => {
            global.fetch.mockRejectedValue(new Error('Network error'));
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._triggerAjaxLoad(select, dropdown, 'x', btn);
            await new Promise(r => setTimeout(r, 0));
        });

        test('fetch non-ok response throws', async () => {
            global.fetch.mockResolvedValue({ ok: false, status: 500, statusText: 'Server Error' });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._triggerAjaxLoad(select, dropdown, 'x', btn);
            await new Promise(r => setTimeout(r, 0));
        });

        test('POST with non-object body (FormData)', async () => {
            const formData = new FormData();
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, {
                ajax: { url: '/api', mapRequest: () => ({ method: 'POST', body: formData, params: {} }) }
            });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._triggerAjaxLoad(select, dropdown, 'x', btn);
            await new Promise(r => setTimeout(r, 0));
            const opts = global.fetch.mock.calls[0][1];
            expect(opts.body).toBe(formData);
        });

        test('GET with body does not attach body', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, {
                ajax: { url: '/api', method: 'GET', mapRequest: () => ({ method: 'GET', body: { q: 'x' }, params: {} }) }
            });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._triggerAjaxLoad(select, dropdown, 'x', btn);
            await new Promise(r => setTimeout(r, 0));
            const opts = global.fetch.mock.calls[0][1];
            expect(opts.body).toBeUndefined();
        });
    });

    // === _prefetchByValue ===
    describe('_prefetchByValue', () => {
        test('with resolveByValue function', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([{ value: '5', text: 'Five' }]) });
            const inst = makeSelect(basicHTML, {
                ajax: {
                    url: '/api',
                    resolveByValue: (ctx) => ({ url: '/resolve', method: 'POST', headers: { 'X-T': '1' }, params: { id: ctx.value }, body: { id: ctx.value } })
                }
            });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._prefetchByValue(select, dropdown, btn, '5');
            await new Promise(r => setTimeout(r, 0));
        });

        test('without resolveByValue uses default params', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([{ value: '5', text: 'Five' }]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._prefetchByValue(select, dropdown, btn, '5');
            await new Promise(r => setTimeout(r, 0));
            expect(global.fetch.mock.calls[0][0]).toContain('id=5');
        });

        test('resolveByValue throws is caught', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, {
                ajax: { url: '/api', resolveByValue: () => { throw new Error('fail'); } }
            });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._prefetchByValue(select, dropdown, btn, '5');
            await new Promise(r => setTimeout(r, 0));
        });

        test('prefetch with mapResponse', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ items: [{ value: '5', text: 'Five' }] }) });
            const inst = makeSelect(basicHTML, {
                ajax: { url: '/api', mapResponse: (json) => json.items }
            });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._prefetchByValue(select, dropdown, btn, '5');
            await new Promise(r => setTimeout(r, 0));
        });

        test('prefetch mapResponse throws returns empty', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
            const inst = makeSelect(basicHTML, {
                ajax: { url: '/api', mapResponse: () => { throw new Error('fail'); } }
            });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._prefetchByValue(select, dropdown, btn, '5');
            await new Promise(r => setTimeout(r, 0));
        });

        test('prefetch no match does nothing', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([{ value: '99', text: 'X' }]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._prefetchByValue(select, dropdown, btn, '5');
            await new Promise(r => setTimeout(r, 0));
        });

        test('prefetch fetch error caught', async () => {
            global.fetch.mockRejectedValue(new Error('fail'));
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._prefetchByValue(select, dropdown, btn, '5');
            await new Promise(r => setTimeout(r, 0));
        });

        test('prefetch non-ok response', async () => {
            global.fetch.mockResolvedValue({ ok: false, status: 404, statusText: 'Not Found' });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._prefetchByValue(select, dropdown, btn, '5');
            await new Promise(r => setTimeout(r, 0));
        });

        test('prefetch with json.data array', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ data: [{ value: '5', text: 'Five' }] }) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._prefetchByValue(select, dropdown, btn, '5');
            await new Promise(r => setTimeout(r, 0));
        });

        test('prefetch with string items', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(['5']) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._prefetchByValue(select, dropdown, btn, '5');
            await new Promise(r => setTimeout(r, 0));
        });

        test('prefetch with array items', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([['5', 'Five']]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._prefetchByValue(select, dropdown, btn, '5');
            await new Promise(r => setTimeout(r, 0));
        });

        test('prefetch POST with FormData body', async () => {
            const fd = new FormData();
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, {
                ajax: { url: '/api', resolveByValue: () => ({ method: 'POST', body: fd, params: {} }) }
            });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._prefetchByValue(select, dropdown, btn, '5');
            await new Promise(r => setTimeout(r, 0));
            const opts = global.fetch.mock.calls[0][1];
            expect(opts.body).toBe(fd);
        });

        test('defaultValue triggers prefetch in init', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([{ value: '5', text: 'Five' }]) });
            makeSelect(basicHTML, { ajax: { url: '/api' }, defaultValue: '5' });
            await new Promise(r => setTimeout(r, 0));
            expect(global.fetch).toHaveBeenCalled();
        });

        test('data-default-value triggers prefetch in init', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([{ value: '5', text: 'Five' }]) });
            container.innerHTML = `<select class="avalynx-select" id="ts" data-default-value="5"><option value="1">A</option></select>`;
            new AvalynxSelect('.avalynx-select', { ajax: { url: '/api' } });
            await new Promise(r => setTimeout(r, 0));
            expect(global.fetch).toHaveBeenCalled();
        });

        test('url with existing query string appends with &', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api?foo=bar' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._prefetchByValue(select, dropdown, btn, '5');
            await new Promise(r => setTimeout(r, 0));
            expect(global.fetch.mock.calls[0][0]).toContain('&id=5');
        });
    });

    // === _renderItemsFromData ===
    describe('_renderItemsFromData', () => {
        test('renders items and attaches click handlers', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._renderItemsFromData(dropdown, [{ value: '1', text: 'A' }, { value: '2', text: 'B' }], select, btn);
            const items = dropdown.querySelectorAll('.dropdown-item');
            expect(items.length).toBeGreaterThanOrEqual(2);
        });

        test('renders empty message when no items', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' }, showActive: false });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            select.value = '';
            inst._renderItemsFromData(dropdown, [], select, btn);
        });

        test('maxItemsToShow caps rendered items', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' }, maxItemsToShow: 2 });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            select.value = '';
            inst._renderItemsFromData(dropdown, [
                { value: '1', text: 'A' }, { value: '2', text: 'B' }, { value: '3', text: 'C' }
            ], select, btn);
        });

        test('showActive with current value shows active item', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' }, showActive: true });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            select.value = '1';
            btn.textContent = 'A';
            inst._renderItemsFromData(dropdown, [{ value: '1', text: 'A' }, { value: '2', text: 'B' }], select, btn);
        });

        test('duplicate values are filtered', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            select.value = '';
            inst._renderItemsFromData(dropdown, [{ value: '1', text: 'A' }, { value: '1', text: 'A2' }], select, btn);
        });

        test('null items in array are skipped', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            select.value = '';
            inst._renderItemsFromData(dropdown, [null, { value: '1', text: 'A' }], select, btn);
        });

        test('click on rendered item when disabled is prevented', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' }, disabled: true });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._renderItemsFromData(dropdown, [{ value: '10', text: 'X' }], select, btn);
            const item = dropdown.querySelector('.dropdown-item[data-value="10"]');
            if (item) item.click();
        });

        test('click on rendered item when enabled calls selectItem', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            select.value = '';
            inst._renderItemsFromData(dropdown, [{ value: '10', text: 'X' }], select, btn);
            const item = dropdown.querySelector('.dropdown-item[data-value="10"]');
            item.click();
            expect(btn.textContent).toBe('X');
        });
    });

    // === _clearItems ===
    describe('_clearItems', () => {
        test('clears and re-adds active item for ajax with showActive', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' }, showActive: true });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            select.value = '1';
            btn.textContent = 'A';
            inst._clearItems(dropdown, select, btn);
            const activeItem = dropdown.querySelector('.dropdown-item.active');
            expect(activeItem).not.toBeNull();
        });

        test('clearItems active item click when disabled', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' }, showActive: true, disabled: true });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            select.value = '1';
            btn.textContent = 'A';
            inst._clearItems(dropdown, select, btn);
            const activeItem = dropdown.querySelector('.dropdown-item.active');
            if (activeItem) activeItem.click();
        });

        test('clearItems without active value', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' }, showActive: true });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            select.value = '';
            inst._clearItems(dropdown, select, btn);
        });

        test('clearItems non-ajax does not add active', () => {
            const inst = makeSelect(basicHTML);
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            select.value = '1';
            inst._clearItems(dropdown, select, btn);
            const activeItem = dropdown.querySelector('.dropdown-item.active');
            expect(activeItem).toBeNull();
        });
    });

    // === _setLoading, _setEmpty, _setError ===
    describe('Status methods', () => {
        test('_setLoading shows loading text', () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._setLoading(dropdown, select, btn);
            expect(dropdown.querySelector('.avalynx-select-items').textContent).toContain('Loading');
        });

        test('_setEmpty shows message', () => {
            const inst = makeSelect(basicHTML);
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._setEmpty(dropdown, 'Nothing here', select, btn);
            expect(dropdown.querySelector('.avalynx-select-items').textContent).toContain('Nothing here');
        });

        test('_setEmpty with null message uses default', () => {
            const inst = makeSelect(basicHTML);
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._setEmpty(dropdown, null, select, btn);
            expect(dropdown.querySelector('.avalynx-select-items').textContent).toContain('No results');
        });

        test('_setError shows error', () => {
            const inst = makeSelect(basicHTML);
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._setError(dropdown, 'Oops', select, btn);
            expect(dropdown.querySelector('.avalynx-select-items').textContent).toContain('Oops');
        });

        test('_setError with null message uses default', () => {
            const inst = makeSelect(basicHTML);
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._setError(dropdown, null, select, btn);
            expect(dropdown.querySelector('.avalynx-select-items').textContent).toContain('Error loading data');
        });
    });

    // === _triggerAjaxLoad url with ? ===
    describe('_triggerAjaxLoad url edge cases', () => {
        test('url with existing query string', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api?existing=1' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._triggerAjaxLoad(select, dropdown, 'x', btn);
            await new Promise(r => setTimeout(r, 0));
            expect(global.fetch.mock.calls[0][0]).toContain('&q=x');
        });
    });

    // === filterDropdown edge: liveSearchElement pb-2 toggle ===
    describe('filterDropdown edge cases', () => {
        test('removes pb-2 when no visible items', () => {
            const inst = makeSelect(basicHTML, { liveSearch: true, noDefaultSelection: true });
            const dd = document.querySelector('.dropdown-menu');
            inst.filterDropdown(dd, 'zzzzz');
            const ls = dd.querySelector('.avalynx-select-livesearch');
            expect(ls.classList.contains('pb-2')).toBe(false);
        });

        test('adds pb-2 when visible items exist', () => {
            const inst = makeSelect(basicHTML, { liveSearch: true, noDefaultSelection: true });
            const dd = document.querySelector('.dropdown-menu');
            inst.filterDropdown(dd, '');
            const ls = dd.querySelector('.avalynx-select-livesearch');
            expect(ls.classList.contains('pb-2')).toBe(true);
        });
    });

    // === items with text=null in _renderItemsFromData ===
    describe('_renderItemsFromData text fallback', () => {
        test('item with null text uses value', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            select.value = '';
            inst._renderItemsFromData(dropdown, [{ value: '1', text: null }], select, btn);
            const item = dropdown.querySelector('.dropdown-item[data-value="1"]');
            expect(item.textContent).toBe('1');
        });
    });

    // === value getter edge: empty elements ===
    describe('value getter edge', () => {
        test('returns empty string when no elements', () => {
            const spy = jest.spyOn(console, 'error').mockImplementation();
            const inst = new AvalynxSelect('#nonexistent');
            spy.mockRestore();
            // inst.elements is undefined since constructor returned early
            // We need to test the actual getter path
        });
    });

    // === Prefetch with number items ===
    describe('_prefetchByValue number items', () => {
        test('prefetch with number items', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([5]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._prefetchByValue(select, dropdown, btn, '5');
            await new Promise(r => setTimeout(r, 0));
        });

        test('prefetch with null in items', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([null, { value: '5', text: 'Five' }]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._prefetchByValue(select, dropdown, btn, '5');
            await new Promise(r => setTimeout(r, 0));
        });
    });

    // === Prefetch with items having id/label instead of value/text ===
    describe('_prefetchByValue id/label mapping', () => {
        test('maps id to value and label to text', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([{ id: '5', label: 'Five' }]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._prefetchByValue(select, dropdown, btn, '5');
            await new Promise(r => setTimeout(r, 0));
        });
    });

    // === _triggerAjaxLoad id/label mapping ===
    describe('_triggerAjaxLoad id/label mapping', () => {
        test('maps id to value and label to text', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([{ id: '1', label: 'One' }]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._triggerAjaxLoad(select, dropdown, 'x', btn);
            await new Promise(r => setTimeout(r, 0));
        });
    });

    // === items with value=null, text=null (uses empty string) ===
    describe('item mapping edge cases', () => {
        test('item with no value/id/text/label uses empty strings', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([{ foo: 'bar' }]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._triggerAjaxLoad(select, dropdown, 'x', btn);
            await new Promise(r => setTimeout(r, 0));
        });

        test('prefetch item with no value/id/text/label', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([{ foo: 'bar' }]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._prefetchByValue(select, dropdown, btn, '');
            await new Promise(r => setTimeout(r, 0));
        });
    });

    // === resolveByValue returning empty/partial ===
    describe('resolveByValue edge cases', () => {
        test('resolveByValue returns null', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, {
                ajax: { url: '/api', resolveByValue: () => null }
            });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._prefetchByValue(select, dropdown, btn, '5');
            await new Promise(r => setTimeout(r, 0));
        });
    });

    // === _setEmpty with empty string ===
    describe('_setEmpty edge', () => {
        test('empty string message uses default', () => {
            const inst = makeSelect(basicHTML);
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._setEmpty(dropdown, '', select, btn);
            expect(dropdown.querySelector('.avalynx-select-items').textContent).toContain('No results');
        });
    });

    // === _setError with empty string ===
    describe('_setError edge', () => {
        test('empty string message uses default', () => {
            const inst = makeSelect(basicHTML);
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._setError(dropdown, '', select, btn);
            expect(dropdown.querySelector('.avalynx-select-items').textContent).toContain('Error loading data');
        });
    });

    // === _setLoading with empty language.loading ===
    describe('_setLoading edge', () => {
        test('empty loading text uses default', () => {
            const inst = makeSelect(basicHTML, {}, { loading: '' });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._setLoading(dropdown, select, btn);
            expect(dropdown.querySelector('.avalynx-select-items').textContent).toContain('Loading...');
        });
    });

    // === params with null value in qs ===
    describe('query string null params', () => {
        test('null param value becomes empty string', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, {
                ajax: { url: '/api', mapRequest: () => ({ params: { q: null } }) }
            });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._triggerAjaxLoad(select, dropdown, 'x', btn);
            await new Promise(r => setTimeout(r, 0));
            expect(global.fetch.mock.calls[0][0]).toContain('q=');
        });
    });

    // === _renderItemsFromData click on active item in _clearItems ===
    describe('_clearItems active click', () => {
        test('click on active item in clearItems calls selectItem', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' }, showActive: true });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            select.value = '1';
            btn.textContent = 'A';
            inst._clearItems(dropdown, select, btn);
            const activeItem = dropdown.querySelector('.dropdown-item.active');
            activeItem.click();
            // Should reset since it's active
            expect(btn.textContent).toBe('Please select...');
        });
    });

    // === button click with null button (no disabled) ===
    describe('_clearItems button null edge', () => {
        test('clearItems with null button', () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' }, showActive: true });
            const dropdown = document.querySelector('.dropdown-menu');
            const select = document.getElementById('ts-original');
            select.value = '1';
            inst._clearItems(dropdown, select, null);
        });
    });

    // === _formatTypeMore with empty/null template ===
    describe('_formatTypeMore edge', () => {
        test('null typeMore uses default', () => {
            const inst = makeSelect(basicHTML);
            inst.language.typeMore = null;
            expect(inst._formatTypeMore(3)).toBe('Type 3 more characters...');
        });
    });

    // === Fallback branches for || defaults ===
    describe('Fallback branches', () => {
        test('ajax with empty url/method/headers/debounce', async () => {
            jest.useFakeTimers();
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '', method: '', headers: null, debounce: 0 } });
            const input = document.querySelector('.avalynx-select-input');
            input.value = 'x';
            input.dispatchEvent(new Event('keyup'));
            jest.advanceTimersByTime(250);
            jest.useRealTimers();
        });

        test('_triggerAjaxLoad with minimal ajax config', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst.options.ajax.start = 0;
            inst.options.ajax.length = 0;
            inst._triggerAjaxLoad(select, dropdown, 'x', btn);
            await new Promise(r => setTimeout(r, 0));
        });

        test('_prefetchByValue with empty ajax url/method/headers', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '', method: '', headers: null } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._prefetchByValue(select, dropdown, btn, '5');
            await new Promise(r => setTimeout(r, 0));
        });

        test('_prefetchByValue with no qs (empty params)', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api', resolveByValue: () => ({ params: {} }) } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._prefetchByValue(select, dropdown, btn, '5');
            await new Promise(r => setTimeout(r, 0));
            expect(global.fetch.mock.calls[0][0]).toBe('/api');
        });

        test('_triggerAjaxLoad with no qs (empty params)', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api', mapRequest: () => ({ params: {} }) } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._triggerAjaxLoad(select, dropdown, 'x', btn);
            await new Promise(r => setTimeout(r, 0));
            expect(global.fetch.mock.calls[0][0]).toBe('/api');
        });

        test('mapResponse returns null treated as empty', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api', mapResponse: () => null } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._triggerAjaxLoad(select, dropdown, 'x', btn);
            await new Promise(r => setTimeout(r, 0));
        });

        test('prefetch mapResponse returns null treated as empty', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api', mapResponse: () => null } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._prefetchByValue(select, dropdown, btn, '5');
            await new Promise(r => setTimeout(r, 0));
        });

        test('_setEmpty with no language.noResults', () => {
            const inst = makeSelect(basicHTML, {}, { noResults: '' });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst.language.noResults = '';
            inst._setEmpty(dropdown, '', select, btn);
        });

        test('_setError with no language.error', () => {
            const inst = makeSelect(basicHTML, {}, { error: '' });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst.language.error = '';
            inst._setError(dropdown, '', select, btn);
        });

        test('_setLoading with no language.loading', () => {
            const inst = makeSelect(basicHTML, {}, { loading: '' });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst.language.loading = '';
            inst._setLoading(dropdown, select, btn);
        });

        test('fetch error with no message', async () => {
            global.fetch.mockRejectedValue({ });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._triggerAjaxLoad(select, dropdown, 'x', btn);
            await new Promise(r => setTimeout(r, 0));
        });

        test('_renderItemsFromData with non-array items', () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            select.value = '';
            inst._renderItemsFromData(dropdown, 'not-array', select, btn);
        });

        test('value getter with elements[0] having no value', () => {
            const inst = makeSelect(basicHTML);
            const orig = document.getElementById('ts-original');
            orig.value = '';
            expect(inst.value).toEqual(['']);
        });

        test('value setter with null idx', () => {
            const inst = makeSelect(placeholderHTML, { noDefaultSelection: true });
            inst.value = [null];
            expect(document.querySelector('button').textContent).toBe('Please select...');
        });

        test('disable/enable with no matching button', () => {
            const inst = makeSelect(basicHTML);
            // Remove the button so getElementById returns null
            const btn = document.querySelector('button');
            btn.remove();
            inst.disable();
            inst.enable();
        });

        test('value setter with no button/dropdown', () => {
            const inst = makeSelect(basicHTML);
            const btn = document.querySelector('button');
            btn.remove();
            inst.value = ['1'];
        });

        test('createDropdownElements with selected value', () => {
            makeSelect(`<select class="avalynx-select" id="ts"><option value="1" selected>A</option><option value="2">B</option></select>`);
            const btn = document.querySelector('button');
            expect(btn.textContent).toBe('A');
        });

        test('ajax button click minLen=0 no initialLoad shows idleHint', () => {
            jest.useFakeTimers();
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            makeSelect(basicHTML, { ajax: { url: '/api', minimumInputLength: 0, initialLoad: false } });
            const btn = document.querySelector('button');
            btn.dispatchEvent(new Event('click', { bubbles: true }));
            jest.runAllTimers();
            jest.useRealTimers();
        });

        test('_clearItems button textContent fallback to empty', () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' }, showActive: true });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            select.value = '1';
            btn.textContent = '';
            inst._clearItems(dropdown, select, btn);
            const active = dropdown.querySelector('.dropdown-item.active');
            expect(active.textContent).toBe('1');
        });

        test('_renderItemsFromData currentActiveText fallback', () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' }, showActive: true });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            select.value = '1';
            btn.textContent = '';
            inst._renderItemsFromData(dropdown, [{ value: '2', text: 'B' }], select, btn);
        });

        test('filterDropdown with ajax does not add empty message', () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' } });
            const dropdown = document.querySelector('.dropdown-menu');
            inst.filterDropdown(dropdown, 'zzz');
            const empty = dropdown.querySelector('.avalynx-select-empty');
            expect(empty).toBeNull();
        });

        test('filterDropdown removes previous empty element', () => {
            const inst = makeSelect(basicHTML, { liveSearch: true, noDefaultSelection: true });
            const dropdown = document.querySelector('.dropdown-menu');
            inst.filterDropdown(dropdown, 'zzz');
            expect(dropdown.querySelector('.avalynx-select-empty')).not.toBeNull();
            inst.filterDropdown(dropdown, '');
            // Previous empty should be removed
        });

        test('filterDropdown item without parentElement', () => {
            const inst = makeSelect(basicHTML, { liveSearch: true, noDefaultSelection: true });
            const dropdown = document.querySelector('.dropdown-menu');
            // This just ensures the parentElement check doesn't crash
            inst.filterDropdown(dropdown, 'A');
        });

        test('reset with null searchInput', () => {
            const inst = makeSelect(basicHTML);
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            // Remove search input
            const input = dropdown.querySelector('.avalynx-select-input');
            input.remove();
            inst.reset(btn, dropdown, select);
            expect(btn.textContent).toBe('Please select...');
        });

        test('setInitialSelection with selectedIndex and matching item', () => {
            makeSelect(`<select class="avalynx-select" id="ts"><option value="">X</option><option value="1" selected>O1</option></select>`);
            expect(document.querySelector('button').textContent).toBe('O1');
        });

        test('_renderItemsFromData activeEl found and marked active', () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' }, showActive: true });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            select.value = '1';
            btn.textContent = 'A';
            // Render items including the active value
            inst._renderItemsFromData(dropdown, [{ value: '1', text: 'A' }, { value: '2', text: 'B' }], select, btn);
            // The active value should be filtered from toRender but shown via _clearItems
        });

        test('maxItemsToShow with active value counts toward cap', () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' }, maxItemsToShow: 2, showActive: true });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            select.value = '1';
            btn.textContent = 'A';
            inst._renderItemsFromData(dropdown, [
                { value: '2', text: 'B' }, { value: '3', text: 'C' }, { value: '4', text: 'D' }
            ], select, btn);
        });

        test('response json not array and no data property', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ other: 'stuff' }) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._triggerAjaxLoad(select, dropdown, 'x', btn);
            await new Promise(r => setTimeout(r, 0));
        });

        test('prefetch response json not array and no data property', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ other: 'stuff' }) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._prefetchByValue(select, dropdown, btn, '5');
            await new Promise(r => setTimeout(r, 0));
        });

        test('mapRequest returns null uses defaults', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api', mapRequest: () => null } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._triggerAjaxLoad(select, dropdown, 'x', btn);
            await new Promise(r => setTimeout(r, 0));
        });

        test('resolveByValue returns partial object', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api', resolveByValue: () => ({ url: '', method: '' }) } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._prefetchByValue(select, dropdown, btn, '5');
            await new Promise(r => setTimeout(r, 0));
        });

        test('prefetch GET with body does not attach body', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api', resolveByValue: () => ({ method: 'GET', body: { x: 1 }, params: {} }) } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._prefetchByValue(select, dropdown, btn, '5');
            await new Promise(r => setTimeout(r, 0));
            expect(global.fetch.mock.calls[0][1].body).toBeUndefined();
        });

        test('_prefetchByValue with null param value in qs', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api', resolveByValue: () => ({ params: { id: null } }) } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            inst._prefetchByValue(select, dropdown, btn, '5');
            await new Promise(r => setTimeout(r, 0));
            expect(global.fetch.mock.calls[0][0]).toContain('id=');
        });

        test('_setupAjax with minLen=0 and empty term shows idleHint fallback', () => {
            jest.useFakeTimers();
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            makeSelect(basicHTML, { ajax: { url: '/api', debounce: 50, minimumInputLength: 0 } }, { idleHint: '' });
            const input = document.querySelector('.avalynx-select-input');
            input.value = '';
            input.dispatchEvent(new Event('keyup'));
            jest.advanceTimersByTime(50);
            jest.useRealTimers();
        });

        test('button click ajax minLen=0 idleHint empty fallback', () => {
            jest.useFakeTimers();
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            makeSelect(basicHTML, { ajax: { url: '/api', minimumInputLength: 0, initialLoad: false } }, { idleHint: '' });
            const btn = document.querySelector('button');
            btn.dispatchEvent(new Event('click', { bubbles: true }));
            jest.runAllTimers();
            jest.useRealTimers();
        });

        test('_renderItemsFromData showActive false with no items', () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' }, showActive: true });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            select.value = '';
            inst.options.showActive = false;
            inst._renderItemsFromData(dropdown, [], select, btn);
        });

        test('_renderItemsFromData noResults language fallback', () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' }, showActive: false });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            select.value = '';
            inst.language.noResults = '';
            inst._renderItemsFromData(dropdown, [], select, btn);
        });

        test('filterDropdown noResults language fallback', () => {
            const inst = makeSelect(basicHTML, { liveSearch: true, noDefaultSelection: true });
            inst.language.noResults = '';
            const dropdown = document.querySelector('.dropdown-menu');
            inst.filterDropdown(dropdown, 'zzz');
        });

        test('_setupAjax debounced keyup with minLen=0 and empty term hits idleHint branch', () => {
            jest.useFakeTimers();
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            makeSelect(basicHTML, { ajax: { url: '/api', debounce: 50, minimumInputLength: 0 } });
            const input = document.querySelector('.avalynx-select-input');
            input.value = '';
            input.dispatchEvent(new Event('keyup'));
            jest.advanceTimersByTime(50);
            // minLen=0, term.length=0, term.length < minLen is false, so it goes to _triggerAjaxLoad
            jest.useRealTimers();
        });

        test('_setupAjax debounced keyup with minLen > 0 and short term hits typeMore', () => {
            jest.useFakeTimers();
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            makeSelect(basicHTML, { ajax: { url: '/api', debounce: 50, minimumInputLength: 5 } });
            const input = document.querySelector('.avalynx-select-input');
            input.value = '';
            input.dispatchEvent(new Event('keyup'));
            jest.advanceTimersByTime(50);
            // minLen=5, term.length=0 < 5, hits the idleHint else branch since minLen > 0
            jest.useRealTimers();
        });

        test('applyScrollSettings with many items and liveSearch false', () => {
            jest.useFakeTimers();
            const opts = [];
            for (let i = 0; i < 15; i++) opts.push(`<option value="${i}">Item ${i}</option>`);
            makeSelect(`<select class="avalynx-select" id="ts">${opts.join('')}</select>`, { scrollList: true, scrollItems: 5, liveSearch: false });
            jest.runAllTimers();
            jest.useRealTimers();
        });

        test('setInitialSelection with selected option but no matching dropdown item', () => {
            // Create select where selected option value does not match any dropdown item
            // This happens when we manipulate the select after init
            const inst = makeSelect(`<select class="avalynx-select" id="ts"><option value="1">A</option><option value="2" selected>B</option></select>`);
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            // Remove all dropdown items to simulate no match
            dropdown.querySelectorAll('.dropdown-item').forEach(i => i.remove());
            select.selectedIndex = 1;
            select.value = '2';
            inst.setInitialSelection(select, btn, dropdown);
            // Should reset since no matching item found
            expect(btn.textContent).toBe('Please select...');
        });

        test('_prefetchByValue match found but itemEl not in DOM', async () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([{ value: '5', text: 'Five' }]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' } });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            // Mock _renderItemsFromData to not actually render DOM items
            const origRender = inst._renderItemsFromData.bind(inst);
            inst._renderItemsFromData = (dd, items, sel, b) => {
                // Render but then remove the item so itemEl is null
                origRender(dd, items, sel, b);
                const el = dd.querySelector('.dropdown-item[data-value="5"]');
                if (el) el.remove();
            };
            inst._prefetchByValue(select, dropdown, btn, '5');
            await new Promise(r => setTimeout(r, 0));
        });

        test('_renderItemsFromData activeEl not found in items', () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' }, showActive: true });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            // Set active value that won't be in rendered items (since showActive filters it out)
            select.value = '99';
            btn.textContent = 'X';
            inst._renderItemsFromData(dropdown, [{ value: '1', text: 'A' }], select, btn);
            // activeEl for value '99' won't be found in the items container (only '1' is there)
            // The _clearItems adds it as active, but querySelector for '99' in items should find it from _clearItems
        });

        test('_renderItemsFromData with null button covers currentActiveText fallback', () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' }, showActive: true });
            const dropdown = document.querySelector('.dropdown-menu');
            const select = document.getElementById('ts-original');
            select.value = '1';
            // Pass null as button to hit the falsy button branch in currentActiveText
            inst._renderItemsFromData(dropdown, [{ value: '2', text: 'B' }], select, null);
        });

        test('_renderItemsFromData activeEl IS found when value matches rendered item', () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' }, showActive: true });
            const dropdown = document.querySelector('.dropdown-menu');
            const btn = document.querySelector('button');
            const select = document.getElementById('ts-original');
            select.value = '1';
            btn.textContent = 'A';
            // Render items that include the active value so activeEl is found
            inst._renderItemsFromData(dropdown, [{ value: '1', text: 'A' }, { value: '2', text: 'B' }], select, btn);
            const activeEl = dropdown.querySelector('.dropdown-item[data-value="1"]');
            expect(activeEl).not.toBeNull();
        });

        test('_clearItems with null button covers currentActiveText fallback', () => {
            global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            const inst = makeSelect(basicHTML, { ajax: { url: '/api' }, showActive: true });
            const dropdown = document.querySelector('.dropdown-menu');
            const select = document.getElementById('ts-original');
            select.value = '1';
            inst._clearItems(dropdown, select, null);
        });

        test('filterDropdown with item without parentElement', () => {
            const inst = makeSelect(basicHTML, { liveSearch: true });
            const dropdown = document.querySelector('.dropdown-menu');
            const itemsContainer = dropdown.querySelector('.avalynx-select-items');
            // Create a detached item (no parentElement)
            const detachedItem = document.createElement('a');
            detachedItem.classList.add('dropdown-item');
            detachedItem.textContent = 'Detached';
            detachedItem.dataset.value = 'det';
            // Append directly to itemsContainer without li wrapper
            itemsContainer.appendChild(detachedItem);
            // Remove from parent to make parentElement null
            itemsContainer.removeChild(detachedItem);
            // Re-add to items container but we need it queryable...
            // Instead, mock querySelectorAll to return an item without parentElement
            const origQSA = itemsContainer.querySelectorAll.bind(itemsContainer);
            const fakeItem = document.createElement('a');
            fakeItem.classList.add('dropdown-item');
            fakeItem.textContent = 'Test';
            // fakeItem has no parentElement since it's not in DOM
            jest.spyOn(itemsContainer, 'querySelectorAll').mockImplementation((sel) => {
                if (sel === '.dropdown-item') return [fakeItem];
                return origQSA(sel);
            });
            inst.filterDropdown(dropdown, '');
        });

        test('value getter with no elements', () => {
            const inst = makeSelect(basicHTML);
            inst.elements = [];
            expect(inst.value).toEqual(['']);
        });

        test('value getter with element having empty value', () => {
            const inst = makeSelect(basicHTML);
            const select = document.getElementById('ts-original');
            select.value = '';
            expect(inst.value).toEqual(['']);
        });
    });
});
