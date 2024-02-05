namespace com.sap.presets;

@title: 'SampleEntity'
entity SampleEntity {
  key id: UUID;
  boolean: Boolean;
};

@AsyncAPI.Title        : 'Sample Service'
@AsyncAPI.SchemaVersion: '1.0.0'

service S {
    event Created : projection on SampleEntity;
}
