namespace com.sap.test;

@AsyncAPI.Title        : 'i18n Test Service'
@AsyncAPI.SchemaVersion: '1.0.0'
service MyService {
  event TestEvent : {
    @description: '{i18n>FIELD_DESC}'
    fieldWithI18n: String;

    @Core.Description: '{i18n>CORE_FIELD_DESC}'
    fieldWithCoreI18n: String;

    @description: 'Plain text description'
    fieldWithPlainText: String;
  };

  @Core.Description: '{i18n>EVENT_DESC}'
  event I18nEvent : {
    @description: '{i18n>PRODUCT_ID}'
    productId: String;
  };
}
