namespace com.sap.test;

type Structure: { attribute: String(40); };

type ManyStructure: many Structure;
type ManyAnonymous: many { attribute: String(40); };
type ManyString: many String(40);

@AsyncAPI.Title        : 'My Events'
@AsyncAPI.SchemaVersion: '1.0.0'
service MyService {
  event Created : {
    manyStructure: ManyStructure;
    manyAnonymous: ManyAnonymous;
    manyString: ManyString;
  };  
}
