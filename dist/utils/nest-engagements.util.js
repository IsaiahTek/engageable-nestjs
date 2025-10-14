"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nestEngagements = nestEngagements;
function nestEngagements(target, allTargets) {
    const nestedComments = (target.comments || []).map((comment) => {
        const commentTarget = allTargets.find((t) => t.targetType === 'comment' && t.targetId === comment.id);
        const replies = commentTarget
            ? (commentTarget.comments || []).map((reply) => nestEngagements({ ...commentTarget, comments: [reply] }, allTargets)
                .comments[0])
            : [];
        return {
            ...comment,
            likes: comment.likes || [],
            replies,
        };
    });
    return {
        ...target,
        comments: nestedComments,
    };
}
//# sourceMappingURL=nest-engagements.util.js.map