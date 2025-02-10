public with sharing class LeadLocationController {
    @AuraEnabled(cacheable=true)
    public static List<Lead> getLeadLocations() {
        return [
            SELECT Id, Name, Add__c, Latitude__c, Longitude__c
            FROM Lead
            WHERE Latitude__c != null AND Longitude__c != null
            ORDER BY CreatedDate DESC
            LIMIT 10
        ];
    }
}