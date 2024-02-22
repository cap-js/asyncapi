namespace com.sap.test;

entity WithConstraint {
  key id: String;
  displayId: String(40) @mandatory;
  dummyId: String(10) @Common.FieldControl: #Mandatory;
  nonNullable: String not null;
  nullable: String;
  arrayed: many String;
};

@AsyncAPI.Title        : 'My Events'
@AsyncAPI.SchemaVersion: '1.0.0'
service MyService {
  event Created : projection on WithConstraint;
}
