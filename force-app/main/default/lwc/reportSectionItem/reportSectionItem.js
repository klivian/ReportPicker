import { LightningElement, api } from 'lwc';

export default class ReportSectionItem extends LightningElement
{
    @api reportSectionRecord;

    itemDragStart(evt)
    {
        console.log('ItemDragStart for item ' + this.reportSectionRecord.Id);

        let draggableElement = this.template.querySelector('[data-id="' + this.reportSectionRecord.Id + '"]');
        draggableElement.classList.add('drag');
        
        const event = new CustomEvent('itemdrag', {
            detail: {
                dragTargetId: this.reportSectionRecord.Id,
                dragTargetName:  this.reportSectionRecord.Name,
                dragTargetContent: this.reportSectionRecord.Section_Content__c
            }
        });

        this.dispatchEvent(event);
    }

    itemDragEnd(evt) {

        //console.log('Handling DragEnd for item: ' + this.reportSectionRecord.Id);
 
        //Reset the style
        let draggableElement = this.template.querySelector('[data-id="' + this.reportSectionRecord.Id + '"]');
        draggableElement.classList.remove('drag');
    }

    rightClick(evt)
    {
        this.cancel(evt);
        const event = new CustomEvent('itemrightclick', {
            detail: {
                itemId: this.reportSectionRecord.Id,
                itemName: this.reportSectionRecord.Name,
                itemContent: this.reportSectionRecord.Section_Content__c
            }
        });
        console.log('Item right click');
        console.log(JSON.stringify(event.detail));
        this.dispatchEvent(event);  //push event up to next layer (reportSectionList)
    }

    //Function to cancel drag n drop events
    cancel(evt) {
        if (evt.stopPropagation) evt.stopPropagation();
        if (evt.preventDefault) evt.preventDefault();
        return false;
    };
}