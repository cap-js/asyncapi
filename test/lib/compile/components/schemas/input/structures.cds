namespace com.sap.test;

type Structure: {foo: String; bar: String;};

@AsyncAPI.Title        : 'My Events'
@AsyncAPI.SchemaVersion: '1.0.0'
service MyService {
  event Created : {
    structure: many Structure;
  };
}
