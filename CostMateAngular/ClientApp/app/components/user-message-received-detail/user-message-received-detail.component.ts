import { Component, TemplateRef, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, ActivatedRouteSnapshot } from "@angular/router";
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { UserMessageClient } from "../../Models/userMessageClient";
import { ApiService } from "../../Services/api.service";
import { Title } from "@angular/platform-browser";
//import { ModalDirective } from "ngx-bootstrap";

@Component({
    selector: 'user-message-received-detail',
    templateUrl: './user-message-received-detail.component.html',
    styleUrls: ['./user-message-received-detail.component.css'],
})

export class UserMessageReceivedDetailComponent implements OnInit {
    userMessageDetail: UserMessageClient;
    modalRef: BsModalRef;
    //@ViewChild(ModalDirective) modal: ModalDirective;

    constructor(private route: ActivatedRoute, private router: Router, private modalService: BsModalService, private apiservice: ApiService, private pageTitle:Title) { }

    ngOnInit(): void {
        this.pageTitle.setTitle("Message detail");
        this.route.data.subscribe((data: any) => {
            this.userMessageDetail = data['msgDetailDataResv'];
            let usrMsg: UserMessageClient = this.userMessageDetail;
                if (usrMsg.sender.fullname.length > 13) {
                    usrMsg.sender.fullname = usrMsg.sender.fullname.substring(0, 13) + "...";
                }
        });
    }

    openDialogBox(template: TemplateRef<any>, evt: Event): void {
        evt.preventDefault();
        this.modalRef = this.modalService.show(template);
    }

    deleteMessage(msgId: any) {
        this.apiservice.deleteMessage(msgId).subscribe(res => { });
        this.apiservice.deletedItemId = msgId;
        this.modalRef.hide();
        this.router.navigate(['/dashboard/message']);
    }

    getFirstLetter(text: string) {
        return text.substring(0, 1);
    }

    sendSenderIdtoApiService(evt: Event) {
        evt.preventDefault();
        this.apiservice.currentSenderId = this.userMessageDetail.sender.id;
        this.apiservice.currentItemId = this.userMessageDetail.forMateItem.id;
        this.apiservice.currentItemExtractedTitle = this.userMessageDetail.titleExtractedFromItemTitle;
    }
}