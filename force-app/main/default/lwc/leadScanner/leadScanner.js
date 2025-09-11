import { api, LightningElement } from 'lwc';
import Toast from 'lightning/toast';
import { createRecord } from "lightning/uiRecordApi";

/**
 * @description Structure representing the information of a Lead
 */
class LeadInformation {
    
    /**
     * @description The first name of the lead
     * @type {string}
     */
    firstName;
    
    /**
     * @description The last name of the lead
     * @type {string}
     */
    lastName;
    
    /**
     * @description The company name of the lead
     * @type {string}
     */
    company;
    
    /**
     * @description The phone of the lead
     * @type {string}
     */
    phone;
    
    /**
     * @description The email address of the lead
     * @type {string}
     */
    email;
}

/**
 * @description Manager for Lead records in Salesforce's database
 */
class LeadDatabaseManager {

    /**
     * @description Inserts a Lead record in Salesforce
     * @param {LeadInformation} data The lead information to create the record
     * @returns {Promise<import('lightning/uiRecordApi').RecordRepresentation>} The created record
     * @throws {Error} If there is an error during the record creation
     * @static
     */
    static async insert(data) {
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
    }
}

export default class LeadScanner extends LightningElement {

    // --------------------------------------------------
    // Default path (with scanner)
    // ---------------------------------------------------

    /**
     * @description The RegEx template to parse the data from the scanner
     * @type {string}
     */
    @api template;

    /**
     * @description Handles errors coming from the scanner component
     * @param {CustomEvent} event The event containing the error details
     */
    handleScanError(event) {
        this._showScanningErrorMessage();
        this._continueLogging(`Error was raised: ${event.detail.error?.message ?? 'Unknown'}`);
    }

    /**
     * @description Handles the scan event from the scanner component
     * @param {CustomEvent} event The event containing the scanned data
     * @async
     */
    async handleScan(event) {
        this._startLogging('Scanning path');
        try {
            // Get the data from scanner
            const scannedData = event.detail.scannedBarcodes[0];

            // Checking data
            this._continueLogging('Checking data coming from the scanner...');
            if (!scannedData) {
                throw new Error('Scanned data is empty.');
            }
            this._continueLogging(' ok!', false);

            // Prompting the data in logs
            this._continueLogging('Raw data is: ${scannedData}`');

            // Prompting the template in logs
            this._continueLogging(`Template is: ${this.template}`);

            // Building RegEx based on given template
            this._continueLogging('Creating RegEx object based on template configuration data...');
            const regEx = new RegExp(this.template, 'is'); // 'i' for case insensitive, 's' for dotall (so that . matches \n as well)
            this._continueLogging(' ok!', false);

            // Matching Data based on the RegEx template specified in the flexipage
            this._continueLogging('Matching the data from scanner and the expected template...');
            const matching = scannedData.match(regEx);
            this._continueLogging(' ok!', false);

            // Extracting data from matching groups
            this._continueLogging('Extracting data from matching groups...');
            if (!matching) {
                throw new Error('No match!');
            }
            const leadInformation = matching.groups;
            this._continueLogging(' ok!', false);

            // Inserting record in database
            // See https://developer.salesforce.com/docs/platform/lwc/guide/reference-create-record.html
            this._continueLogging('Inserting the lead record...');
            const leadRecord = await LeadDatabaseManager.insert({
                firstName: leadInformation.F,
                lastName: leadInformation.L,
                company: leadInformation.C,
                phone: leadInformation.P,
                email: leadInformation.E
            });
            this._continueLogging(' ok!', false);

            // Insert was successful let's printout the new id!
            this._continueLogging(`Success! Lead created with Id: ${leadRecord.id}`);
            this._showInsertionSuccessMessage(leadRecord.id);

        } catch (error) {
            this._showScanningErrorMessage();
            this._continueLogging(`Error was raised: ${error?.message ?? 'Unknown'}`);
        }
    }    
    
    // --------------------------------------------------
    // Alternative path (if scanner is out)
    // ---------------------------------------------------

    /**
     * @description The first name of the lead (alternative path)
     * @type {string}
     */
    altFirstName;

    /**
     * @description The last name of the lead (alternative path)
     * @type {string}
     */
    altLastName;

    /**
     * @description The company name of the lead (alternative path)
     * @type {string}
     */
    altCompany;

    /**
     * @description The email address of the lead (alternative path)
     * @type {string}
     */
    altEmail;

    /**
     * @description The phone of the lead (alternative path)
     * @type {string}
     */
    altPhone;

    /**
     * @description Handles the change event on input fields in the alternative path
     */
    handleAlternativeInputChange(event) {
        this[event.target.dataset.field] = event.target.value;
    }

    get altSaveButtonDisabled() {
        return !(this.altFirstName && this.altLastName && this.altCompany);
    }

    /**
     * @description Handles the click event when asking to insert the lead in the alternative path
     * @async
     */
    async handleAlternativeProcess() {
        this._startLogging('Alternative path');
        try {

            // Prompting the alternative data in logs
            this._continueLogging(`Alternative first name is: ${this.altFirstName}`);
            this._continueLogging(`Alternative last name is: ${this.altLastName}`);
            this._continueLogging(`Alternative company is: ${this.altCompany}`);
            this._continueLogging(`Alternative phone is: ${this.altPhone}`);
            this._continueLogging(`Alternative email address is: ${this.altEmail}`);

            // Inserting record in database
            this._continueLogging('Inserting the lead record...');
            const leadRecord = await LeadDatabaseManager.insert({
                firstName: this.altFirstName,
                lastName: this.altLastName,
                company: this.altCompany,
                phone: this.altPhone,
                email: this.altEmail
            });
            this._continueLogging(' ok!', false);

            // Insert was successful let's printout the new id!
            this._continueLogging(`Success! Lead created alternatively with Id: ${leadRecord.id}`);
            this._showInsertionSuccessMessage(leadRecord.id);

            // And cleaning fields
            this.altFirstName = '';
            this.altLastName = '';
            this.altCompany = '';
            this.altEmail = '';
            this.altPhone = '';

        } catch (error) {

            this._showAlternativeErrorMessage();
            this._continueLogging(`Error was raised: ${error?.message ?? 'Unknown'}`);
        }
    }


    // --------------------------------------------------
    // Toast part
    // --------------------------------------------------

    /**
     * @description Show the success message as a toast when correctly inserting a lead
     * @param {string} leadId The Id of the created lead
     */
    _showInsertionSuccessMessage(leadId) {
        Toast.show({
            label: 'Success! A new lead has been created {leadLink}.',
            labelLinks: {
                leadLink: {
                    url: `/${leadId}`,
                    label: 'here'
                }
                },
            variant: 'success'
        }, this);
    };

    /**
     * @description Show an error message as a toast when something goes wrong with scanning
     */
    _showScanningErrorMessage() {
        Toast.show({
            label: 'Sorry! An error occured while using the scanner. Please consider the "Alternative" tab to create a lead manually.',
            variant: 'error'
        }, this);
    };

    /**
     * @description Show an error message as a toast when something goes wrong with alternative process
     */
    _showAlternativeErrorMessage() {
        Toast.show({
            label: 'Sorry! An error occured while using the alternative process.',
            variant: 'error'
        }, this);
    };

    // --------------------------------------------------
    // Log part of the component
    // ---------------------------------------------------

    /**
     * @description The logs of the component
     * @type {string}
     */
    logs = '';

    /**
     * @description Starts logging with an initial message
     * @param {string} message The initial message to start the logs
     */
    _startLogging(message) {
        this.logs = message;
    }

    /**
     * @description Continues logging with an additional message
     * @param {string} message The message to add to the logs
     * @param {boolean} [newLine] Whether to add a new line before the message (default: true)
     */
    _continueLogging(message, newLine = true) {
        this.logs += `${newLine === true ? '\n' : ''}${message}`;
    }
}