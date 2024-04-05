[![REUSE status](https://api.reuse.software/badge/github.com/cap-js/asyncapi)](https://api.reuse.software/info/github.com/cap-js/asyncapi)

# AsyncAPI Plugin

The `@cap-js/asyncapi` package is a [CDS plugin](https://cap.cloud.sap/docs/node.js/cds-plugins#cds-plugin-packages) that provides support for AsyncAPI document compilation.

### Table of Contents

- [Setup](#setup)
- [Generate AsyncAPI document](#generate-asyncapi-document)
- [Contributing](#contributing)
- [Code of Conduct](#code-of-conduct)
- [Licensing](#licensing)

## Setup

To use `cds compile --to asyncapi` functionality, simply add this self-configuring plugin package to your project:

```sh
 npm add @cap-js/asyncapi
```

In this guide, we use the [Incidents Management reference sample app](https://github.com/cap-js/incidents-app) as the base, to generate the AsyncAPI document for the `services.cds` file.

## Generate AsyncAPI document

### 1. Usage of programatic API

To invoke `cds compile --to asyncapi` programatically

```sh
await cds.compile(<filename>).to.asyncapi() 
```

For more information, visit [capire](https://cap.cloud.sap/docs/node.js/cds-compile#to-asyncapi)


### 2. Usage from CLI 

Run the following command in the CLI to generate the AsyncAPI document.

```sh
cds compile <filename> --to asyncapi
```


For more information, visit [capire](https://cap.cloud.sap/docs/advanced/publishing-apis/asyncapi#cli)

## Contributing

This project is open to feature requests/suggestions, bug reports etc. via [GitHub issues](https://github.com/cap-js/asyncapi/issues). Contribution and feedback are encouraged and always welcome. For more information about how to contribute, the project structure, as well as additional contribution information, see our [Contribution Guidelines](CONTRIBUTING.md).

## Code of Conduct

We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone. By participating in this project, you agree to abide by its [Code of Conduct](CODE_OF_CONDUCT.md) at all times.

## Licensing

Copyright 2024 SAP SE or an SAP affiliate company and contributors. Please see our [LICENSE](LICENSE) for copyright and license information. Detailed information including third-party components and their licensing/copyright information is available [via the REUSE tool](https://api.reuse.software/info/github.com/cap-js/asyncapi).
