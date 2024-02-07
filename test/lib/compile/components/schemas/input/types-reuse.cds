namespace com.sap.test;

type StringType: String(50);

type ReferencedStructuredType {
  string: StringType;
};

type StructuredType {
  string: String;
  referencedString: ReferencedStructuredType:string;
  reuseString: StringType;
  anonymous: {
    anonymousString: String;
    anonymousReuseString: StringType;
  }
}

entity ReusedEntity {
  key id: String;

  referencedString: StructuredType:string;
  referencedStringTwo: StructuredType:string;
  deepReferencedString: StructuredType:referencedString;
  referencedAnonymousString: StructuredType:anonymous.anonymousReuseString;
  structured: StructuredType;
};

@AsyncAPI.Title        : 'My Events'
@AsyncAPI.SchemaVersion: '1.0.0'
service MyService {
  event Created : projection on ReusedEntity;
}
