# AvalynxSelect

AvalynxSelect is a lightweight, customizable select dropdown component for web applications. It is designed to be used with Bootstrap version 5.3 or higher and does not require any framework dependencies.

## Features

- **Customizable Dropdowns**: Supports various customization options like live search, case sensitivity, scrollable list, and more.
- **Bootstrap Integration**: Designed for seamless integration with Bootstrap >= 5.3.
- **Easy to Use**: Simple API for creating and managing select dropdowns within your web applications.

## Example

Here's a simple example of how to use AvalynxSelect in your project:

* [Overview](https://avalynx-select.jbs-newmedia.de/examples/index.html)
* [Simple select](https://avalynx-select.jbs-newmedia.de/examples/simple-select.html)
* [Simple select with livesearch and different options](https://avalynx-select.jbs-newmedia.de/examples/simple-select-livesearch.html)
* [Simple select with responsive design](https://avalynx-select.jbs-newmedia.de/examples/simple-select-responsive.html)
* [Simple select with event listeners](https://avalynx-select.jbs-newmedia.de/examples/simple-select-disabled.html)
* [Disabled select](https://avalynx-select.jbs-newmedia.de/examples/simple-select-disabled.html)
* [Default value select](https://avalynx-select.jbs-newmedia.de/examples/simple-select-default-value.html)

## Installation

To use AvalynxSelect in your project, you can directly include it in your HTML file. Ensure you have Bootstrap 5.3 or higher included in your project for AvalynxSelect to work correctly.

First, include Bootstrap:

```html
<!-- Bootstrap -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3/dist/js/bootstrap.bundle.min.js"></script>
```

Then, include AvalynxSelect:

```html
<script src="path/to/avalynx-select.js"></script>
```

Replace `path/to/avalynx-select.js` with the actual path to the file in your project.

## Installation via jsDelivr ([Link](https://cdn.jsdelivr.net/npm/avalynx-select/))

AvalynxSelect is also available via [jsDelivr](https://www.jsdelivr.com/). You can include it in your project like this:

```html
<script src="https://cdn.jsdelivr.net/npm/avalynx-select@1.1.0/dist/js/avalynx-select.js"></script>
```

Make sure to also include Bootstrap's JS/CSS in your project to ensure AvalynxSelect displays correctly.

## Installation via NPM ([Link](https://www.npmjs.com/package/avalynx-select))

AvalynxSelect is also available as a npm package. You can add it to your project with the following command:

```bash
npm install avalynx-select
```

After installing, you can import AvalynxSelect into your JavaScript file like this:

```javascript
import { AvalynxSelect } from 'avalynx-select';
```

Make sure to also include Bootstrap's JS/CSS in your project to ensure AvalynxSelect displays correctly.

## Installation via Symfony AssetMapper

```bash
php bin/console importmap:require avalynx-select
```

After installing, you can import AvalynxSelect into your JavaScript file like this:

```javascript
import { AvalynxSelect } from 'avalynx-select';
```

Make sure to also include Bootstrap's JS/CSS in your project to ensure AvalynxSelect displays correctly.

## Installation via Symfony AssetComposer

More information about the Symfony AssetComposer Bundle can be found [here](https://github.com/jbsnewmedia/asset-composer-bundle).

```twig
{% do addAssetComposer('avalynx/avalynx-select/dist/js/avalynx-select.js') %}
```

Make sure to also include Bootstrap's JS/CSS in your project to ensure AvalynxSelect displays correctly.

## Installation via Composer ([Link](https://packagist.org/packages/avalynx/avalynx-select))

AvalynxSelect is also available as a Composer package. You can add it to your project with the following command:

```bash
composer require avalynx/avalynx-select
```

After installing, you can import AvalynxSelect into your HTML file like this:

```html
<script src="vendor/avalynx/avalynx-select/dist/js/avalynx-select.js"></script>
``` 

Make sure to also include Bootstrap's JS/CSS in your project to ensure AvalynxSelect displays correctly.

## Usage

To create a select dropdown, simply instantiate a new `AvalynxSelect` object with the desired options:

```javascript
new AvalynxSelect("#mySelect", {
  liveSearch: true,
  caseSensitive: false,
  showAll: true,
  scrollList: true,
  scrollItems: 8
}, {
  searchPlaceholder: 'Search...',
  selectPlaceholder: 'Please select...'
});
```

## Options

AvalynxSelect allows the following options for customization:

- `selector`: (string) The selector to use for targeting select elements within the DOM (default: `'.avalynx-select'`).
- `options`: An object containing the following keys:
    - `className`: (string) A custom class name for the loader element (default: `''`).
    - `liveSearch`: (boolean) Enable live search functionality (default: `false`).
    - `caseSensitive`: (boolean) Enable case-sensitive search (default: `false`).
    - `showAll`: (boolean) Show all options when search term is empty (default: `true`).
    - `scrollList`: (boolean) Enable scrollable list (default: `true`).
    - `scrollItems`: (number) Number of items to display before scrolling (default: `8`).
    - `noDefaultSelection`: (boolean) Do not select any option by default (default: `false`).
    - `disabled`: (boolean) Initialize the select as disabled (default: `false`).
    - `defaultValue`: (string|null) The default value to select on initialization (default
    - `onChange`: (function) Callback function to be executed when an option is selected (default: `null`).
    - `onLoaded`: (function) Callback function to be executed when the component is loaded (default: `null`).
- `language`: An object containing the following keys:
    - `searchPlaceholder`: (string) Placeholder text for the search input (default: `'Search...'`).
    - `selectPlaceholder`: (string) Placeholder text for the select dropdown (default: `'Please select...'`).

## Planned Features
- Add support for multiple selection
- Add support for grouped options
- Add support for styling options
- Add ajax loading of list items

## Contributing

Contributions are welcome! If you'd like to contribute, please fork the repository and submit a pull request with your changes or improvements. We're looking for contributions in the following areas:

- Bug fixes
- Feature enhancements
- Documentation improvements

Before submitting your pull request, please ensure your changes are well-documented and follow the existing coding style of the project.

## License

AvalynxSelect is open-sourced software licensed under the [MIT license](LICENSE).

## Contact

If you have any questions, feature requests, or issues, please open an issue on our [GitHub repository](https://github.com/avalynx/avalynx-select/issues) or submit a pull request.

Thank you for considering AvalynxSelect for your project!
