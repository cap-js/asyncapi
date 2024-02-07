namespace com.sap.test;

entity OfManyEntity {
  key parent: Association to Root;
}

entity Root {
  key id: String;
  unManagedToManyEntity: Composition of many OfManyEntity on unManagedToManyEntity.parent = $self;
};

@AsyncAPI.Title        : 'My Events'
@AsyncAPI.SchemaVersion: '1.0.0'
service MyService {
  event Created : projection on Root;
}
