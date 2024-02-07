namespace com.sap.bookstore;

@AsyncAPI.Title        : 'BookStore Events'
@AsyncAPI.SchemaVersion: '1.0.0'
@AsyncAPI.ShortText: 'Service BookStore'
service BookStore {
  entity Book {
    key id : UUID;
    name : String(40);
  };

  event Created : projection on Book;
};

@AsyncAPI.Title        : 'Author Service'
@AsyncAPI.SchemaVersion: '2.0.0'
@AsyncAPI.ShortText: 'Service AuthorService'
service AuthorService {
  entity Author {
    key id : UUID;
    name : String(40);
  };

  event Created : projection on Author;
};
