import { Component, TemplateRef, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, ActivatedRouteSnapshot } from "@angular/router";
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { UserMessageClient } from "../../Models/userMessageClient";
import { ApiService } from "../../Services/api.service";
import { Title } from "@angular/platform-browser";

@Component({
    selector: 'user-message-sent-detail',
    templateUrl: './user-message-sent-detail.component.html',
    styleUrls: ['./user-message-sent-detail.component.css']
})
/** UserMessageSentDetail component*/
export class UserMessageSentDetailComponent {

    userMessageDetail: UserMessageClient;

    constructor(private route: ActivatedRoute, private router: Router, private modalService: BsModalService, private apiservice: ApiService, private pageTitle: Title) {

    }

    ngOnInit(): void {
        this.pageTitle.setTitle("Sent Message detail");
        this.route.data.subscribe((data: any) => {
            this.userMessageDetail = data['sentMsgDetailDataResv'];
            let usrMsg: UserMessageClient = this.userMessageDetail;
            //if (usrMsg.receiver.fullname.length > 13) {
            //    usrMsg.receiver.fullname = usrMsg.receiver.fullname.substring(0, 13) + "...";
            //}
        });
    }

    getFirstLetter(text: string) {
        return text.substring(0, 1);
    }
}