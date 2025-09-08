import { LightningElement } from 'lwc';
import { createRecord } from "lightning/uiRecordApi";
import LEAD_OBJECT from "@salesforce/schema/Lead";
import LEAD_FIRSTNAME_FIELD from "@salesforce/schema/Lead.FirstName";
import LEAD_LASTNAME_FIELD from "@salesforce/schema/Lead.LastName";
import LEAD_COMPANY_FIELD from "@salesforce/schema/Lead.Company";
import LEAD_PHONE_FIELD from "@salesforce/schema/Lead.Phone";
import LEAD_EMAIL_FIELD from "@salesforce/schema/Lead.Email";

export default class LeadScanner extends LightningElement {

    successMessage;
    errorMessage;

    handleError(event) {
        this.errorMessage = JSON.stringify(event.detail.error);
    }

    async handleScan(event) {
        try {
            // Get the data from scanner
            const scannedData = event.detail.scannedBarcodes[0];

            // Checking data
            if (!scannedData) {
                throw new Error('Empty data!');
            }

            // Turning the data into a JSON object
            const jsonData = JSON.parse(scannedData);

            // Checking json data
            if (!jsonData.name) {
                throw new Error('No name attribute found in scanned data');
            }
            if (!jsonData.name.firstname) {
                throw new Error('No first name attribute found in scanned data');
            }
            if (!jsonData.name.lastname) {
                throw new Error('No last name attribute found in scanned data');
            }

            // Mapping data into a record
            // See https://developer.salesforce.com/docs/platform/lwc/guide/reference-create-record.html
            const recordInput = {
                apiName: LEAD_OBJECT.objectApiName, 
                fields: {}
            };
            recordInput.fields[LEAD_FIRSTNAME_FIELD.fieldApiName] = jsonData.name.firstname;
            recordInput.fields[LEAD_LASTNAME_FIELD.fieldApiName] = jsonData.name.lastname;
            if (jsonData.company) recordInput.fields[LEAD_COMPANY_FIELD.fieldApiName] = jsonData.company;
            if (jsonData.phone) recordInput.fields[LEAD_PHONE_FIELD.fieldApiName] = jsonData.phone;
            if (jsonData.email) recordInput.fields[LEAD_EMAIL_FIELD.fieldApiName] = jsonData.email;

            // Inserting record in database
            // See https://developer.salesforce.com/docs/platform/lwc/guide/reference-create-record.html
            const leadRecord = await createRecord(recordInput);

            // Insert was successful let's printout the new id!
            this.successMessage = `Lead created with Id: ${leadRecord.id}`;
            this.errorMessage = undefined;

        } catch (error) {

            this.errorMessage = `Error: ${error?.message ?? 'Unknown'}`;
            this.successMessage = undefined;
        }
    }
}