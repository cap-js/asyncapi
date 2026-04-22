namespace com.example.project;

@AsyncAPI.Title        : 'Project Management Service'
@AsyncAPI.SchemaVersion: '1.0.0'
service ProjectService {
    event IssueCreated : {
        issueId: String;
        title: String;
    };
}
