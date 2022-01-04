import { LightningElement, track, wire, api } from 'lwc';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import getReportSections from '@salesforce/apex/ReportSectionPicker.getReportSections';
import getSelectedSections from '@salesforce/apex/ReportSectionPicker.getSelectedSections';
import { deleteRecord, updateRecord } from 'lightning/uiRecordApi';
import { createRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

//Object and fields for updating Report Section List object
import OBJ_REPORT_SECTION_LIST from '@salesforce/schema/Report_Section_List__c';
import FIELD_NAME from '@salesforce/schema/Report_Section_List__c.Name';
import FIELD_CONTENT from '@salesforce/schema/Report_Section_List__c.Section_Content__c';
import FIELD_SECTION_ID from '@salesforce/schema/Report_Section_List__c.Report_Section__c';
import FIELD_SEQUENCE from '@salesforce/schema/Report_Section_List__c.Sequence__c';
import FIELD_WORKORDER from '@salesforce/schema/Report_Section_List__c.Work_Order__c'
import FIELD_FORM from '@salesforce/schema/Report_Section_List__c.Form__c';

export default class ReportSectionPicker extends LightningElement
{
    @track currentPageReference;
    @wire(CurrentPageReference)
    setCurrentPageReference(currentPageReference) {
        this.currentPageReference = currentPageReference;
    }

    get recordId() {
        return this.currentPageReference?.state?.c__recordId;
    }

    get formId()
    {
        return this.currentPageReference?.state?.c__formId;
    }

    @track allAvailable;
    @track allSelected;
    @track reportSectionListAvailable;
    @track reportSectionListSelected;

    @track draggingId = "";
    @track draggingName = "";
    @track draggingContent = "";
    @track draggingList = "";
    @track editItemId = "";
    @track iframeUrl = "";
    
    originalList = "";

    @track openModal = false;
   
    @wire (getReportSections,  {workOrderId : '$recordId', formId : '$formId'})
    wired_getReportSections(result)
    {
        this.allAvailable = result;
        if(this.allAvailable.data)
        {
            this.reportSectionListAvailable = this.allAvailable.data;
        }

    }

    
    @wire (getSelectedSections,  {workOrderId : '$recordId', formId : '$formId'})
    wired_getSelectedSections(result)
    {
        this.allSelected = result;
        if(this.allSelected.data)
        {
            this.reportSectionListSelected = this.allSelected.data;
        }
    }
    

    connectedCallback()
    {

    }

    showModal()
    {
        if(this.editItemId != "")
        {
            this.openModal = true;
        }
    }

    closeModal()
    {
        this.openModal = false;
        refreshApex(this.allSelected);
        
    }

    //Handle the custom event dispatched originally from a DRAG SOURCE
    //and proxied from a DROP TARGET
    handleListItemDrag(evt) {

        /*
        console.log('Setting draggingId to: ' + evt.detail.dragTargetId);
        console.log('Name : ' + evt.detail.dragTargetName);
        console.log('Content : ' + evt.detail.dragTargetContent);
        console.log('From : ' + evt.detail.originalList);
        console.log('To : ' + evt.detail.dragTargetList);
        */

        //Capture the detail passed with the event from the DRAG target
        this.draggingId = evt.detail.dragTargetId;
        this.draggingName = evt.detail.dragTargetName;
        this.draggingContent = evt.detail.dragTargetContent;
        this.draggingList = evt.detail.dragTargetList;
        this.originalList = evt.detail.originalList;

    }

    handleListItemRightClick(evt)
    {
        this.editItemId = evt.detail.itemId;
        this.iframeUrl = '/apex/ContentEditorReportSections?id=' + this.editItemId;
        this.showModal();
    }

    //Handle the custom event dispatched from a DROP TARGET
    handleItemDrop(evt)
    {
        console.log(JSON.stringify(evt.Detail));
        /*
        console.log ('In the picker drop - draggingId: ' + this.draggingId);
        console.log ('In the picker drop - draggingName: ' + this.draggingName);
        console.log ('In the picker drop - draggingContent: ' + this.draggingContent);
        console.log ('In the picker drop - target: ' + evt.detail.dragTargetList);
        console.log ('In the picker drop - source: ' + this.originalList);
        */
        if(evt.detail.dragTargetList === 'Selected')
        {
            if(evt.detail.dragTargetList != this.originalList)
            {
                let fieldsToSave = {};
                fieldsToSave[FIELD_SECTION_ID.fieldApiName] = this.draggingId;
                fieldsToSave[FIELD_NAME.fieldApiName] = this.draggingName;
                fieldsToSave[FIELD_CONTENT.fieldApiName] = this.draggingContent;
                //fieldsToSave[FIELD_SEQUENCE.fieldApiName] = ???
                fieldsToSave[FIELD_WORKORDER.fieldApiName] = this.recordId;
                fieldsToSave[FIELD_FORM.fieldApiName] = this.formId
                const recordInput = {apiName: OBJ_REPORT_SECTION_LIST.objectApiName, fields: fieldsToSave};
                console.log(JSON.stringify(recordInput));
                
                createRecord(recordInput)
                .then(() => {
                    //Force a refresh of bound list
                    refreshApex(this.allSelected);
                })
                .catch(error => {
                    //Notify any error
                    this.showToast(this,'Error Updating Record', error.body.message, 'error');
                });
                
            }
        }

        if(evt.detail.dragTargetList === 'Available')
        {
            if(evt.detail.dragTargetList != this.originalList)
            {
                //Remove from selected list
                deleteRecord(this.draggingId)
                .then(() => {
                    refreshApex(this.allSelected);
                })
                .catch(error => {
                    this.showToast(this,'Error Updating Record',error.body.message, 'error');
                });
            }
        }
    }

    //Notification utility function
    showToast = (firingComponent, toastTitle, toastBody, variant)  => {
        const evt = new ShowToastEvent({
            title: toastTitle,
            message: toastBody,
            variant: variant
        });
        firingComponent.dispatchEvent(evt);
    }
}