import { LightningElement, track } from 'lwc';
import submitLead from '@salesforce/apex/WebToLeadController.submitLead';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class WebToLeadForm extends LightningElement {
    @track email = '';
    @track company = '';
    @track phone = '';
    @track category = '';
    @track pos = false;
    @track productInterest = '';
    @track size = '';
    @track numberOfLocations = '';
    @track step = 1;

    handleChange(event) {
        const field = event.target.name;
        this[field] = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    }

    nextStep() {
        this.step += 1;
    }

    prevStep() {
        if (this.step > 1) {
            this.step -= 1;
        }
    }

    async handleSubmit() {
        try {
            const response = await submitLead({
                email: this.email,
                company: this.company,
                phone: this.phone,
                category: this.category,
                pos: this.pos,
                productInterest: this.productInterest,
                size: this.size,
                numberOfLocations: this.numberOfLocations
            });

            this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                message: response,
                variant: 'success'
            }));

            this.clearForm();
        } catch (error) {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: 'Failed to submit lead: ' + (error.body ? error.body.message : error),
                variant: 'error'
            }));
        }
    }

    clearForm() {
        this.email = '';
        this.company = '';
        this.phone = '';
        this.category = '';
        this.pos = false;
        this.productInterest = '';
        this.size = '';
        this.numberOfLocations = '';
        this.step = 1;
    }
}