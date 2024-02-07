namespace com.sap.test;

entity Book {
  key bookId : String; 
  authors: Association to many Book2Author;
};

entity Author {
  key authorId: String; 
  name: String; 
  books: Association to many Book2Author
};

entity Book2Author {
  key b2aBook: Association to Book; 
  key b2aAuthor: Association to Author
};

@AsyncAPI.Title        : 'My Events'
@AsyncAPI.SchemaVersion: '1.0.0'
service MyService {
  event Created : projection on Book;
}
