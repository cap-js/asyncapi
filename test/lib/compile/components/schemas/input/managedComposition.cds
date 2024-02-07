namespace com.sap.test;

aspect OfManyAspect {
  key id: String;
}

entity Root {
  key id: String;

  managedToManyAspect: Composition of many OfManyAspect;
};

@AsyncAPI.Title        : 'My Events'
@AsyncAPI.SchemaVersion: '1.0.0'
service MyService {
  event Created : projection on Root;
}
