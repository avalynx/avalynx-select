import { AvalynxSelect } from '../dist/js/avalynx-select.esm.js';

describe('AvalynxSelect', () => {
    let select;
    let avalynxSelect;

    beforeEach(() => {
        select = document.createElement('select');
        select.id = 'test-select';
        select.classList.add('form-select');
        document.body.appendChild(select);

        avalynxSelect = new AvalynxSelect('#test-select');
    });

    afterEach(() => {
        document.body.removeChild(select);
    });

    test('should be created correctly', () => {
        expect(avalynxSelect).toBeInstanceOf(AvalynxSelect);
    });

    test('init should create required elements', () => {
        avalynxSelect.init(select);
        const button = document.querySelector(`#${select.id}`);
        const dropdown = document.querySelector('ul.avalynx-select');
        expect(button).not.toBeNull();
        expect(dropdown).not.toBeNull();
    });

    test('filterDropdown should filter dropdown items correctly', () => {
        select.options.add(new Option('Test 1', 'test1'));
        select.options.add(new Option('Test 2', 'test2'));
        select.options.add(new Option('Test 3', 'test3'));
        avalynxSelect.init(select);
        const dropdown = document.querySelector('ul.avalynx-select');
        const searchInput = dropdown.querySelector('.avalynx-select-input');
        searchInput.value = 'test2';
        avalynxSelect.filterDropdown(dropdown, searchInput.value);
        const visibleItems = dropdown.querySelectorAll('.dropdown-item:not(.d-none)');
        expect(visibleItems.length).toBe(1);
        expect(visibleItems[0].textContent).toBe('Test 2');
    });

    test('default selection should be set correctly', () => {
        select.options.add(new Option('Test 1', 'test1'));
        select.options.add(new Option('Test 2', 'test2'));
        select.options.add(new Option('Test 3', 'test3'));
        select.options[1].selected = true;
        avalynxSelect.init(select);
        const button = document.querySelector(`#${select.id}`);
        expect(button.textContent).toBe('Test 2');
        expect(avalynxSelect.value).toEqual(['test2']);
    });

    test('reset should reset selection correctly', () => {
        select.options.add(new Option('Test 1', 'test1'));
        select.options.add(new Option('Test 2', 'test2'));
        select.options.add(new Option('Test 3', 'test3'));
        avalynxSelect.init(select);
        const button = document.querySelector(`#${select.id}`);
        const dropdown = document.querySelector('ul.avalynx-select');
        avalynxSelect.reset(button, dropdown, select);
        expect(button.textContent).toBe(avalynxSelect.language.selectPlaceholder);
        expect(select.value).toBe('');
    });

    test('value getter and setter should work correctly', () => {
        select.options.add(new Option('Test 1', 'test1'));
        select.options.add(new Option('Test 2', 'test2'));
        select.options.add(new Option('Test 3', 'test3'));
        avalynxSelect.init(select);
        avalynxSelect.value = ['test2'];
        const button = document.querySelector(`#${select.id}`);
        expect(avalynxSelect.value).toEqual(['test2']);
        expect(button.textContent).toBe('Test 2');
    });
});
