import { AppUserClient } from "./AppUserClient";
import { MateItemClient } from "./MateItemClient";

export class UserMessageClient {
    id: number;
    body: string;
    titleExtractedFromItemTitle: string;
    hasBeenRead: boolean;
    dateSent: Date;
    sender: AppUserClient;
    receiver: AppUserClient;
    forMateItem: MateItemClient;
}