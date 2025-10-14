"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngagementEvent = void 0;
const engagement = 'engagement';
var EngagementEvent;
(function (EngagementEvent) {
    EngagementEvent["TARGET_CREATED"] = "engagement.target.created";
    EngagementEvent["LIKE_CREATED"] = "engagement.like.created";
    EngagementEvent["LIKE_DELETED"] = "engagement.like.deleted";
    EngagementEvent["COMMENT_CREATED"] = "engagement.comment.created";
    EngagementEvent["COMMENT_DELETED"] = "engagement.comment.deleted";
    EngagementEvent["ACTION_CREATED"] = "engagement.action.created";
    EngagementEvent["ACTION_DELETED"] = "engagement.action.deleted";
})(EngagementEvent || (exports.EngagementEvent = EngagementEvent = {}));
