import { MateItemClient } from "./MateItemClient";
import { CurrentUserDetailsClient } from "./CurrentUserDetailsClient";

export class mateItemWithRelatedObjectsClient {
    mainMateItem: MateItemClient;
    otherMateItemsByOwner: Array<MateItemClient>;
    otherMateItemsWithSameCatAndState: Array<MateItemClient>;
    currentUserDetails: CurrentUserDetailsClient;
}