using {ProcessorService} from '@capire/incidents/srv/services';

@AsyncAPI.Title        : 'CatalogService Events'
@AsyncAPI.SchemaVersion: '1.0.0'
@AsyncAPI.Description  : 'Events emitted by the CatalogService.'
@AsyncAPI.StateInfo    : {
  state            : 'DECOMMISSIONED1',
  deprecationDate  : '2022-08-31',
  decomissionedDate: '2024-08-31',
  link             : 'http://some.release.notes.sap.com'
}

extend service ProcessorService {

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
    @AsyncAPI.EventStateInfo      : {
        state            : 'DECOMMISSIONED',
        deprecationDate  : '2020-01-01',
        decomissionedDate: '2021-01-01',
        link             : 'http://some.release.notes.sap.com'
    }
    @AsyncAPI.EventSchemaVersion  : '1.0.0'

    event ProcessorService_event_V1 : projection on ProcessorService.Incidents;


}
