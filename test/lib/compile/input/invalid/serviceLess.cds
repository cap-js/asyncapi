namespace com.sap.serviceless;

@title: 'SampleEntity'
entity SampleEntity {
  key id: UUID;
  boolean: Boolean;
  integerBig: Integer64;
};

event Created : projection on SampleEntity;
