import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { Title } from "@angular/platform-browser";
import { ApiService } from "../../Services/api.service";

@Component({
    selector: 'user-message-received-reply',
    templateUrl: './user-message-received-reply.component.html',
    styleUrls: ['./user-message-received-reply.component.css']
})
export class UserMessageReceivedReplyComponent {
    msgTitle: any;
    replyMsgFormGroup: FormGroup;
   
    constructor(private httpclient: HttpClient, private router: Router, private route: ActivatedRoute, private pageTitle: Title, private fb: FormBuilder, private apiservice: ApiService) {}

    ngOnInit(): void {
        this.pageTitle.setTitle("Message Reply");
        this.replyMsgFormGroup = this.fb.group({
            message: ['', Validators.required]
        });

        this.msgTitle = this.apiservice.currentItemExtractedTitle;
        //alert(this.msgTitle);
    }

    sndMsgAndNotify(value: any) {

        let messageVal = value.message;

        let messageValTrimmedLength = (<string>messageVal).trim().length;

        if (messageValTrimmedLength < 1) {
            alert(`You are trying to submit an empty Value`);
            this.replyMsgFormGroup.reset();
        }
        else {
            var userMessage = {
                "body": value.message
            }
            //How do i get receiver id over here-- it's not the owner of posted item like before(item-detail.component), rather, the person that sent this message'
            if (this.apiservice.currentSenderId) {

                //mateItemId: number, receiverId: number, msg: any
                this.apiservice.sendMessage(this.apiservice.currentItemId, this.apiservice.currentSenderId, userMessage, "reply").subscribe(res => {
                    alert(res.toString());
                    //this.apiservice.currentSenderId = null;
                    //this.apiservice.currentItemId = null;
                    //this.apiservice.currentItemExtractedTitle = null;
                })
            }
            else {
                alert("You're trying to send a message without a sender");
            }
            alert("Message sent!");
            this.replyMsgFormGroup.reset();
        }

    }
}