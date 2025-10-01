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
     * @description The API name of the SObject where we create a new record
     * @type {string}
     */
    @api sobject;

    /**
     * @description The API name of the field to map to the F
     * @type {string}
     */
    @api firstname;

    /**
     * @description The API name of the field to map to the L
     * @type {string}
     */
    @api lastname;

    /**
     * @description The API name of the field to map to the C
     * @type {string}
     */
    @api company;

    /**
     * @description The API name of the field to map to the P
     * @type {string}
     */
    @api phone;

    /**
     * @description The API name of the field to map to the E
     * @type {string}
     */
    @api email;

    /**
     * @description The API name of the field to map to the K
     * @type {string}
     */
    @api referenceId;

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
            const recordInformation = matching.groups;
            this._logger.log(' ok!', false);

            // Inserting record in database
            // See https://developer.salesforce.com/docs/platform/lwc/guide/reference-create-record.html
            this._logger.log(`Inserting the ${this.sobject} record...`);
            const fieldsInformation = {};
            if (recordInformation.F && this.firstname) fieldsInformation[this.firstname] = recordInformation.F;
            if (recordInformation.L && this.lastname) fieldsInformation[this.lastname] = recordInformation.L;
            if (recordInformation.C && this.company) fieldsInformation[this.company] = recordInformation.C;
            if (recordInformation.P && this.phone) fieldsInformation[this.phone] = recordInformation.P;
            if (recordInformation.E && this.email) fieldsInformation[this.email] = recordInformation.E;
            if (recordInformation.K && this.referenceId) fieldsInformation[this.referenceId] = recordInformation.K;
            const record = await createRecord({ apiName: this.sobject, fields: fieldsInformation });
            this._logger.log(' ok!', false);

            // Insert was successful let's printout the new id!
            this._logger.log(`Success! ${this.sobject} created with Id: ${record.id}`);
            this._showSuccess(this.sobject, record.id);

        } catch (error) {
            this._showError();
            this._logger.log(`Error was raised: ${error?.message ?? 'Unknown'}`);
        } finally {
            this._logger.commit();
        }
    }
    
    /**
     * @description Handles the click on the manual creation icon
     */
    handleManualCreation() {
        this[NavigationMixin.Navigate]({
            type: "standard__objectPage",
            attributes: {
                objectApiName: `${this.sobject}`,
                actionName: "new",
            },
        });
    }

    /**
     * @description Show the success message as a toast when correctly inserting a record
     * @param {string} sobject The API name of the created record
     * @param {string} recordId The Id of the created record
     */
    _showSuccess(sobject, recordId) {
        Toast.show({
            label: `Success! A new ${sobject} has been created {link}.`,
            labelLinks: {
                link: {
                    url: `/${recordId}`,
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
            label: 'Sorry! An error occured while using the scanner. You can create that record manually.',
            variant: 'error',
            mode: 'dismissible'
        }, this);
    };
}