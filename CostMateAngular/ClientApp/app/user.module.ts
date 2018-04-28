import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule, AlertModule } from 'ngx-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination'


import { UserProfileComponent } from "./components/user-profile/user-profile.component";
import { RouterModule, ActivatedRouteSnapshot } from "@angular/router";
import { UserProfileEditComponent } from "./components/user-profile-edit/user-profile-edit.component";
import { UserPostListComponent } from "./components/user-post-list/user-post-list.component";
import { UserPostDetailComponent } from "./components/user-post-detail/user-post-detail.component";
import { UserPostEditComponent } from "./components/user-post-edit/user-post-edit.component";
import { UserMessageReceivedListComponent } from "./components/user-message-received-list/user-message-received-list.component";
import { UserMessageReceivedDetailComponent } from "./components/user-message-received-detail/user-message-received-detail.component";
import { UserMessageReceivedReplyComponent } from "./components/user-message-received-reply/user-message-received-reply.component";
import { UserMessageSentListComponent } from "./components/user-message-sent-list/user-message-sent-list.component";
import { UserMessageSentDetailComponent } from "./components/user-message-sent-detail/user-message-sent-detail.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { UserMessageComponent } from "./components/user-message/user-message.component";
import { AppuserclientResolver } from "./Services/appuserclient-resover.service";
import { MessageListResolverService } from "./Services/message-list-resolver.service";
import { MessageDetailResolverService } from "./Services/message-detail-resolver";
import { UserPostListResolverService } from "./Services/user-post-list-resolver.service";
import { UserPostDetailResolverService } from "./Services/user-post-detail-resolver.service";
import { UserPostEditResolverService } from "./Services/user-post-edit-resolver.service";
import { SentMessageListResolverService } from "./Services/sent-message-list-resolver.service";
import { DashboardGuardService } from "./Services/dashboard-guard.service";
import { MessageSentDetailResolverService } from "./Services/message-sent-detail-resolver";

const CHILDROUTES = [
    {
        path: 'dashboard',
        canActivate: [DashboardGuardService],
        component: DashboardComponent,
        children: [
            { path: '', redirectTo: 'profile', pathMatch: 'full' },
            { path: 'profile', component: UserProfileComponent, resolve: { userdataResv: AppuserclientResolver} },
            { path: 'profile/edit', component: UserProfileEditComponent },
            { path: 'post', component: UserPostListComponent, resolve: { postListDataResv: UserPostListResolverService } },
            { path: 'post/:id', component: UserPostDetailComponent, resolve: { postDetailDataResv: UserPostDetailResolverService }  },
            { path: 'post/:id/edit', component: UserPostEditComponent, resolve: { postEditDataResv: UserPostEditResolverService } },
            {
                path: 'message',
                //canActivate: [DashboardGuardService],
                component: UserMessageComponent,
                children: [
                    { path: '', redirectTo: 'received', pathMatch: 'full' },
                    { path: 'received', component: UserMessageReceivedListComponent, resolve: { msgListDataResv: MessageListResolverService }  },
                    { path: 'received/:id', component: UserMessageReceivedDetailComponent, resolve: { msgDetailDataResv: MessageDetailResolverService }},
                    { path: 'received/:id/reply', component: UserMessageReceivedReplyComponent },
                    { path: 'sent', component: UserMessageSentListComponent, resolve: { sentMsgListDataResv: SentMessageListResolverService }},
                    { path: 'sent/:id', component: UserMessageSentDetailComponent, resolve: { sentMsgDetailDataResv: MessageSentDetailResolverService } },
                ]
            }
        ]
    }  
]

@NgModule({

    declarations: [
        DashboardComponent,
        UserProfileComponent,
        UserProfileEditComponent,
        UserMessageComponent,
        UserMessageReceivedListComponent,
        UserMessageReceivedDetailComponent,
        UserMessageReceivedReplyComponent,
        UserMessageSentListComponent,
        UserMessageSentDetailComponent,
        UserPostListComponent,
        UserPostDetailComponent,
        UserPostEditComponent
    ],
    imports: [
        RouterModule.forChild(CHILDROUTES),
        BrowserModule,
        ReactiveFormsModule,
        FormsModule,
        AlertModule.forRoot(),
        NgxPaginationModule
    ],
    providers: [AppuserclientResolver, MessageListResolverService, MessageDetailResolverService, MessageSentDetailResolverService, UserPostListResolverService, UserPostDetailResolverService, UserPostEditResolverService, SentMessageListResolverService, DashboardGuardService]
})
export class UserModule {
}