/**
 * AvalynxSelect Jest Tests
 * Comprehensive test suite for all important functionality
 */

// Mock bootstrap dropdown
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
        // Setup DOM
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        // Cleanup
        document.body.removeChild(container);
        document.body.innerHTML = '';
    });

    describe('Initialization', () => {
        test('should initialize with default selector', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                    <option value="1">Option 1</option>
                    <option value="2">Option 2</option>
                </select>
            `;

            const instance = new AvalynxSelect('.avalynx-select');
            expect(instance.initialized).toBe(true);
        });

        test('should initialize with custom selector', () => {
            container.innerHTML = `
                <select id="custom-select">
                    <option value="1">Option 1</option>
                </select>
            `;

            const instance = new AvalynxSelect('#custom-select');
            expect(instance.initialized).toBe(true);
        });

        test('should handle selector without prefix', () => {
            container.innerHTML = `
                <select class="my-select" id="test-select">
                    <option value="1">Option 1</option>
                </select>
            `;

            const instance = new AvalynxSelect('my-select');
            expect(instance.initialized).toBe(true);
        });

        test('should log error for non-existent selector', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            new AvalynxSelect('#nonexistent');

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining("Element(s) with selector '#nonexistent' not found")
            );
            consoleSpy.mockRestore();
        });

        test('should call onLoaded callback after initialization', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                    <option value="1">Option 1</option>
                </select>
            `;

            const onLoadedMock = jest.fn();
            new AvalynxSelect('.avalynx-select', { onLoaded: onLoadedMock });

            expect(onLoadedMock).toHaveBeenCalled();
        });
    });

    describe('Configuration Options', () => {
        test('should apply custom className to button', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                    <option value="1">Option 1</option>
                </select>
            `;

            new AvalynxSelect('.avalynx-select', { className: 'btn-custom test-class' });

            const button = document.querySelector('button');
            expect(button.classList.contains('btn-custom')).toBe(true);
            expect(button.classList.contains('test-class')).toBe(true);
        });

        test('should enable live search when liveSearch is true', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                    <option value="1">Option 1</option>
                </select>
            `;

            new AvalynxSelect('.avalynx-select', { liveSearch: true });

            const searchInput = document.querySelector('.avalynx-select-input');
            const liveSearchElement = document.querySelector('.avalynx-select-livesearch');

            expect(searchInput).not.toBeNull();
            expect(liveSearchElement.style.display).not.toBe('none');
        });

        test('should hide live search when liveSearch is false', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                    <option value="1">Option 1</option>
                </select>
            `;

            new AvalynxSelect('.avalynx-select', { liveSearch: false });

            const liveSearchElement = document.querySelector('.avalynx-select-livesearch');
            expect(liveSearchElement.style.display).toBe('none');
        });

        test('should not select default when noDefaultSelection is true', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                    <option value="" selected>Please select</option>
                    <option value="1">Option 1</option>
                </select>
            `;

            new AvalynxSelect('.avalynx-select', { noDefaultSelection: true });

            const button = document.querySelector('button');
            expect(button.textContent).toBe('Please select...');
            expect(button.classList.contains('text-muted')).toBe(true);
        });

        test('should use custom language placeholders', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                    <option value="1">Option 1</option>
                </select>
            `;

            new AvalynxSelect('.avalynx-select',
                { noDefaultSelection: true },
                { selectPlaceholder: 'Bitte wählen...', searchPlaceholder: 'Suchen...' }
            );

            const button = document.querySelector('button');
            const searchInput = document.querySelector('.avalynx-select-input');

            expect(button.textContent).toBe('Bitte wählen...');
            expect(searchInput.placeholder).toBe('Suchen...');
        });
    });

    describe('Default Value Handling', () => {
        test('should set default value from options.defaultValue', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                    <option value="">Please select</option>
                    <option value="1">Option 1</option>
                    <option value="2">Option 2</option>
                </select>
            `;

            new AvalynxSelect('.avalynx-select', { defaultValue: '2' });

            const button = document.querySelector('button');
            const originalSelect = document.getElementById('test-select-original');

            expect(button.textContent).toBe('Option 2');
            expect(originalSelect.value).toBe('2');
        });

        test('should set default value from data-default-value attribute', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select" data-default-value="1">
                    <option value="">Please select</option>
                    <option value="1">Option 1</option>
                    <option value="2">Option 2</option>
                </select>
            `;

            new AvalynxSelect('.avalynx-select');

            const button = document.querySelector('button');
            expect(button.textContent).toBe('Option 1');
        });

        test('should prioritize options.defaultValue over data-default-value', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select" data-default-value="1">
                    <option value="">Please select</option>
                    <option value="1">Option 1</option>
                    <option value="2">Option 2</option>
                </select>
            `;

            new AvalynxSelect('.avalynx-select', { defaultValue: '2' });

            const button = document.querySelector('button');
            expect(button.textContent).toBe('Option 2');
        });

        test('should honor native selected option', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                    <option value="">Please select</option>
                    <option value="1">Option 1</option>
                    <option value="2" selected>Option 2</option>
                </select>
            `;

            new AvalynxSelect('.avalynx-select');

            const button = document.querySelector('button');
            expect(button.textContent).toBe('Option 2');
        });
    });

    describe('Disabled State', () => {
        test('should handle native disabled attribute', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select" disabled>
                    <option value="1">Option 1</option>
                </select>
            `;

            new AvalynxSelect('.avalynx-select');

            const button = document.querySelector('button');
            expect(button.hasAttribute('disabled')).toBe(true);
            expect(button.getAttribute('aria-disabled')).toBe('true');
            expect(button.classList.contains('disabled')).toBe(true);
        });

        test('should handle disabled option', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                    <option value="1">Option 1</option>
                </select>
            `;

            new AvalynxSelect('.avalynx-select', { disabled: true });

            const button = document.querySelector('button');
            expect(button.hasAttribute('disabled')).toBe(true);
        });

        test('should prevent selection when disabled', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select" disabled>
                    <option value="1">Option 1</option>
                    <option value="2">Option 2</option>
                </select>
            `;

            new AvalynxSelect('.avalynx-select');

            const button = document.querySelector('button');
            const item = document.querySelector('.dropdown-item');
            const event = new Event('click', { bubbles: true });

            const originalValue = document.getElementById('test-select-original').value;
            item.click();

            // Value should not change when disabled
            expect(document.getElementById('test-select-original').value).toBe(originalValue);
        });
    });

    describe('Live Search Functionality', () => {
        test('should filter items based on search term (case insensitive)', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                    <option value="1">Apple</option>
                    <option value="2">Banana</option>
                    <option value="3">Cherry</option>
                </select>
            `;

            new AvalynxSelect('.avalynx-select', { liveSearch: true, noDefaultSelection: true });

            const items = document.querySelectorAll('.dropdown-item');

            // Initially all items should be visible
            expect(items[0].classList.contains('d-none')).toBe(false);
            expect(items[1].classList.contains('d-none')).toBe(false);
            expect(items[2].classList.contains('d-none')).toBe(false);

            // Now filter
            const searchInput = document.querySelector('.avalynx-select-input');
            searchInput.value = 'ban';
            searchInput.dispatchEvent(new Event('keyup'));

            // After filtering, only Banana should be visible
            expect(items[0].classList.contains('d-none')).toBe(true); // Apple
            expect(items[1].classList.contains('d-none')).toBe(false); // Banana
            expect(items[2].classList.contains('d-none')).toBe(true); // Cherry
        });

        test('should filter items case sensitive when caseSensitive is true', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                    <option value="1">Apple</option>
                    <option value="2">apple</option>
                </select>
            `;

            new AvalynxSelect('.avalynx-select', { liveSearch: true, caseSensitive: true });

            const searchInput = document.querySelector('.avalynx-select-input');
            searchInput.value = 'Apple';
            searchInput.dispatchEvent(new Event('keyup'));

            const items = document.querySelectorAll('.dropdown-item');
            expect(items[0].classList.contains('d-none')).toBe(false); // Apple
            expect(items[1].classList.contains('d-none')).toBe(true); // apple
        });

        test('should show all items when search is empty and showAll is true', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                    <option value="1">Apple</option>
                    <option value="2">Banana</option>
                </select>
            `;

            new AvalynxSelect('.avalynx-select', { liveSearch: true, showAll: true });

            const searchInput = document.querySelector('.avalynx-select-input');
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('keyup'));

            const items = document.querySelectorAll('.dropdown-item');
            items.forEach(item => {
                expect(item.classList.contains('d-none')).toBe(false);
            });
        });

        test('should keep active item visible when showActive is true', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                    <option value="1">Apple</option>
                    <option value="2">Banana</option>
                </select>
            `;

            new AvalynxSelect('.avalynx-select', { liveSearch: true, showActive: true });

            const items = document.querySelectorAll('.dropdown-item');
            items[0].classList.add('active');

            const searchInput = document.querySelector('.avalynx-select-input');
            searchInput.value = 'ban';
            searchInput.dispatchEvent(new Event('keyup'));

            // Active item should still be visible even though it doesn't match
            expect(items[0].classList.contains('d-none')).toBe(false); // Apple (active)
            expect(items[1].classList.contains('d-none')).toBe(false); // Banana (matches)
        });
    });

    describe('Item Selection', () => {
        test('should select item and update button text', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                    <option value="">Please select</option>
                    <option value="1">Option 1</option>
                    <option value="2">Option 2</option>
                </select>
            `;

            new AvalynxSelect('.avalynx-select', { noDefaultSelection: true });

            const button = document.querySelector('button');
            const item = document.querySelectorAll('.dropdown-item')[1];

            item.click();

            expect(button.textContent).toBe('Option 1');
            expect(item.classList.contains('active')).toBe(true);
        });

        test('should update original select value on selection', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                    <option value="">Please select</option>
                    <option value="1">Option 1</option>
                </select>
            `;

            new AvalynxSelect('.avalynx-select', { noDefaultSelection: true });

            const item = document.querySelectorAll('.dropdown-item')[1];
            const originalSelect = document.getElementById('test-select-original');

            item.click();

            expect(originalSelect.value).toBe('1');
        });

        test('should call onChange callback when item is selected', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                    <option value="">Please select</option>
                    <option value="1">Option 1</option>
                </select>
            `;

            const onChangeMock = jest.fn();
            new AvalynxSelect('.avalynx-select', {
                noDefaultSelection: true,
                onChange: onChangeMock
            });

            const item = document.querySelectorAll('.dropdown-item')[1];
            item.click();

            expect(onChangeMock).toHaveBeenCalledWith('1');
        });

        test('should not call onChange during initialization', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                    <option value="1">Option 1</option>
                    <option value="2" selected>Option 2</option>
                </select>
            `;

            const onChangeMock = jest.fn();
            new AvalynxSelect('.avalynx-select', { onChange: onChangeMock });

            // onChange should not be called during initialization
            expect(onChangeMock).not.toHaveBeenCalled();
        });

        test('should reset selection when clicking active item', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                    <option value="">Please select</option>
                    <option value="1">Option 1</option>
                </select>
            `;

            new AvalynxSelect('.avalynx-select');

            const button = document.querySelector('button');
            const item = document.querySelectorAll('.dropdown-item')[1];

            // First click - select
            item.click();
            expect(button.textContent).toBe('Option 1');

            // Second click - deselect
            item.click();
            expect(button.textContent).toBe('Please select...');
            expect(button.classList.contains('text-muted')).toBe(true);
        });

        test('should clear search input after selection', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                    <option value="1">Option 1</option>
                </select>
            `;

            new AvalynxSelect('.avalynx-select', { liveSearch: true });

            const searchInput = document.querySelector('.avalynx-select-input');
            searchInput.value = 'test';

            const item = document.querySelector('.dropdown-item');
            item.click();

            expect(searchInput.value).toBe('');
        });
    });

    describe('Public API Methods', () => {
        test('disable() should disable all select elements', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                    <option value="1">Option 1</option>
                </select>
            `;

            const instance = new AvalynxSelect('.avalynx-select');

            instance.disable();

            const button = document.querySelector('button');
            const originalSelect = document.getElementById('test-select-original');

            expect(button.hasAttribute('disabled')).toBe(true);
            expect(originalSelect.disabled).toBe(true);
        });

        test('enable() should enable all select elements', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select" disabled>
                    <option value="1">Option 1</option>
                </select>
            `;

            const instance = new AvalynxSelect('.avalynx-select');

            instance.enable();

            const button = document.querySelector('button');
            const originalSelect = document.getElementById('test-select-original');

            expect(button.hasAttribute('disabled')).toBe(false);
            expect(originalSelect.disabled).toBe(false);
        });

        test('value getter should return current value', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                    <option value="1">Option 1</option>
                    <option value="2" selected>Option 2</option>
                </select>
            `;

            const instance = new AvalynxSelect('.avalynx-select');

            expect(instance.value).toEqual(['2']);
        });

        test('value setter should update selection', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                    <option value="">Please select</option>
                    <option value="1">Option 1</option>
                    <option value="2">Option 2</option>
                </select>
            `;

            const instance = new AvalynxSelect('.avalynx-select', { noDefaultSelection: true });

            instance.value = ['2'];

            const button = document.querySelector('button');
            const originalSelect = document.getElementById('test-select-original');

            expect(button.textContent).toBe('Option 2');
            expect(originalSelect.value).toBe('2');
        });

        test('value setter with empty string should reset selection', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                    <option value="">Please select</option>
                    <option value="1">Option 1</option>
                </select>
            `;

            const instance = new AvalynxSelect('.avalynx-select');

            instance.value = [''];

            const button = document.querySelector('button');
            expect(button.textContent).toBe('Please select...');
        });
    });

    describe('DOM Manipulation', () => {
        test('should create button element', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                    <option value="1">Option 1</option>
                </select>
            `;

            new AvalynxSelect('.avalynx-select');

            const button = document.querySelector('button');
            expect(button).not.toBeNull();
            expect(button.classList.contains('form-select')).toBe(true);
        });

        test('should create dropdown menu', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                    <option value="1">Option 1</option>
                    <option value="2">Option 2</option>
                </select>
            `;

            new AvalynxSelect('.avalynx-select');

            const dropdown = document.querySelector('.dropdown-menu');
            expect(dropdown).not.toBeNull();

            const items = dropdown.querySelectorAll('.dropdown-item');
            expect(items.length).toBe(2);
        });

        test('should hide original select element', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                    <option value="1">Option 1</option>
                </select>
            `;

            new AvalynxSelect('.avalynx-select');

            const originalSelect = document.getElementById('test-select-original');
            expect(originalSelect.style.display).toBe('none');
        });

        test('should rename original select id', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                    <option value="1">Option 1</option>
                </select>
            `;

            new AvalynxSelect('.avalynx-select');

            const originalSelect = document.getElementById('test-select-original');
            const button = document.getElementById('test-select');

            expect(originalSelect).not.toBeNull();
            expect(button).not.toBeNull();
            expect(button.tagName).toBe('BUTTON');
        });

        test('should create template in document body', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                    <option value="1">Option 1</option>
                </select>
            `;

            new AvalynxSelect('.avalynx-select');

            const template = document.getElementById('avalynx-select-template');
            expect(template).not.toBeNull();
        });
    });

    describe('Multiple Selects', () => {
        test('should initialize multiple select elements', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select1">
                    <option value="1">Option 1</option>
                </select>
                <select class="avalynx-select" id="test-select2">
                    <option value="2">Option 2</option>
                </select>
            `;

            const instance = new AvalynxSelect('.avalynx-select');

            expect(instance.elements.length).toBe(2);
            expect(document.querySelectorAll('button').length).toBe(2);
        });
    });

    describe('Edge Cases', () => {
        test('should handle empty select', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                </select>
            `;

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            new AvalynxSelect('.avalynx-select');

            // Should not throw error, just not initialize
            consoleSpy.mockRestore();
        });

        test('should handle select with only empty option', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                    <option value="">Please select</option>
                </select>
            `;

            new AvalynxSelect('.avalynx-select');

            const button = document.querySelector('button');
            expect(button.textContent).toBe('Please select...');
        });

        test('should handle options with same values', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                    <option value="1">Option A</option>
                    <option value="1">Option B</option>
                </select>
            `;

            new AvalynxSelect('.avalynx-select', { defaultValue: '1' });

            const button = document.querySelector('button');
            // Should select the first matching option
            expect(button.textContent).toBe('Option A');
        });

        test('should handle special characters in option text', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                    <option value="1">Option & Special < > " '</option>
                </select>
            `;

            new AvalynxSelect('.avalynx-select');

            const item = document.querySelector('.dropdown-item');
            expect(item.textContent).toContain('Option & Special');
        });

        test('should handle invalid defaultValue gracefully', () => {
            container.innerHTML = `
                <select class="avalynx-select" id="test-select">
                    <option value="">Please select</option>
                    <option value="1">Option 1</option>
                </select>
            `;

            new AvalynxSelect('.avalynx-select', { defaultValue: 'nonexistent' });

            const button = document.querySelector('button');
            // Should reset to placeholder when default value not found
            expect(button.textContent).toBe('Please select...');
        });
    });
});
