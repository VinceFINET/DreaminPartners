import { api, LightningElement } from 'lwc';
import { createRecord } from "lightning/uiRecordApi";
import LEAD_OBJECT from "@salesforce/schema/Lead";
import LEAD_FIRSTNAME_FIELD from "@salesforce/schema/Lead.FirstName";
import LEAD_LASTNAME_FIELD from "@salesforce/schema/Lead.LastName";
import LEAD_COMPANY_FIELD from "@salesforce/schema/Lead.Company";
import LEAD_PHONE_FIELD from "@salesforce/schema/Lead.Phone";
import LEAD_EMAIL_FIELD from "@salesforce/schema/Lead.Email";

export default class LeadScanner extends LightningElement {

    @api template;
    
    altFirstName;
    altLastName;
    altCompany;
    altEmail;
    altPhone;

    successMessage;
    errorMessage;

    showLogs = false;
    logs = '';

    handleHideLog() {
        this.showLogs = false;
    }

    handleShowLog() {
        this.showLogs = true;
    }

    async handleAternativeData() {

        this.logs += `\nAlternative path -----`;
        try {

            this.logs += `\nInserting the lead record...`;
            const leadRecord = await this._insertRecord({
                firstName: this.altFirstName,
                lastName: this.altLastName,
                company: this.altCompany,
                phone: this.altPhone,
                email: this.altEmail
            });
            this.logs += ` ok !`;

            // Insert was successful let's printout the new id!
            this.successMessage = `Lead created alternatively with Id: ${leadRecord.id}`;
            this.errorMessage = undefined;

        } catch (error) {

            this.errorMessage = `Error: ${error?.message ?? 'Unknown'}`;
            this.successMessage = undefined;
            this.logs += `\n\n${JSON.stringify(error)}`;
        }
    }

    handleError(event) {
        this.errorMessage = JSON.stringify(event.detail.error);
    }

    async handleScan(event) {
        this.logs = '';
        try {
            // Get the data from scanner
            const scannedData = event.detail.scannedBarcodes[0];

            // Checking data
            this.logs += `\nChecking data coming from the scanner...`;
            if (!scannedData) {
                throw new Error('Scanned data is empty.');
            }
            this.logs += ` ok !`;
            this.logs += `\nRaw data is: ${scannedData}`;

            // Building RegEx based on given template
            this.logs += `\nTemplate is: ${this.template}`;
            this.logs += `\nCreating RegEx object based on template configuration data...`;
            const regEx = new RegExp(this.template, 'is'); // 'i' for case insensitive, 's' for dotall (so that . matches \n as well)
            this.logs += ` ok !`;

            // Matching Data based on the RegEx template specified in the flexipage
            this.logs += `\nMatching the data from scanner and the expected template...`;
            const matching = scannedData.match(regEx);
            this.logs += ` ok !`;

            // Extracting data from matching groups
            this.logs += `\nExtracting data from matching groups...`;
            if (!matching) {
                throw new Error('No match!');
            }
            const leadInformation = matching.groups;
            this.logs += ` ok !`;

            // Inserting record in database
            // See https://developer.salesforce.com/docs/platform/lwc/guide/reference-create-record.html
            this.logs += `\nInserting the lead record...`;
            const leadRecord = await this._insertRecord({
                firstName: leadInformation.F,
                lastName: leadInformation.L,
                company: leadInformation.C,
                phone: leadInformation.P,
                email: leadInformation.E
            });
            this.logs += ` ok !`;

            // Insert was successful let's printout the new id!
            this.successMessage = `Lead created with Id: ${leadRecord.id}`;
            this.errorMessage = undefined;

        } catch (error) {

            this.errorMessage = `Error: ${error?.message ?? 'Unknown'}`;
            this.successMessage = undefined;
            this.logs += `\n\n${JSON.stringify(error)}`;
        }
    }

    async _insertRecord(data) {
        // See https://developer.salesforce.com/docs/platform/lwc/guide/reference-create-record.html
        const record = await createRecord({
            apiName: 'Lead', 
            fields: {
                FirstName: data.firstName,
                LastName: data.lastName,
                Company: data.company,
                Phone: data.phone,
                Email: data.email
            }
        });
        return record;
    };
}