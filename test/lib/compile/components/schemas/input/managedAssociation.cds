namespace com.sap.test;

@AsyncAPI.Title        : 'My Events'
@AsyncAPI.SchemaVersion: '1.0.0'
service MyService {
  entity Assoc {
    key id   : UUID;
        name : String(256);
  };

  event Created : {
    assoc : Association to one Assoc;
  };
}
