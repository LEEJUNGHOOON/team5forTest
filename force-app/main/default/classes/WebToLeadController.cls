public with sharing class WebToLeadController {
    @AuraEnabled
    public static String submitLead(String email, String company, String phone, String category, Boolean pos, String productInterest, String size, String numberOfLocations) {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint('https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8');
            request.setMethod('POST');
            request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
            request.setTimeout(30000); // 30초 타임아웃 설정
            
            // Web-to-Lead 폼 필드 데이터 추가
            String body = 'oid=00DNS00000DBRrp'
                + '&retURL=http://'
                + '&email=' + email
                + '&company=' + company
                + '&phone=' + phone
                + '&00NNS00000WftR7=' + category
                + (pos ? '&00NNS00000WfvCn=1' : '')
                + '&00NNS00000Wfvnt=' + productInterest
                + '&00NNS00000WfvxZ=' + size
                + '&00NNS00000Wfw5d=' + numberOfLocations;
            
            request.setBody(body);
            System.debug('Web-to-Lead Request Body: ' + body);
            
            HttpResponse response = http.send(request);
            System.debug('Web-to-Lead Response Code: ' + response.getStatusCode());
            System.debug('Web-to-Lead Response Body: ' + response.getBody());
            
            return response.getStatusCode() == 200 ? 'Lead successfully submitted' : 'Error: ' + response.getBody();
        } catch (Exception e) {
            System.debug('Web-to-Lead Error: ' + e.getMessage());
            return 'Error: ' + e.getMessage();
        }
    }
}