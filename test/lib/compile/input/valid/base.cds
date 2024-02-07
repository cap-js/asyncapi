namespace com.sap.base;

@AsyncAPI.Title        : 'Base Events'
@AsyncAPI.SchemaVersion: '1.0.0'
@AsyncAPI.Description  : 'Events emitted by the SampleService.'
@AsyncAPI.StateInfo    : {
  state            : 'DECOMMISSIONED1',
  deprecationDate  : '2022-08-31',
  decomissionedDate: '2024-08-31',
  link             : 'http://some.release.notes.sap.com'
}
@AsyncAPI.ShortText    : 'Service Base'
@AsyncAPI.Extensions   : {
  ![sap-abc]                    : 'test',
  ![sap-stateInfo]              : {link: 'http://some.release.notes.sap.com'},
  ![sap-structured-extension-ex]: {
    directProp    : 'A',
    structuredProp: {
      simple   : 'B',
      structure: {
        prop1: 'C',
        prop2: 'D'
      }
    }
  },
  ![sap-shortText]              : 'Service Base 1'
}

service Base {
  @title         : 'BaseEntity'
  @ODM.root      : true
  @ODM.entityName: 'BaseEntity'
  @ODM.oid       : 'id'
  entity BaseEntity {
    key id            : UUID;
        boolean       : Boolean;
        integerBig    : Integer64;
        decimal       : Decimal(2, 1);
        decimalScale  : Decimal(2);
        decimalDirect : Decimal;
        double        : Double;
        date          : Date;
        time          : Time;
        datetime      : DateTime;
        string        : String(50);
        attribute     : Integer;
        defaulted     : String(40) default 'value';
        lstringval    : localized String(4);
        start         : Date @cds.valid.from;
        end           : Date @cds.valid.to;
  };

  @AsyncAPI.EventSpecVersion    : '1.0.0'
  @AsyncAPI.EventSource         : '/{region}/sap.app/{instanceId}'
  @AsyncAPI.EventCharacteristics: {
    instanceIdentification: 'key-subject',
    sequencing            : false
  }
  @AsyncAPI.EventSourceParams   : {
    region    : {
      description: 'The regional context of the application.',
      schema     : {
        type: 'string',
        enum: [
          'eu',
          'us'
        ]
      }
    },
    instanceId: {
      description: 'The instance id (tenant, installation, ...) of the application.',
      schema     : {type: 'string'}
    }
  }
  @AsyncAPI.Extensions          : {
    ![x-sap-xyz]                  : 'test',
    ![sap-event-source]           : '/{region}/sap.app.test',
    ![sap-structured-extension-ex]: {
      directProp    : 'A',
      structuredProp: {
        simple   : 'B',
        structure: {
          prop1: 'C',
          prop2: 'D'
        }
      }
    }
  }
  @AsyncAPI.EventStateInfo      : {
    state            : 'DECOMMISSIONED',
    deprecationDate  : '2020-01-01',
    decomissionedDate: '2021-01-01',
    link             : 'http://some.release.notes.sap.com'
  }
  @AsyncAPI.EventSchemaVersion  : '1.0.0'
  @AsyncAPI.EventType           : 'com.sap.base.MyName.v1'
  event Created : projection on BaseEntity;
};
