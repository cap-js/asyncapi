# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).
The format is based on [Keep a Changelog](http://keepachangelog.com/).

## [Unreleased]

### Added
- `cds-plugin.js` integrates with `@sap/cds-dk` to provide `cds compile -2 asyncapi` and `cds import --asyncapi` when the package is declared as a project dependency.

### Changed
### Deprecated
### Removed
### Fixed
- Optional CDS elements (no `key`, `not null`, `@mandatory`, or `@Common.FieldControl: #Mandatory`) are now exported as nullable JSON Schema types (e.g. `"type": ["string", "null"]`). Elements declared `not null` are also added to the `required` array.
- `@topic` is now used as a fallback for the AsyncAPI channel name and CloudEvents event type when no explicit `@AsyncAPI.EventType` or `@AsyncAPI.ChannelName` is present, eliminating the need to duplicate the topic value in a second annotation.
- Import now accepts message names without a multi-segment lowercase namespace (e.g. `CatalogService.SomeEvent`), enabling roundtrip import of documents produced from models that have no `namespace` declaration. The exporter now writes `x-service-name` on each message so the importer can resolve the service key directly instead of relying on name parsing.

## [1.1.0] - 2026-06-02

### Added

- Support for `@AsyncAPI.ChannelName` annotation to allow custom channel names independent of message/schema references (enables channel names with special characters like slashes)
- Support for `@Core.Description` annotation as an alternative to `@description`
- Automatic resolution of i18n markers (e.g., `{i18n>KEY}`)

### Changed

- Event descriptions now only appear in `components.messages.<event>.description` (removed from `components.schemas.<event>.description` to avoid duplication)
- Enum values now take precedence over they respective keys in the output

### Fixed

- Fixed description collision bug where reused types (e.g., multiple properties with the same type but different `@description` annotations) would all end up with the same description from the last processed property. Now each property correctly maintains its individual description.
   
## Version 1.0.3 - 12-03-2025

### Added

- Added defaults for `@AsyncAPI.SchemaVersion` and `@AsyncAPI.Title`.

### Changed

- Replaced `console.warn` statements with `cds.debug` logs for warning messages.

## Version 1.0.2 - 15.07.2024

### Changed

- Changed default namespace from `sap.app` to `customer.<package-name>`
- Changed default namespace regex making it compatible with ORD.

## Version 1.0.1 - 14.05.2024

### Changed

- Removed registering compile target

## Version 1.0.0 - 02.05.2024

### Added

- Initial release
