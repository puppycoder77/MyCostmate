import { Component, OnInit, TemplateRef, OnDestroy } from '@angular/core';
import { ApiService } from "../../Services/api.service";
import { BsModalService, BsModalRef } from "ngx-bootstrap";
import { Router, ActivatedRoute } from "@angular/router";
import { MateItemClient } from "../../Models/MateItemClient";
import { Title } from "@angular/platform-browser";

@Component({
    selector: 'user-post-detail',
    templateUrl: './user-post-detail.component.html',
    styleUrls: ['./user-post-detail.component.css']
})

export class UserPostDetailComponent implements OnInit {
    fromdelmsg: any;
    modalRef: BsModalRef;
    mateItemCl: MateItemClient;
   
    constructor(private route: ActivatedRoute, private router: Router, private modalService: BsModalService, private apiservice: ApiService, private pageTitle:Title) {}

    ngOnInit(): void {
        this.pageTitle.setTitle("Published Item detail");
        this.route.data.subscribe((data: any) => {
            this.mateItemCl = data['postDetailDataResv'];
            //alert(JSON.stringify(this.mateItemCl));
        });
    }

    openDialogBox(template: TemplateRef<any>, evt: Event) {
        evt.preventDefault();
        this.modalRef = this.modalService.show(template);
    }

    deleteItem(itemId: number) {
        this.apiservice.deleteMateItem(itemId).subscribe((res: any) => { 
            this.fromdelmsg = res.delmsg;
            this.apiservice.msgFrmDelPost = res.delmsg;
        });
        this.apiservice.deletedPostItemId = itemId;
        this.modalRef.hide();
        this.router.navigate(['/dashboard/post']);
    }
}