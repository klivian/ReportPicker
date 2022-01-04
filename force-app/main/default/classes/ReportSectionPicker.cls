public without sharing class ReportSectionPicker
{
    @AuraEnabled(cacheable=true)
    public static List<Report_Section__c> getReportSections(Id workOrderId, Id formId)
    {
        System.debug('workOrderID = ' + workOrderId);
        List<Report_Section__c> results = [SELECT Id, Name, Section_Content__c FROM Report_Section__c WHERE Work_Order__c = :workOrderId AND Form__c = :formId ORDER BY CreatedDate];
        
        System.debug('Results: ' + results);
        return results;
    }

    @AuraEnabled(cacheable=true)
    public static List<Report_Section_List__c> getSelectedSections(Id workOrderId, Id formId)
    {
        System.debug('workOrderID = ' + workOrderId);
        List<Report_Section_List__c> results = [SELECT Id, Name, Form__c, Work_Order__c, Report_Section__c, Sequence__c, Section_Content__c FROM Report_Section_List__c WHERE Work_Order__c = :workOrderId AND Form__c = :formId ORDER BY Sequence__c];
        System.debug('Results: ' + results);
        return results;
    }
}
