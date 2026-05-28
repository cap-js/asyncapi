namespace com.sap.test;

type Likelihood : String(10);

@AsyncAPI.Title: 'Reused Type Descriptions Test'
service TestService {
  entity ChangeRequest {
    key id         : UUID;
        @description: 'Likelihood of the change request'
        likelihood : Likelihood;
  }

  entity Risk {
    key id         : UUID;
        @description: 'Likelihood of the risk'
        likelihood : Likelihood;
  }

  entity Opportunity {
    key id         : UUID;
        @description: 'Impact of exploiting the opportunity'
        likelihood : Likelihood;
  }

  event ChangeRequestEvent : projection on ChangeRequest;
  event RiskEvent : projection on Risk;
  event OpportunityEvent : projection on Opportunity;
}
