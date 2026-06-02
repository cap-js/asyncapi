namespace com.sap.test;

type EnumType: String(10) enum { one = 'ValueOne'; two = 'ValueTwo'; };

@AsyncAPI.Title        : 'My Events'
@AsyncAPI.SchemaVersion: '1.0.0'
service MyService {
  event Created : {
    name: String(10) enum { one; two };
    typed: EnumType;
  };
}
