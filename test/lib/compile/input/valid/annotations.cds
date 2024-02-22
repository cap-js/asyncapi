namespace com.sap.annotations;

@ODM.root: true
entity RootEntity {
  key id      : UUID;
      boolean : Boolean;
};

@ODM.entityNameInvalid: 'InvalidAnnEntity'
@ODM.oidInvalid       : 'id'
entity InvalidAnnEntity {
  key id      : UUID;
      boolean : Boolean;
};

@ODM.entityName: 'UnmatchedOidEntity'
@ODM.oid       : 'unmatched'
entity UnmatchedOidEntity {
  key id      : UUID;
      boolean : Boolean;
};

@AsyncAPI.Title        : 'Sample Service'
@AsyncAPI.SchemaVersion: '1.0.0'

service S {
  event RootEntityCreated : projection on RootEntity;
  event InvalidAnnEntityCreated : projection on InvalidAnnEntity;
  event UnmatchedOidEntityCreated : projection on UnmatchedOidEntity;
}
