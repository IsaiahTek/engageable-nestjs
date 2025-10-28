// import { EngagementTarget } from '../entities/engagement-target.entity';

// export function nestEngagements(
//   target: EngagementTarget,
//   allTargets: EngagementTarget[],
// ): EngagementTarget {
//   const nestedComments = (target.comments || []).map((comment) => {
//     const commentTarget = allTargets.find(
//       (t) => t.targetType === 'comment' && t.targetId === comment.id,
//     );

//     const replies = commentTarget
//       ? (commentTarget.comments || []).map(
//           (reply) =>
//             nestEngagements({ ...commentTarget, comments: [reply] }, allTargets)
//               .comments[0],
//         )
//       : [];

//     return {
//       ...comment,
//       likes: comment.likes || [],
//       replies,
//     };
//   });

//   return {
//     ...target,
//     comments: nestedComments,
//   };
// }
