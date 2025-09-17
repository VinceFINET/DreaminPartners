import { api, LightningElement } from 'lwc';
import Toast from 'lightning/toast';
import { createRecord } from "lightning/uiRecordApi";
import { NavigationMixin } from "lightning/navigation";

/**
 * @description Simple logger to accumulate logs and print them at once
 */
class Logger {

    /**
     * @description The accumulated logs
     * @type {string}
     * @private
     */
    _logs;

    /**
     * @description Initializes the logger
     */
    constructor() {
        this._logs = '';
    }

    /**
     * @description Logs a message, optionally starting with a new line
     * @param {string} message The message to log
     * @param {boolean} [newLine] Whether to add a new line before the message (default: true)
     */
    log(message, newLine = true) {
        this._logs += `${newLine === true ? '\n' : ''}${message}`;
    }

    /**
     * @description Commits the accumulated logs to the consumer (e.g., console)
     */
    commit() {
        console.log(this._logs);
    }
}

export default class LeadScanner extends NavigationMixin(LightningElement) {

    /**
     * @description The logger of this component
     * @type {string}
     * @private
     */
    _logger = new Logger();

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
        this._showError();
        this._logger.log(`Error was raised: ${event.detail.error?.message ?? 'Unknown'}`);
        this._logger.commit();
    }

    /**
     * @description Handles the scan event from the scanner component
     * @param {CustomEvent} event The event containing the scanned data
     * @async
     */
    async handleScan(event) {
        this._logger.log('Scanning path');
        try {
            // Get the data from scanner
            const scannedData = event.detail.scannedBarcodes[0];

            // Checking data
            this._logger.log('Checking data coming from the scanner...');
            if (!scannedData) {
                throw new Error('Scanned data is empty.');
            }
            this._logger.log(' ok!', false);

            // Prompting the data in logs
            this._logger.log('Raw data is: ${scannedData}`');

            // Prompting the template in logs
            this._logger.log(`Template is: ${this.template}`);

            // Building RegEx based on given template
            this._logger.log('Creating RegEx object based on template configuration data...');
            const regEx = new RegExp(this.template, 'is'); // 'i' for case insensitive, 's' for dotall (so that . matches \n as well)
            this._logger.log(' ok!', false);

            // Matching Data based on the RegEx template specified in the flexipage
            this._logger.log('Matching the data from scanner and the expected template...');
            const matching = scannedData.match(regEx);
            this._logger.log(' ok!', false);

            // Extracting data from matching groups
            this._logger.log('Extracting data from matching groups...');
            if (!matching) {
                throw new Error('No match!');
            }
            const leadInformation = matching.groups;
            this._logger.log(' ok!', false);

            // Inserting record in database
            // See https://developer.salesforce.com/docs/platform/lwc/guide/reference-create-record.html
            this._logger.log('Inserting the lead record...');
            const leadRecord = await createRecord({
                apiName: 'Lead', 
                fields: {
                    FirstName: leadInformation.F,
                    LastName: leadInformation.L,
                    Company: leadInformation.C,
                    Phone: leadInformation.P,
                    Email: leadInformation.E
                }
            });
            this._logger.log(' ok!', false);

            // Insert was successful let's printout the new id!
            this._logger.log(`Success! Lead created with Id: ${leadRecord.id}`);
            this._showSuccess(leadRecord.id);

        } catch (error) {
            this._showError();
            this._logger.log(`Error was raised: ${error?.message ?? 'Unknown'}`);
        } finally {
            this._logger.commit();
        }
    }
    
    /**
     * @description Handles the click on the manual lead creation icon
     */
    handleManualLeadCreation() {
        this[NavigationMixin.Navigate]({
            type: "standard__objectPage",
            attributes: {
                objectApiName: "Lead",
                actionName: "new",
            },
        });
    }

    /**
     * @description Show the success message as a toast when correctly inserting a lead
     * @param {string} leadId The Id of the created lead
     */
    _showSuccess(leadId) {
        Toast.show({
            label: 'Success! A new lead has been created {leadLink}.',
            labelLinks: {
                leadLink: {
                    url: `/${leadId}`,
                    label: 'here'
                }
                },
            variant: 'success',
            mode: 'dismissible'
        }, this);
    };

    /**
     * @description Show an error message as a toast when something goes wrong with scanning
     */
    _showError() {
        Toast.show({
            label: 'Sorry! An error occured while using the scanner. You can create that lead manually.',
            variant: 'error',
            mode: 'dismissible'
        }, this);
    };
}