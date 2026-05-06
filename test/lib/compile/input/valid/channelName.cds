namespace com.sap.channelname;

entity Study {
  key id : UUID;
  status : String;
  material : String;
};

@AsyncAPI.Title        : 'Study Events Service'
@AsyncAPI.SchemaVersion: '1.0.0'
service StudyEventsService {
  // Event with custom channel name containing slashes (legacy Event Mesh topic path)
  @AsyncAPI.EventType   : 'study_material'
  @AsyncAPI.ChannelName : 'default/sap.ctsm.study.prod/-/study/material'
  event study_material : projection on Study;

  // Event without custom channel name (uses EventType)
  @AsyncAPI.EventType   : 'study.status.changed.v1'
  event study_status : projection on Study;

  // Event without any annotations (uses event name)
  event study_created : projection on Study;
}
