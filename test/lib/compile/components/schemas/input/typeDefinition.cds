namespace com.sap.test;

type DisplayId: String(40);

@AsyncAPI.Title        : 'My Events'
@AsyncAPI.SchemaVersion: '1.0.0'
service MyService {
  event Created : {
    displayId: DisplayId;
  };
}
