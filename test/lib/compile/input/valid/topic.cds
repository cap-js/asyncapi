namespace my.namespace;

entity Books {
  key ID    : UUID;
  title     : String;
}

@AsyncAPI.Title        : 'Topic Test'
@AsyncAPI.SchemaVersion: '1.0.0'
service TopicService {
  // (A) @topic only — should use topic value as channel name and event type
  @topic: 'some.very.different.topic-name'
  event TopicOnlyEvent : Books;

  // (B) explicit @AsyncAPI.EventType overrides @topic
  @AsyncAPI.EventType: 'explicit.event.type'
  @topic: 'ignored.because.explicit.eventtype'
  event ExplicitTypeEvent : Books;

  // (C) explicit @AsyncAPI.ChannelName overrides @topic for channel; @topic used for event type
  @AsyncAPI.ChannelName: 'explicit/channel'
  @topic: 'topic-used-as-event-type'
  event ExplicitChannelEvent : Books;
}
