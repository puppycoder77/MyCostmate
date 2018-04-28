import { Component } from '@angular/core';
import { UserMessageClient } from "../../Models/userMessageClient";
import { ActivatedRoute } from "@angular/router";
import { ApiService } from "../../Services/api.service";
import { Title } from "@angular/platform-browser";

@Component({
    selector: 'user-message-sent-list',
    templateUrl: './user-message-sent-list.component.html',
    styleUrls: ['./user-message-sent-list.component.css']
})
export class UserMessageSentListComponent {
    
    shortenedname: string;
    //msgHasBeenRead: boolean;
    userMessages: UserMessageClient[];
    constructor(private route: ActivatedRoute, private apiservice: ApiService, private pageTitle: Title) { }

    ngOnInit(): void {
        this.pageTitle.setTitle("Sent messages");
        this.route.data.subscribe((data: any) => {
            this.userMessages = data['sentMsgListDataResv'];
            //alert(JSON.stringify(this.userMessages));
            //Manipulation body length
            let usrMsgArr: UserMessageClient[] = this.userMessages;
            for (var item in usrMsgArr) {
                if (usrMsgArr[item].body.length > 150) {
                    usrMsgArr[item].body = usrMsgArr[item].body.substring(0, 150) + "...";
                }
                if (usrMsgArr[item].sender.fullname.length > 11) {
                    this.shortenedname = usrMsgArr[item].sender.fullname.substring(0, 11) + "...";
                }
                else {
                    this.shortenedname = usrMsgArr[item].sender.fullname
                }
            }
        });

        if (this.apiservice.deletedItemId != null) {
            var thisUserMessages = this.userMessages;
            for (var i = 0; i < thisUserMessages.length; i++) {
                if (thisUserMessages[i].id == this.apiservice.deletedItemId) {

                    thisUserMessages.splice(thisUserMessages.indexOf(thisUserMessages[i]), 1);
                }
            }
        }

        /*I DON'T NEED THIS FOR SENT MESSAGES*/
        //if (this.userMessages) {
        //    for (var i = 0; i < this.userMessages.length; i++) {
        //        if (this.userMessages[i].hasBeenRead) {

        //            this.msgHasBeenRead = true;
        //        }
        //        else {
        //            this.msgHasBeenRead = false;
        //        }
        //    }
        //}

        this.userMessages = this.userMessages;
    }

    getFirstLetter(text: string) {
        return text.substring(0, 1);
    }

    //sentMsgListDataResv
}