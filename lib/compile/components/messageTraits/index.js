/**
 * Get a map of message traits.
 */
module.exports = function getMessageTraits() {

    return {
        "CloudEventsContext.v1": {
            "headers": {
                "type": "object",
                "properties": {
                    "id": {
                        "description": "Identifies the event.",
                        "type": "string",
                        "examples": [
                            "6925d08e-bc19-4ad7-902e-bd29721cc69b"
                        ]
                    },
                    "specversion": {
                        "description": "The version of the CloudEvents specification which the event uses.",
                        "type": "string",
                        "const": "1.0"
                    },
                    "source": {
                        "description": "Identifies the instance the event originated in.",
                        "type": "string",
                        "format": "uri-reference",
                        "examples": [
                            "/default/sap.s4.beh/ER9CLNT001",
                            "/eu/sap.billing.sb/91dec60d-9757-4e2c-b9e5-21da10016fe9"
                        ]
                    },
                    "type": {
                        "description": "Describes the type of the event related to the source the event originated in.",
                        "type": "string",
                        "examples": [
                            "sap.dsc.FreightOrder.Arrived.v1",
                            "sap.billing.sb.Subscription.Canceled.v1"
                        ]
                    },
                    "subject": {
                        "description": "Describes the subject of the event in the context of the source the event originated in (e.g., the id of the business object the event is about).",
                        "type": "string",
                        "examples": [
                            "ce307052-75a0-4a8f-a961-ebf21669bb80",
                            "urn:epc:tag:sgtin-96:1.7332402.026591.1234567890"
                        ]
                    },
                    "datacontenttype": {
                        "description": "Content type of the event data.",
                        "type": "string",
                        "const": "application/json"
                    },
                    "dataschema": {
                        "description": "Identifies the schema that the event data adheres to.",
                        "type": "string",
                        "format": "uri",
                        "examples": [
                            "http://example.com/event/sap.billing.sb.Subscription.Canceled/v1.2.0"
                        ]
                    },
                    "time": {
                        "description": "Timestamp of when the occurrence happened.",
                        "format": "date-time",
                        "type": "string",
                        "examples": [
                            "2018-04-05T17:31:00Z"
                        ]
                    }
                },
                "required": [
                    "id",
                    "source",
                    "specversion",
                    "type"
                ],
                "patternProperties": {
                    "^xsap[a-z0-9]+$": {
                        "description": "Application defined custom extension context attributes.",
                        "type": [
                            "boolean",
                            "integer",
                            "string"
                        ]
                    }
                }
            }
        }
    };
}
