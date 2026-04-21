namespace com.sap.test;

@AsyncAPI.Title        : 'Description Test Service'
@AsyncAPI.SchemaVersion: '1.0.0'
service MyService {
  @Core.Description: 'Event with @Core.Description annotation'
  event Foo {}
  @description: 'This takes priority'
  @Core.Description: 'This is ignored'
  event Bar {}
  /** Doc comment as fallback */
  event Baz {}

  event TestEvent : {
    @description: 'Field with standard description annotation'
    fieldWithDescription: String;

    @Core.Description: 'Field with Core.Description annotation'
    fieldWithCoreDescription: String;

    @description: 'This takes priority'
    @Core.Description: 'This is ignored'
    fieldWithBoth: String;

    /** Doc comment as fallback */
    fieldWithDocComment: String;

    fieldWithoutDescription: String;
  };
}
