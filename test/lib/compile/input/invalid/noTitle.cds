namespace com.sap.invalid;

entity SampleEntity {
    key id      : UUID;
        boolean : Boolean;
  };

service S {
  event Created : projection on SampleEntity;
}
