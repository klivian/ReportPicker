import { LightningElement, api } from 'lwc';

export default class ReportSectionList extends LightningElement
{
    @api sectionList;
    @api listLabel;
    @api itemId;
    
    originalList;

    get areRecords()
    {
        if(this.sectionList)
        {
            return this.sectionList.length > 0;
        }
        else
        {
            return false;
        }
    }

    //Function to cancel drag n drop events
    cancel(evt) {
        if (evt.stopPropagation) evt.stopPropagation();
        if (evt.preventDefault) evt.preventDefault();
        return false;
    };

    handleItemDrag(evt)
    {
        this.originalList = this.listLabel;
        console.log('Section list handleItemDrag event');
        console.log('Original list: ' + this.originalList);
        this.cancel(evt);
        const event = new CustomEvent('listitemdrag', {
            detail: {...evt.detail,originalList: this.originalList}
        });
        console.log(JSON.stringify(event.detail));
        this.dispatchEvent(event);
    }

    handleItemRightClick(evt)
    {
        console.log('List item right click received');
        console.log(JSON.stringify(evt.detail));
        
        this.cancel(evt);
        const event = new CustomEvent('listitemrightclick', {
            detail: evt.detail
        });
        
        this.dispatchEvent(event);  //cascade up to the section picker
    }

    handleDragEnter(evt) {

        //console.log('Drag Enter event for ' + this.listLabel);

        //Cancel the event
        this.cancel(evt);

    }
     //DROP TARGET dragover event handler
     handleDragOver(evt) {
        
        //console.log('Drag Over event for ' + this.listLabel);
        
        //Cancel the event
        this.cancel(evt);

        this.addDragOverStyle()
 
    }
     //DROP TARGET dragleave event handler
     handleDragLeave(evt) {
        
        //console.log('Drag Leave event for ' + this.listLabel);
        
        //Cancel the event
        this.cancel(evt);
        
        this.removeDragOverStyle();

    }

    handleDrop(evt)
    {
        console.log('In List component - Drop event for ' + this.listLabel);    //this works
        //console.log('Report section id : ' + this.reportSectionRecord.Id);

        this.cancel(evt);
        
        const event = new CustomEvent('itemdrop', {
            detail: {
                dragTargetId : evt.detail.dragTargetId,
                dragTargetList: this.listLabel
            }
        });

        console.log(JSON.stringify(event.detail));  //this works

        this.dispatchEvent(event);  //this now works ¯\_(ツ)_/¯
        this.removeDragOverStyle();
    }

    addDragOverStyle()
    {
        let draggableElement = this.template.querySelector('[data-role="drop-target"]');
        this.draggableElement.classList.add('over');
    }

    removeDragOverStyle()
    {
        let draggableElement = this.template.querySelector('[data-role="drop-target"]');
        this.draggableElement.classList.remove('over');
    }
}