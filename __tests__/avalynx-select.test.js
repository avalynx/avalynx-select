import { AvalynxSelect } from '../src/js/avalynx-select.esm.js';

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
        const button = document.querySelector('button');
        const dropdown = document.querySelector('ul');
        expect(button).not.toBeNull();
        expect(dropdown).not.toBeNull();
    });

    test('filterDropdown should filter dropdown items correctly', () => {
        avalynxSelect.init(select);
        const dropdown = document.querySelector('ul');
        const searchInput = dropdown.querySelector('.avalynx-select-input');
        searchInput.value = 'test2';
        avalynxSelect.filterDropdown(dropdown, searchInput.value);
        const items = dropdown.querySelectorAll('.dropdown-item');
        expect(items).not.toBeNull();
    });

    test('default selection should be set correctly', () => {
        select.options.add(new Option('Test 1', 'test1'));
        select.options.add(new Option('Test 2', 'test2'));
        select.options.add(new Option('Test 3', 'test3'));
        select.options[1].selected = true;
        avalynxSelect.init(select);
        const button = document.querySelector('button');
        const dropdown = document.querySelector('ul');
        const newValue = 'test2';
        expect(avalynxSelect.value).toEqual([newValue]);
    });

    test('reset should reset selection correctly', () => {
        avalynxSelect.init(select);
        const button = document.querySelector('button');
        const dropdown = document.querySelector('ul');
        avalynxSelect.reset(button, dropdown, select);
        expect(button.textContent).toBe(avalynxSelect.language.selectPlaceholder);
        expect(select.value).toBe('');
    });

    test('value getter and setter should work correctly', () => {
        select.options.add(new Option('Test 1', 'test1'));
        select.options.add(new Option('Test 2', 'test2'));
        select.options.add(new Option('Test 3', 'test3'));
        avalynxSelect.init(select);
        const newValue = 'test2';
        avalynxSelect.value = [newValue];
        expect(avalynxSelect.value).toEqual([newValue]);
    });
});
