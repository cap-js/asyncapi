namespace com.sap.test;

entity OfOneEntity {
  key id: String;
}

aspect OfOneAspect {
  keyless: String;
}

entity Root {
  key id: String;

  managedOfOneEntity: Composition of one OfOneEntity;
  managedOfOneAspect: Composition of one OfOneAspect;
};

@AsyncAPI.Title        : 'My Events'
@AsyncAPI.SchemaVersion: '1.0.0'
service MyService {
  event Created : projection on Root;
}
